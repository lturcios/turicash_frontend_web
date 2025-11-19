import axios from 'axios';

// --- CONFIGURA TU URL BASE DEL BACKEND ---
// Si corres el backend localmente y vite en el puerto 5173,
// el backend debería estar en otro puerto (ej: 3000)
// Puedes configurar esto con variables de entorno creando un archivo .env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'; 
// -------------------------------------------

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Log para debugging (puedes comentarlo en producción)
console.log('API configurada con baseURL:', API_URL);

// --- Interceptor para añadir el Token ---
// Tomará el token que (simulamos) guardar en localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Manejador de errores global (opcional pero recomendado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('authToken');
      // Redirigir al login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;