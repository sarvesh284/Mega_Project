export const toUiJob = (job) => {
  if (!job) return null;

  const title =
    job.titleText ||
    job.title?.en ||
    job.title?.hi ||
    job.title?.mr ||
    'Untitled Job';

  const description =
    job.descriptionText ||
    job.description?.en ||
    job.description?.hi ||
    job.description?.mr ||
    '';

  const company =
    job.employerId?.businessName ||
    job.employerId?.fullName ||
    job.company ||
    'Employer';

  const location = job.city || job.address || '—';

  const payAmount = job.payAmount || 0;
  const payType = job.payType || 'daily';
  const payPeriod =
    payType === 'daily'
      ? 'day'
      : payType === 'monthly'
      ? 'month'
      : 'job';
  const salary = `₹${payAmount} / ${payPeriod}`;

  const type = job.shiftType || (payType === 'monthly' ? 'Full-time' : 'Part-time');
  const experience = `${job.experienceRequired || 0}+ years`;

  const skills = Array.isArray(job.skillIds)
    ? job.skillIds
        .map((s) => (typeof s === 'object' && s ? s.name?.en || s.name || '' : String(s)))
        .filter(Boolean)
    : Array.isArray(job.skills)
    ? job.skills
    : [];

  const category =
    typeof job.categoryId === 'object' && job.categoryId
      ? job.categoryId.name?.en || job.categoryId.name || ''
      : '';

  return {
    id: job._id || job.id,
    title,
    description,
    company,
    location,
    salary,
    type,
    experience,
    skills,
    category,
    status: job.status || 'open',
    raw: job,
  };
};

export const toUiApplication = (app) => {
  if (!app) return null;

  const jobObj = typeof app.jobId === 'object' && app.jobId ? app.jobId : null;
  const uiJob = jobObj ? toUiJob(jobObj) : null;

  const rawStatus = app.status || 'applied';
  const status = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);

  return {
    id: app._id || app.id,
    jobId: jobObj ? jobObj._id || jobObj.id : app.jobId,
    title: uiJob ? uiJob.title : app.title || 'Job Application',
    company: uiJob ? uiJob.company : app.company || 'Employer',
    location: uiJob ? uiJob.location : app.location || '—',
    salary: uiJob ? uiJob.salary : app.salary || '—',
    status,
    matchScore: app.matchScore || 0,
    appliedAt: app.createdAt,
    raw: app,
  };
};

export const toUiApplicant = (app) => {
  if (!app) return null;

  const worker = typeof app.workerId === 'object' && app.workerId ? app.workerId : {};
  const user = typeof worker.userId === 'object' && worker.userId ? worker.userId : {};

  const name = worker.fullName || user.fullName || app.name || 'Worker';
  const phone = user.phone || worker.phone || app.phone || '—';
  const city = worker.city || app.city || '—';
  const experience =
    worker.experienceYears !== undefined && worker.experienceYears !== null
      ? `${worker.experienceYears} years`
      : '—';

  return {
    id: app._id || app.id,
    name,
    phone,
    city,
    experience,
    matchScore: app.matchScore || 0,
    status: app.status || 'applied',
    coverNote: app.coverNote || '',
    raw: app,
  };
};

export const primaryRole = (user) => {
  if (!user || !Array.isArray(user.roles)) return 'worker';
  if (user.roles.includes('admin')) return 'employer';
  if (user.roles.includes('employer') && !user.roles.includes('worker')) return 'employer';
  if (user.roles.includes('employer')) return 'employer';
  return 'worker';
};
