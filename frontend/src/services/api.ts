import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  verifyOtp: (data: { email: string; otp: string }) =>
    api.post('/auth/verify-otp', data),
  
  logout: () => api.post('/auth/logout'),
  
  getMe: () => api.get('/auth/me'),
  
  forgotPassword: (data: { email: string }) =>
    api.post('/auth/forgot-password', data),
  
  resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
    api.post('/auth/reset-password', data),
};

// Chat API
export const chatAPI = {
  sendMessage: (message: string) =>
    api.post('/bot/chat', { message }),
  
  createSchedule: (message: string) =>
    api.post('/bot/schedule', { message }),
};

export default api;