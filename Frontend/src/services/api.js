export const authenticatedFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.status === 403) {
    localStorage.removeItem('token');
    window.location.href = '/login'; 
    throw new Error("Usuario bloqueado");
  }

  return response;
};