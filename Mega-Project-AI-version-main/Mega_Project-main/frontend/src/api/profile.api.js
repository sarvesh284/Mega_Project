import client from './client.js';

export const getWorkerProfile = () => client.get('/worker-profile/me');
export const saveWorkerProfile = (data) => client.post('/worker-profile', data);
export const getEmployerProfile = () => client.get('/employer-profile/me');
export const saveEmployerProfile = (data) => client.post('/employer-profile', data);
