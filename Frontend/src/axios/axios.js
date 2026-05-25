import axios from 'axios';

// Crear la instancia personalizada apuntando de forma dinámica según el hostname
const api = axios.create({
  baseURL: window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : 'https://software-ganadero.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor de respuestas para gestionar el flujo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;