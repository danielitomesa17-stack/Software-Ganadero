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

  // Si el servidor responde 403 (Acceso Denegado por bloqueo o falta de permisos)
  if (response.status === 403) {
    console.warn("Acceso denegado (403). Cerrando sesión y redirigiendo...");
    localStorage.removeItem('danubio_session'); // Eliminamos la sesión real
    window.location.href = '/login';            // Redirección inmediata
    throw new Error("Usuario bloqueado o sin permisos necesarios");
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