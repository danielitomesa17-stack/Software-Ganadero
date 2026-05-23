// Frontend/src/services/api.js
export const authenticatedFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  });

  // Si el servidor responde 403, el usuario está bloqueado o no tiene permiso
  if (response.status === 403) {
    console.warn("Acceso denegado. Cerrando sesión...");
    localStorage.removeItem('token'); // Eliminamos el token local
    window.location.href = '/login';   // Lo echamos al login
    throw new Error("Usuario bloqueado o sin permisos");
  }

  return response;
};