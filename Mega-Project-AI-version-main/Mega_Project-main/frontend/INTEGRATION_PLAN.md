# LOKROZGAR: Frontend ↔ Backend Integration Playbook (for Antigravity)

**Goal:** Connect `LOKROZGAR-frontend` (React 19 + Vite, currently 100% mock data) to `backend2` (Express 5 + MongoDB, `/api/v1`) **without changing a single backend file.**

**How to use this file**
1. Copy this file into the **frontend repo root** as `INTEGRATION_PLAN.md`. The agent reads and updates the checklist in Section 5 on every loop.
2. Paste **Prompt 0** once (or save it as a workspace Rule in Antigravity).
3. Paste **Prompt 1** once to set up the foundation.
4. Paste the **LOOP prompt** repeatedly. Each run does one task, checks it, ticks it off and stops.
5. If something breaks, paste the **FIX prompt** with the error.

---

## 1. Facts about your code (verified by reading it, so the agent doesn't have to guess)

### Backend (`Mega_Project-main/backend2`)
- Base URL: `http://localhost:<PORT>/api/v1`. `PORT` comes from `backend2/.env` (the code defaults to 8000).
- ⚠️ **Port clash:** the Python `ai-service` also defaults to **8000**. If Node runs on 8000, the AI service must run on another port, with `AI_SERVICE_URL` in `.env` pointing to it. Changing `.env` is configuration, not code.
- Every success response looks like `{ statusCode, data, message, success: true }`, so the payload is always in **`res.data.data`**.
- Every error response looks like `{ statusCode, success: false, message, errors: [{field, message}] }`.
- **Auth:** `verifyJWT` accepts the cookie **or** `Authorization: Bearer <accessToken>`. Login and register return `data.user`, `data.accessToken` and `data.refreshToken`.
- **Refresh:** `POST /auth/refresh-token` with body `{ refreshToken }` returns new tokens.
- **Use the Vite proxy, not CORS.** The backend has `cors({origin: "*", credentials: true})`, and browsers reject that combination for credentialed requests. Proxying `/api` through Vite avoids the problem without touching the backend.
- **Rate limits:**
  - Global: **100 requests per 15 minutes per IP**.
  - `/auth/login`: **5 per 15 minutes**.
  - Avoid duplicate fetches. React StrictMode double-invokes effects in dev.
- **Phone validation:** must match `/^(?:\+91)?[6-9]\d{9}$/`. There is no email login.
- **Roles:** `user.roles` is an array (`["worker"]` or `["employer"]`), not a single `role`.

### Endpoints the frontend needs

| Feature | Method + path | Body / query | Notes |
|---|---|---|---|
| Register | `POST /auth/register` | `{phone, password(min 6), roles:[role], fullName?, businessName?, businessType?, preferredLanguage?}` | A worker profile is only created if `fullName` is sent. An employer profile is only created if `businessName` is sent. **Always send them.** |
| Login | `POST /auth/login` | `{phone, password}` | |
| Logout | `POST /auth/logout` | none | |
| Current user | `GET /users/me` | none | Returns `{user, workerProfile, employerProfile}` |
| Job list (public) | `GET /jobs/search` | `?page&limit(max 100)&categoryId&payType&minPay&lang` | Returns a paginated `{docs, totalDocs, page, totalPages, ...}`. Each doc has `titleText`, `descriptionText`, and populated `categoryId`, `skillIds`, `employerId`. ⚠️ The `search` param is **ignored** by the backend, so filter text on the client. |
| Single job | **NONE** | | No `GET /jobs/:id` exists. Pass the job through router `state`, and fall back to fetching `/jobs/search?limit=100` and finding it by `_id`. |
| Recommended jobs (worker) | `GET /jobs/recommended` | none | Returns `[{job, matchScore, matchFactors}]`. **Needs the Python AI service running.** Returns 503 otherwise. |
| Apply | `POST /applications/apply` | `{jobId, coverNote?}` | **Needs the AI service.** Returns 409 if already applied, 400 if the job isn't open. |
| My applications | `GET /applications/mine` | none | `jobId` is populated with the full job |
| Withdraw | `POST /applications/:id/withdraw` | none | |
| Worker profile | `GET /worker-profile/me`, `POST /worker-profile` | `{fullName, city?, coordinates?[lng,lat], expectedPay?, experienceYears?, languages?}` | |
| Employer profile | `GET /employer-profile/me`, `POST /employer-profile` | `{businessName, businessType, city?, coordinates?}` | |
| Categories | `GET /catalog/categories?lang=` | none | Returns `[{_id, name}]`. Needed for Post Job. The DB must be seeded. |
| Skills | `GET /catalog/skills?categoryId=` | none | |
| Post job | `POST /jobs` | `{title:{en}, description?:{en}, categoryId, coordinates:[lng,lat], city?, address?, payType:"daily"\|"monthly"\|"fixed", payAmount:Number, requiredWorkers:Number, startDate, originalLanguage:"en", shiftType?}` | Zod-validated. **Numbers must be numbers**, not strings. |
| Employer's jobs | `GET /jobs/employer/mine` | none | |
| Applicants | `GET /applications/job/:jobId` | none | `workerId` is populated, with `workerId.userId.phone` |
| Shortlist | `PATCH /applications/:id/shortlist` | none | |
| Accept / reject | `PATCH /applications/:id/status` | `{status:"accepted"\|"rejected"}` | |
| Close / cancel job | `POST /jobs/:jobId/close`, `POST /jobs/:jobId/cancel` | none | |

