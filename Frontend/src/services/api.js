// Frontend/src/services/api.js

/**
 * Obtiene el token de la sesión guardada en localStorage.
 */
const getSessionToken = () => {
  try {
    const sesion = localStorage.getItem('danubio_session');
    return sesion ? JSON.parse(sesion).token : null;
  } catch (error) {
    console.error("Error al leer la sesión de localStorage:", error);
    return null;
  }
};

/**
 * Realiza una petición fetch autenticada de forma centralizada.
 * Maneja automáticamente:
 * 1. La resolución de la URL base dinámica (localhost vs Render).
 * 2. La inyección del token de autorización Bearer.
 * 3. La redirección a /login y limpieza de sesión si el backend retorna 403 (cuenta bloqueada/sin permisos).
 */
export const authenticatedFetch = async (endpoint, options = {}) => {
  const token = getSessionToken();
  const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : 'https://software-ganadero.onrender.com/api';

  // Si el endpoint ya es una URL completa, la usamos directa; si no, le concatenamos la base.
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  // Si el servidor responde 401 (Autenticación fallida o token expirado/cuenta bloqueada)
  if (response.status === 401) {
    console.warn("Sesión inválida o cuenta bloqueada (401). Cerrando sesión y redirigiendo...");
    localStorage.removeItem('danubio_session'); // Eliminamos la sesión real
    window.location.href = '/login';            // Redirección inmediata
    throw new Error("Sesión expirada o cuenta bloqueada");
  }

  // Si el servidor responde 403 (Falta de permisos)
  if (response.status === 403) {
    throw new Error("No tienes permisos para realizar esta acción");
  }

  return response;
};

// API wrappers for Medicamentos

export const getMedicamentos = async () => {
  const res = await authenticatedFetch('/medicamentos');
  return res.json();
};

export const crearMedicamento = async (data) => {
  const res = await authenticatedFetch('/medicamentos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json();
};

export const actualizarMedicamento = async (id, data) => {
  const res = await authenticatedFetch(`/medicamentos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.json();
};

export const eliminarMedicamento = async (id) => {
  const res = await authenticatedFetch(`/medicamentos/${id}`, {
    method: 'DELETE',
  });
  return res.json();
};

// API wrappers for Producción

export const getProduccion = async () => {
  const res = await authenticatedFetch('/produccion');
  return res.json();
};

export const crearProduccion = async (data) => {
  const res = await authenticatedFetch('/produccion', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json();
};

export const actualizarProduccion = async (id, data) => {
  const res = await authenticatedFetch(`/produccion/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.json();
};

export const eliminarProduccion = async (id) => {
  const res = await authenticatedFetch(`/produccion/${id}`, {
    method: 'DELETE',
  });
  return res.json();
};