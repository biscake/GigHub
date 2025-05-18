import { type AuthContextType } from "../types/auth";
import api from "./api";

export const setupInterceptors = (auth: AuthContextType) => {
  api.interceptors.request.use((config) => {
    if (auth.accessToken) {
      config.headers.Authorization = `Bearer ${auth.accessToken}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
  
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const res = await api.post('/api/refreshtoken');
  
          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
  
          return api(originalRequest);
        } catch (error) {
          auth.logout();
          return Promise.reject(error);
        }
      }
  
      return Promise.reject(error);
    }
  )
};