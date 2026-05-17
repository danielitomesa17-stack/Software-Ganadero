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
  (response) => {
    // Si la respuesta es exitosa (Status 200-299), pasa directo al 'try' de tus componentes
    return response;
  },
  (error) => {
    // ⚠️ CRUCIAL: Si el servidor responde con error (401, 403, 500, etc.)
    // Obligamos a Axios a rechazar la promesa para que el error caiga en el bloque 'catch' de React.
    // Sin esta línea, el Frontend se queda en el limbo esperando ("pending").
    return Promise.reject(error);
  }
);

export default api;