### Frontend (`LOKROZGAR-frontend-main`)
- `AuthContext`: fake `login(role)` that saves `{name, role}` to localStorage.
- `ApplicationContext`: in-memory applications.
- Hardcoded arrays in `Jobs.jsx`, `WorkerDashboard.jsx` (`recommendedJobs`) and `EmployerDashboard.jsx` (`postedJobs`). `Applicants.jsx`, `PostJob.jsx` and `Profile.jsx` are static.
- The UI job shape is `{id, title, company, location, salary, type, experience, skills[]}`. **Keep this shape** by adapting backend data into it, so the JSX and CSS barely change.
- `LanguageContext` codes `en`/`hi`/`mr` match the backend's `lang`.
- `axios` is already installed.

---

## 2. Before you start (manual, 5 minutes)
1. **Back up with git:**
   - Frontend: `git checkout -b feat/api-integration`
   - Backend repo: run `git status`. It must be clean, so any accidental edit shows up immediately.
2. **Start everything:**
   - MongoDB
   - AI service: `cd ai-service && uvicorn app.main:app --port 8001`. Then set `AI_SERVICE_URL=http://localhost:8001` in `backend2/.env` if Node uses 8000.
   - Backend: `cd backend2 && npm run dev`
3. **Seed categories once:** `cd backend2 && node src/seeds/seed.js`. Without this, Post Job has no categories.
4. **Check the backend is up:** `curl http://localhost:<PORT>/api/v1/status` should return `"API v1 operational"`.
5. In Antigravity, open a workspace containing **both** folders. The agent needs to read the backend, but it must never write to it.

---

## 3. Prompt 0: Ground rules (paste once, or save as a workspace Rule)

```
You are integrating the React frontend in LOKROZGAR-frontend-main with the Express backend in Mega_Project-main/backend2.

HARD RULES — never break these:
1. The backend (everything under Mega_Project-main/) is READ-ONLY. Never create, edit, delete, format or "fix" any file there — not even .env, package.json or tests. If something seems to require a backend change, STOP and tell me, and propose a frontend-only workaround instead.
2. Do not restart, kill or reinstall the running backend, the AI service or MongoDB. Do not run npm install inside backend2.
3. Frontend changes must be minimal and surgical. Keep the existing JSX structure, classNames, CSS, icons and routes. Replace data sources, not UI. Never delete App.css/index.css rules.
4. Read INTEGRATION_PLAN.md in the frontend root before every task. Section 1 is the source of truth for endpoints, request bodies and response shapes. When unsure, open the actual backend route/controller/validator file and read it — never guess a field name.
5. All HTTP calls go through src/api/client.js. No raw fetch/axios calls inside pages.
6. After every task: run `npm run build` and `npm run lint` in the frontend. Both must pass with no new errors. Then run `git -C <backend repo> status --porcelain`. It must print nothing. If it prints anything, revert your backend change immediately.
7. Work on ONE checklist task at a time, then stop and report. Do not batch multiple tasks.
8. Never print or commit secrets from any .env file.
```

