import client from './client';

export const login = (email, password) => client.post('/auth/login', { email, password }).then((r) => r.data);
export const register = (payload) => client.post('/auth/register', payload).then((r) => r.data);
export const registerStaff = (payload) => client.post('/auth/register-staff', payload).then((r) => r.data);
export const logout = (refreshToken) => client.post('/auth/logout', { refreshToken });
export const me = () => client.get('/auth/me').then((r) => r.data);
