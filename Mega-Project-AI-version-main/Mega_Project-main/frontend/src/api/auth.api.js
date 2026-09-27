import client from './client.js';

export const register = (data) => client.post('/auth/register', data);
export const login = (credentials) => client.post('/auth/login', credentials);
export const logout = () => client.post('/auth/logout');
export const me = () => client.get('/users/me');