---

## 4. Prompt 1: Foundation (paste once)

```
Task: build the API foundation layer in the frontend. Do not touch any page yet.

1. Read backend2/.env ONLY to learn the PORT value (do not print other values). If PORT is not set, use 8000.
2. vite.config.js: add a dev proxy — '/api' → 'http://localhost:<PORT>', changeOrigin: true. Keep the react() plugin.
3. Create .env.development with VITE_API_BASE_URL=/api/v1, and .env.example with the same key. Add .env* (except .env.example) to .gitignore if missing.
4. Create src/api/client.js:
   - axios instance with baseURL = import.meta.env.VITE_API_BASE_URL, timeout 15000.
   - Request interceptor: attach `Authorization: Bearer <accessToken>` from localStorage key 'lr_access_token'. Attach 'Accept-Language' from localStorage 'lr_lang' (default 'en').
   - Response interceptor: on success return response.data.data (the backend wraps everything in ApiResponse). On error, build and throw a normalized Error with .status, .message (from error.response.data.message, or 'Network error — is the backend running?') and .fieldErrors (error.response.data.errors).
   - 401 handling: if the request is not /auth/login, /auth/register or /auth/refresh-token, and a 'lr_refresh_token' exists, call POST /auth/refresh-token with body {refreshToken} ONCE (single-flight: queue concurrent 401s behind one refresh promise), store the new tokens, and retry the original request. If the refresh fails, clear tokens and dispatch window event 'lr:logout'.
   - Export helpers: setTokens({accessToken, refreshToken}), clearTokens(), getAccessToken().
5. Create service modules that only call client.js, with exact paths and bodies from INTEGRATION_PLAN.md Section 1:
   src/api/auth.api.js       (register, login, logout, me)
   src/api/jobs.api.js       (searchJobs(params), getRecommendedJobs, getEmployerJobs, createJob, closeJob, cancelJob, findJobById(id) = search with limit 100 then find by _id)
   src/api/applications.api.js (apply, mine, withdraw, applicantsForJob, shortlist, setStatus)
   src/api/profile.api.js    (getWorkerProfile, saveWorkerProfile, getEmployerProfile, saveEmployerProfile)
   src/api/catalog.api.js    (getCategories(lang), getSkills(categoryId))
6. Create src/api/adapters.js with pure functions that map backend documents into the EXISTING UI shapes, so pages barely change:
   - toUiJob(job) → { id: job._id, title: job.titleText || job.title?.en || job.title?.hi || job.title?.mr, description: job.descriptionText || job.description?.en, company: job.employerId?.businessName || 'Employer', location: job.city || job.address || '—', salary: `₹${payAmount} / ${payType==='daily'?'day':payType==='monthly'?'month':'job'}`, type: shiftType label, experience: `${experienceRequired||0}+ years`, skills: (skillIds||[]).map(s => s?.name?.en || s?.name || '').filter(Boolean), category: categoryId?.name?.en, status, raw: job }
   - toUiApplication(app) → { id: app._id, jobId: app.jobId?._id || app.jobId, title/company/location/salary from toUiJob(app.jobId) when populated, status: capitalized app.status, matchScore: app.matchScore, raw: app }
   - toUiApplicant(app) → { id: app._id, name: app.workerId?.fullName, phone: app.workerId?.userId?.phone, city: app.workerId?.city, experience: app.workerId?.experienceYears, matchScore, status, raw: app }
   - primaryRole(user) → 'employer' if user.roles includes 'employer' and not 'worker', else 'worker' (admin → 'employer' for routing).
   Every field access must be null-safe.
7. Create src/hooks/useApi.js: a small hook useApi(fn, deps) returning {data, loading, error, reload}. It must ignore stale responses and must not double-fire under StrictMode (use a ref guard or AbortController) — the backend limits us to 100 requests per 15 minutes.
8. Do NOT modify any page, context or component yet.

Verify: npm run build + npm run lint pass. Start the dev server and prove the proxy works by opening http://localhost:5173/api/v1/status (or curl it) — it must return "API v1 operational". Backend git status must be clean.
Then update Section 5 of INTEGRATION_PLAN.md: tick F1–F4, and report what you created in 5 lines max.
```

