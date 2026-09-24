# LokRozgar_AI Backend API Documentation (v1)

Base URL: `http://localhost:8000/api/v1`

---

## 1. Authentication Module (`/auth`)

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/auth/send-otp` | `POST` | Public | Send OTP to phone number |
| `/auth/verify-otp` | `POST` | Public | Verify phone OTP |
| `/auth/register` | `POST` | Public | Register new user (worker or employer) |
| `/auth/login` | `POST` | Public | Login with phone & password |
| `/auth/logout` | `POST` | Authenticated | Logout user session |
| `/auth/refresh-token` | `POST` | Public | Refresh JWT access token |
| `/auth/change-password` | `POST` | Authenticated | Change current user password |
| `/auth/reset-password` | `POST` | Public | Reset password with OTP verification |
| `/auth/sessions` | `GET` | Authenticated | List active user sessions |
| `/auth/sessions/:sessionId/revoke` | `POST` | Authenticated | Revoke specific session |
| `/auth/add-role` | `POST` | Authenticated | Add additional role (worker/employer) |

---

## 2. User Module (`/users`)

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/users/me` | `GET` | Authenticated | Fetch current user & profile details |
| `/users/language` | `PATCH` | Authenticated | Update preferred language ('mr', 'hi', 'en') |
| `/users/account` | `DELETE` | Authenticated | Delete user account & associated profile data |
| `/users/device-token` | `POST` | Authenticated | Register FCM device token for push notifications |

---

## 3. Worker Profile Module (`/worker-profile`)

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/worker-profile/me` | `GET` | Worker/Admin | Fetch worker profile |
| `/worker-profile` | `POST` | Worker/Admin | Create or update worker profile details |
| `/worker-profile/availability` | `PATCH` | Worker/Admin | Toggle availability ('available', 'busy', 'unavailable') |
| `/worker-profile/location` | `PATCH` | Worker/Admin | Update worker location [longitude, latitude] |
| `/worker-profile/radius` | `PATCH` | Worker/Admin | Update preferred work radius in km |
| `/worker-profile/categories` | `PATCH` | Worker/Admin | Update preferred job category IDs |
| `/worker-profile/photo` | `POST` | Worker/Admin | Upload profile photo to Cloudinary |

---

## 4. Employer Profile Module (`/employer-profile`)

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/employer-profile/me` | `GET` | Employer/Admin | Fetch employer profile |
| `/employer-profile` | `POST` | Employer/Admin | Create or update employer profile details |
| `/employer-profile/photo` | `POST` | Employer/Admin | Upload business photo to Cloudinary |
| `/employer-profile/business` | `PATCH` | Employer/Admin | Update business details |

---

## 5. Catalog Module (`/catalog`)

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/catalog/categories` | `GET` | Public | List categories with language resolution (`?lang=mr/hi/en`) |
| `/catalog/skills` | `GET` | Public | List skills with language resolution |
| `/catalog/categories` | `POST` | Admin | Create job category |
| `/catalog/categories/:categoryId` | `PATCH` | Admin | Update job category |
| `/catalog/categories/:categoryId` | `DELETE` | Admin | Deactivate job category |
| `/catalog/skills` | `POST` | Admin | Create skill |
| `/catalog/skills/:skillId` | `PATCH` | Admin | Update skill |
| `/catalog/skills/:skillId` | `DELETE` | Admin | Deactivate skill |

---

## 6. Job Module (`/jobs`)

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/jobs/search` | `GET` | Public | Search & filter jobs with pagination & language picker |
| `/jobs/nearby` | `GET` | Public | Fetch nearby jobs using `$geoNear` |
| `/jobs/recommended` | `GET` | Worker | Fetch AI-recommended jobs for worker |
| `/jobs` | `POST` | Employer/Admin | Create job with auto-translation |
| `/jobs/employer/mine` | `GET` | Employer/Admin | List employer's posted jobs |
| `/jobs/:jobId` | `PATCH` | Employer/Admin | Update job details |
| `/jobs/:jobId/cancel` | `POST` | Employer/Admin | Cancel job |
| `/jobs/:jobId/close` | `POST` | Employer/Admin | Mark job completed and closed |

---

## 7. Application Module (`/applications`)

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/applications/apply` | `POST` | Worker | Apply for job (calculates match score) |
| `/applications/:applicationId/withdraw` | `POST` | Worker | Withdraw application |
| `/applications/mine` | `GET` | Worker | List worker's applications |
| `/applications/job/:jobId` | `GET` | Employer/Admin | List applicants for job ranked by score |
| `/applications/:applicationId/shortlist` | `PATCH` | Employer/Admin | Shortlist application |
| `/applications/:applicationId/status` | `PATCH` | Employer/Admin | Accept/reject application (increments filled count) |

---

## 8. Saved Jobs (`/saved-jobs`), Offers (`/offers`), Shifts (`/shifts`), Payments (`/payments`), Ratings (`/ratings`), Disputes (`/disputes`), Chat (`/chat`), Notifications (`/notifications`), & Admin (`/admin`)

For full endpoint definitions, request/response payload examples, and Socket.io event lists, refer to the source codebase and schema files.
