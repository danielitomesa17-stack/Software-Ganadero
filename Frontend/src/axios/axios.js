import axios from 'axios';

// Crear la instancia personalizada apuntando a Render
const api = axios.create({
  baseURL: 'https://software-ganadero.onrender.com/api',
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