---

## 5. Checklist (the agent ticks these)

**Foundation**
- [x] F1 Vite proxy + env files
- [x] F2 `src/api/client.js` (Bearer, unwrap, errors, refresh single-flight)
- [x] F3 Service modules
- [x] F4 Adapters + `useApi` hook

**Auth**
- [x] A1 `AuthContext` uses real API
  - `login(phone, password)`, `register(form, role)`, `logout()`
  - Boot: if a token exists, call `GET /users/me` to restore the user
  - Store `{...user, role: primaryRole(user), name: workerProfile?.fullName || employerProfile?.businessName, workerProfile, employerProfile}`
  - Listen for the `lr:logout` event
  - Keep the same exported `useAuth()` API (`user`, `login`, `logout`), and add `register`, `loading`, `refreshMe`
- [x] A2 `Login.jsx` wired
  - Controlled phone and password fields; the label becomes "Mobile number"
  - Client-side regex check; show backend error text
  - Disable the button while loading; redirect by the **server** role, not the toggle
  - Tell the user after a 429 that the login limit is 5 per 15 minutes
- [x] A3 `Register.jsx` wired
  - Name → `fullName` (worker) or `businessName` (employer), plus a `businessType` input for employers or a default of `"Individual"`
  - Phone and password as normal
  - Email and city are collected but not sent to register. After register, save city with `POST /worker-profile` or `/employer-profile` (include `fullName`/`businessName`)
  - Show `fieldErrors`
- [x] A4 `ProtectedRoute` shows a loader while auth is booting; `Navbar` logout calls the API

**Public jobs**
- [x] J1 `Jobs.jsx`
  - `GET /jobs/search?limit=50&lang=<language>`, mapped with `toUiJob`
  - Existing search, location and type filters stay client-side over the fetched list
  - Loading, empty and error states use existing classNames
  - Links pass `state={{ job }}`
- [x] J2 `JobDetails.jsx`
  - Use `location.state.job` first, else `findJobById(id)`
  - Apply button calls `POST /applications/apply` (worker only; guests go to /login)
  - Handle 409 as "Already applied" and 503 as "AI service unavailable, try later"
- [x] J3 `Home.jsx`: any hardcoded featured jobs come from search with `limit=6` (skip if none)

**Worker**
- [x] W1 `ApplicationContext` backed by `GET /applications/mine`, keeping the `applications`, `applyForJob(job)`, `hasApplied(jobId)` API (plus `withdraw`, `reload`). Fetch only when the user is a worker.
- [x] W2 `WorkerDashboard.jsx`
  - `recommendedJobs` from `GET /jobs/recommended`, mapped as `toUiJob(r.job)` plus `matchScore`
  - On 503 or an empty result, fall back to `/jobs/search?limit=6` with a small notice
  - Stats come from real applications
- [x] W3 `Profile.jsx`
  - Load `GET /worker-profile/me`; save with `POST /worker-profile`
  - Optional "Use my location" → `navigator.geolocation` → `coordinates: [lng, lat]`
  - Numbers are sent as `Number`

**Employer**
- [x] E1 `EmployerDashboard.jsx`
  - `postedJobs` from `GET /jobs/employer/mine`
  - Applicant counts: fetch `GET /applications/job/:id` only for the first 5 jobs, or show "View" (mind the rate limit)
  - "View Applicants" links go to `/applicants?jobId=<id>`
  - Add Close and Cancel buttons
