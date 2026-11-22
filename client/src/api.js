import axios from 'axios';

// In production set VITE_API_URL to your deployed backend, e.g. https://my-api.onrender.com/api
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

export const errMsg = (e) => e.response?.data?.message || 'Something went wrong. Please try again';

export default api;
