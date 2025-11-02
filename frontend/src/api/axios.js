import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://v8bkgs6c-5000.inc1.devtunnels.ms/api'  // forwarded backend URL (production)
    : 'http://localhost:5000/api',
  withCredentials: true
});

export default api;