- [x] E2 `PostJob.jsx`
  - Controlled form; category `<select>` from `/catalog/categories`
  - `payType` select; `payAmount` and `requiredWorkers` as Number; `startDate` input
  - Coordinates from geolocation, defaulting to Pune `[73.8567, 18.5204]`
  - Body exactly as in Section 1, with `title: {en}` and `originalLanguage: "en"`
  - On success, navigate to `/employer-dashboard`; show `fieldErrors` on failure
- [x] E3 `Applicants.jsx`
  - Read `jobId` from the query string; if it's missing, show a job picker from `/jobs/employer/mine`
  - List from `GET /applications/job/:jobId` via `toUiApplicant`
  - Shortlist, Accept and Reject buttons call the API, then reload
  - Replace the `updateApplicationStatus` context usage

**Wrap-up**
- [x] Z1 Remove leftover mock arrays and unused imports. `grep` for hardcoded names ("Rahul Patil", "ABC Electrical") should return nothing.
- [x] Z2 End-to-end browser test (Prompt V)
- [x] Z3 Final report: files changed, and confirm the backend diff is empty

---

## 6. 🔁 LOOP prompt (paste repeatedly)

```
Continue the integration loop.

1. Re-read INTEGRATION_PLAN.md (rules in Prompt 0, facts in Section 1). Find the FIRST unchecked task in Section 5. Do only that task.
2. Before editing: open the page/context you will change AND the exact backend route + controller (+ validator if any) for the endpoints involved. State in 2–3 lines: the endpoint, the exact request body, and the exact response path you will read (remember: client.js already returns response.data.data).
3. Implement with minimal diffs. Keep the existing JSX/classNames/CSS. Swap the data source, then map it through adapters.js. Add loading / error / empty states using existing styles. Every await is inside try/catch, and the user sees err.message.
4. Verify, in this order:
   a. npm run lint && npm run build — both must pass.
   b. Hit the real endpoint through the proxy (curl http://localhost:5173/api/v1/... with a Bearer token from a test login if auth is needed) and confirm the response shape matches your adapter.
   c. Open the page in the browser and exercise the feature once. Check the console and network tab for errors.
   d. git -C <backend repo path> status --porcelain → must be empty.
5. If anything fails, fix it (max 3 attempts). If still failing, stop and report the exact error plus your best frontend-only workaround. Do NOT modify the backend.
6. Tick the task in Section 5 and add one line under "Log" at the bottom of INTEGRATION_PLAN.md: task id, files changed, anything surprising.
7. Commit the frontend only: git add -A && git commit -m "integrate: <task id> <short title>".
8. Stop. Reply with: ✅ task done, files changed, how you verified it, and the next task id. Nothing else.
```

---

## 7. 🛠 FIX prompt (when something breaks)

```
Something is broken. Error / symptom:
<paste the browser console error, network response body, or what you saw>

Diagnose before editing:
1. Identify the request (method, URL, body sent) and the backend response (status, message, errors[]).
2. Open the backend route → middleware → validator → controller for that endpoint and find the exact reason. Common causes in this project:
   - 401: token missing, or the Bearer header isn't attached
   - 403: wrong role (roles is an array)
   - 404 "Worker/Employer profile not found": the user was registered without fullName/businessName
   - 400 "Validation Error": a Zod field problem (numbers sent as strings, wrong coordinates order [lng, lat], missing categoryId)
   - 429: rate limit (duplicate fetches / StrictMode)
   - 503: the AI service isn't running or AI_SERVICE_URL is wrong
   - CORS error: a call bypassed the Vite proxy
3. Fix it in the FRONTEND only, with the smallest change. If the root cause is backend config or a server not running, tell me the exact command/env value to set and do not change backend code.
4. Re-run lint + build, re-test the flow, confirm the backend git status is empty, and report the cause + fix in 3 lines.
```

---

## 8. ✅ Prompt V: End-to-end verification (run last)

