import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexus_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('nexus_token');
      window.location.href = '/login';
    }
    // Show upgrade prompt for plan limit errors
    if (err.response?.status === 403 && err.response?.data?.requiresUpgrade) {
      import('react-hot-toast').then(({ default: toast }) => {
        toast(
          (t) => {
            const el = document.createElement('span');
            el.innerHTML = `${err.response.data.message} <a href="/pricing" style="color:#818cf8;text-decoration:underline">Upgrade now</a>`;
            return el.outerHTML;
          },
          { duration: 8000, style: { background: '#1e293b', color: '#f1f5f9' } }
        );
      });
    }
    return Promise.reject(err);
  }
);

export default api;
