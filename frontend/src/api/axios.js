import axios from 'axios';

const api = axios.create({
  baseURL: 'https://v8bkgs6c-5000.inc1.devtunnels.ms/' ,
  withCredentials: true
});

export default api;