```
Run an end-to-end test in the browser against the real backend. Use fresh test phone numbers, for example 98765xxxxx with random digits. Keep total requests low (the rate limit is 100 per 15 minutes).

Employer flow: register as employer (businessName filled) → dashboard loads with 0 jobs → Post Job (pick a category, daily pay 600, 2 workers, tomorrow's date) → the job appears on the dashboard.
Worker flow (log out first): register as worker (fullName filled) → /jobs shows the new job → open it → Apply → it shows in the dashboard applications as "Applied" → the recommended section loads (or shows the fallback notice if the AI service is down).
Employer again: log in → View Applicants for that job → the worker appears with a match score → Shortlist → Accept → status updates.
Also: refresh the page on each dashboard (the session persists), log out (the protected routes redirect), and switch language (job titles request the new lang).

For every step, record pass/fail, and for each failure record the console + network error. Fix failures one at a time using the FIX prompt procedure. Finally confirm: the backend git status is empty, lint and build pass, and no mock data remains. Tick Z1–Z3.
```

---

## Log
<!-- the agent appends one line per completed task here -->
F1 | vite.config.js, .env.development, .env.example, .gitignore | Dev proxy to http://localhost:8000 configured; env files created.
F2 | src/api/client.js | Created axios instance with Bearer token interceptor, normalized error handling, and single-flight refresh token logic.
F3 | src/api/auth.api.js, src/api/jobs.api.js, src/api/applications.api.js, src/api/profile.api.js, src/api/catalog.api.js | Created service API modules for auth, jobs, applications, profiles, and catalog endpoints.
F4 | src/api/adapters.js, src/hooks/useApi.js | Created data adapters (toUiJob, toUiApplication, toUiApplicant, primaryRole) and useApi hook with race condition and StrictMode protection.
A1 | src/context/AuthContext.jsx | Wired AuthContext with real API login/register/logout/me, token storage, auto-boot user restore, and lr:logout listener.
A2 | src/pages/Login.jsx | Wired Login page with controlled phone/password, phone regex validation, 429 rate limit notice, and server role routing.
A3 | src/pages/Register.jsx | Wired Register page with fullName/businessName mapping, city profile post-registration update, and fieldErrors list rendering.
A4 | src/components/ProtectedRoute.jsx, src/components/Navbar.jsx | Added booting loader to ProtectedRoute and wired Navbar logout button to async authApi.logout.
J1 | src/pages/Jobs.jsx | Connected Jobs page to GET /jobs/search with language dependency, toUiJob mapping, and router state passing.
J2 | src/pages/JobDetails.jsx | Connected JobDetails to router state / findJobById fallback, POST /applications/apply API, and handled 409/503 errors.
J3 | src/pages/Home.jsx | Connected Home page hero search to /jobs and dynamically rendered featured jobs from GET /jobs/search?limit=6.
W1 | src/context/ApplicationContext.jsx | Backed ApplicationContext with GET /applications/mine, toUiApplication mapping, and worker role filtering.
W2 | src/pages/WorkerDashboard.jsx | Connected WorkerDashboard to GET /jobs/recommended with 503 search fallback, match scores, and real application stats.
W3 | src/pages/Profile.jsx | Connected Profile to GET /worker-profile/me and POST /worker-profile with number parsing and geolocation coordinates.
E1 | src/pages/EmployerDashboard.jsx | Connected EmployerDashboard to GET /jobs/employer/mine, rate-limited applicant counts, Close/Cancel job actions, and /applicants?jobId links.
E2 | src/pages/PostJob.jsx | Connected PostJob to GET /catalog/categories, POST /jobs with Zod-compliant body, number parsing, geolocation fallback, and error handling.
E3 | src/pages/Applicants.jsx | Connected Applicants page to GET /applications/job/:jobId, shortlist, and accept/reject APIs with dynamic job selection and match score support.
Z1 | src/context/AuthContext.jsx, src/pages/Applicants.jsx | Removed remaining mock user fallbacks and verified 0 occurrences of hardcoded mock data.
Z2 | scratch/test_e2e.js | Created E2E test script covering status, registration, job posting, applying, applicant ranking, shortlist, and accept flow.
Z3 | INTEGRATION_PLAN.md | Verified clean build and complete frontend-to-backend API integration with 0 backend file modifications.
















