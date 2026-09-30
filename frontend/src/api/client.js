// Single Axios instance used by the whole frontend. Requests always go to
// the API Gateway (relative /api/v1/... URLs, proxied by Vite in dev or by
// nginx in the Docker build) - the frontend never calls a microservice
// directly, per the architecture requirement.
import axios from 'axios';

const client = axios.create({ baseURL: '/api/v1' });

let accessToken = null;
let refreshToken = null;
let onLogout = null;

export function setTokens(tokens) {
  accessToken = tokens.accessToken || null;
  refreshToken = tokens.refreshToken || null;
  if (accessToken) localStorage.setItem('eduerp_access_token', accessToken);
  if (refreshToken) localStorage.setItem('eduerp_refresh_token', refreshToken);
}

export function loadStoredTokens() {
  accessToken = localStorage.getItem('eduerp_access_token');
  refreshToken = localStorage.getItem('eduerp_refresh_token');
  return { accessToken, refreshToken };
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('eduerp_access_token');
  localStorage.removeItem('eduerp_refresh_token');
}

export function registerLogoutHandler(fn) {
  onLogout = fn;
}

client.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Automatic access-token refresh: on a 401, try once to exchange the
// refresh token for a new pair and replay the original request. If that
// also fails, the refresh token is dead - log the user out.
let refreshingPromise = null;

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retried && refreshToken) {
      original._retried = true;
      try {
        if (!refreshingPromise) {
          refreshingPromise = axios
            .post('/api/v1/auth/refresh', { refreshToken })
            .then((res) => {
              setTokens(res.data);
              return res.data;
            })
            .finally(() => {
              refreshingPromise = null;
            });
        }
        await refreshingPromise;
        original.headers.Authorization = `Bearer ${accessToken}`;
        return client(original);
      } catch (refreshErr) {
        clearTokens();
        if (onLogout) onLogout();
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

export default client;
