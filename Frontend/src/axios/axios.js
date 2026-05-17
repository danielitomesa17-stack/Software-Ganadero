import axios from 'axios';

const api = axios.create({
  baseURL: 'https://software-ganadero.onrender.com/api'
});

export default api;