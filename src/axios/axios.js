import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // La dirección de tu server.js
});

export default api;