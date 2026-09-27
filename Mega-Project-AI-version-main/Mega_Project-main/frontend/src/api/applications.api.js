import client from './client.js';

export const apply = (data) => client.post('/applications/apply', data);
export const mine = () => client.get('/applications/mine');
export const withdraw = (applicationId) => client.post(`/applications/${applicationId}/withdraw`);
export const applicantsForJob = (jobId) => client.get(`/applications/job/${jobId}`);
export const shortlist = (applicationId) => client.patch(`/applications/${applicationId}/shortlist`);
export const setStatus = (applicationId, status) => client.patch(`/applications/${applicationId}/status`, { status });
