import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance } from 'axios';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Detectar automáticamente el entorno
const getBaseURL = () => { 
  // En producción, usa la misma URL del sitio
  if (import.meta.env.PROD) {
    return `${window.location.origin}`;
  }
  // En desarrollo, usa localhost
  return 'http://localhost:3000';
};

// Crear instancia de axios
const api = axios.create({ 
  baseURL: getBaseURL()
});

console.log('🌐 API Base URL:', getBaseURL());

// ⚠️ IMPORTANTE: Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    // Rutas públicas que NO necesitan token
    const publicRoutes = ['/auth/login', '/auth/register']; // Sin /api/
    const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));
    
    if (!isPublicRoute) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🎫 Token agregado al request:', config.url);
      } else {
        console.log('⚠️ No hay token en localStorage para:', config.url);
      }
    } else {
      console.log('🔓 Ruta pública (sin token):', config.url);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);

// Interceptor para manejar errores 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Rutas donde NO queremos redireccionar automáticamente
    const noRedirectRoutes = ['/auth/login', '/auth/register', '/auth/me']; // Sin /api/
    const isNoRedirectRoute = noRedirectRoutes.some(route => error.config?.url?.includes(route));
    
    if (error.response?.status === 401 && !isNoRedirectRoute) {
      console.log('❌ Error 401 - Redirigiendo a login');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };