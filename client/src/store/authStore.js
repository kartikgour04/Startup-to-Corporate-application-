import { create } from 'zustand';
import api from '../utils/api';

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  token: localStorage.getItem('nexus_token'),
  loading: false,
  initialized: false,

  init: async () => {
    const token = localStorage.getItem('nexus_token');
    if (!token) return set({ initialized: true });
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.user, profile: data.profile, initialized: true });
    } catch {
      localStorage.removeItem('nexus_token');
      set({ user: null, token: null, initialized: true });
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('nexus_token', data.token);
      set({ user: data.user, token: data.token, loading: false });
      return { success: true };
    } catch (err) {
      set({ loading: false });
      const d = err.response?.data;
      return { success: false, message: d?.message || 'Login failed', requiresVerification: d?.requiresVerification, email: d?.email };
    }
  },

  register: async (formData) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/register', formData);
      set({ loading: false });
      // Registration no longer auto-logs in — must verify email first
      return { success: true, requiresVerification: data.requiresVerification, email: formData.email, message: data.message, emailSent: data.emailSent, devVerifyLink: data.devVerifyLink };
    } catch (err) {
      set({ loading: false });
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    }
  },

  logout: () => {
    localStorage.removeItem('nexus_token');
    set({ user: null, profile: null, token: null });
    window.location.href = '/';
  },

  updateUser: (user) => set({ user }),
  updateProfile: (profile) => set({ profile }),
}));

export default useAuthStore;
