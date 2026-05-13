import axios from 'axios';

const api = axios.create({
  baseURL: 'https://software-ganadero-production.up.railway.app/api', // La dirección de tu server.js
});

export default api;