// lib/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/auth/login', // Remplacez par l'URL de votre API
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Récupérez le token depuis le localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
