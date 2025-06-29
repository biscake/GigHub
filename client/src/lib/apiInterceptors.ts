import { v4 as uuidv4 } from "uuid";
import api from "./api";
import type { ApiInterceptorParams } from "../types/api";

let requestInterceptorId: number | null = null;
let responseInterceptorId: number | null = null;

export const setupInterceptors = ({ logout, setAccessToken, accessToken }: ApiInterceptorParams) => {
  if (requestInterceptorId !== null) {
    api.interceptors.request.eject(requestInterceptorId);
  }

  if (responseInterceptorId !== null) {
    api.interceptors.response.eject(responseInterceptorId);
  }

  requestInterceptorId = api.interceptors.request.use((config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  responseInterceptorId = api.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      const rememberMe = localStorage.getItem("rememberMe") === "true";
  
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const idempotencyKey = uuidv4();

          const res = await api.post('/api/auth/refreshtoken', { rememberMe }, {
            headers: {
              'Content-Type': 'application/json',
              'Idempotency-Key': idempotencyKey
            }
          });
  
          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;

          setAccessToken(res.data.accessToken);
  
          return api(originalRequest);
        } catch (error) {
          logout();
          return Promise.reject(error);
        }
      }
  
      return Promise.reject(error);
    }
  )
};

export const ejectInterceptors = () => {
  if (requestInterceptorId !== null) {
    api.interceptors.request.eject(requestInterceptorId);
    requestInterceptorId = null;
  }
  if (responseInterceptorId !== null) {
    api.interceptors.response.eject(responseInterceptorId);
    responseInterceptorId = null;
  }
};