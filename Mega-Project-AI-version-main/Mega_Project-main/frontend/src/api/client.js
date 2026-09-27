import axios from 'axios';

const ACCESS_TOKEN_KEY = 'lr_access_token';
const REFRESH_TOKEN_KEY = 'lr_refresh_token';
const LANG_KEY = 'lr_lang';

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setTokens = ({ accessToken, refreshToken }) => {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 15000,
});

client.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const lang = localStorage.getItem(LANG_KEY) || 'en';
    config.headers['Accept-Language'] = lang;
    return config;
  },
  (error) => Promise.reject(error)
);

let refreshPromise = null;

client.interceptors.response.use(
  (response) => {
    return response.data?.data !== undefined ? response.data.data : response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh-token');

    const refreshToken = getRefreshToken();

    if (status === 401 && !isAuthEndpoint && refreshToken && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
          refreshPromise = axios
            .post(`${baseURL}/auth/refresh-token`, { refreshToken })
            .finally(() => {
              refreshPromise = null;
            });
        }

        const refreshRes = await refreshPromise;
        const newTokens = refreshRes.data?.data || refreshRes.data;

        if (newTokens?.accessToken) {
          setTokens({
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken || refreshToken,
          });
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return client(originalRequest);
        }
      } catch {
        clearTokens();
        window.dispatchEvent(new Event('lr:logout'));
      }
    }

    const message =
      error.response?.data?.message || 'Network error — is the backend running?';
    const normalizedError = new Error(message);
    normalizedError.status = status || 500;
    normalizedError.fieldErrors = error.response?.data?.errors || [];

    return Promise.reject(normalizedError);
  }
);

export default client;
