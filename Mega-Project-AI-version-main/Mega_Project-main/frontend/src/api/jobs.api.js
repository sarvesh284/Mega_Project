import client from './client.js';

export const searchJobs = (params = {}) => client.get('/jobs/search', { params });
export const getRecommendedJobs = () => client.get('/jobs/recommended');
export const getEmployerJobs = () => client.get('/jobs/employer/mine');
export const createJob = (data) => client.post('/jobs', data);
export const closeJob = (jobId) => client.post(`/jobs/${jobId}/close`);
export const cancelJob = (jobId) => client.post(`/jobs/${jobId}/cancel`);
export const findJobById = async (id) => {
  const res = await searchJobs({ limit: 100 });
  const docs = res?.docs || (Array.isArray(res) ? res : []);
  return docs.find((job) => String(job._id) === String(id)) || null;
};
