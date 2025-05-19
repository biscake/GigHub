import { type AxiosError } from 'axios';
import { jwtDecode } from "jwt-decode";
import { type ReactNode, useEffect, useState } from "react";
import api from '../lib/api';
import { setupInterceptors } from '../lib/apiInterceptors';
import type { ApiErrorResponse } from '../types/api';
import type { JwtPayload, User } from "../types/auth";
import type { LoginFormInputs } from "../types/form";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchAccessToken = async () => {
      if (localStorage.getItem("rememberMe") === "true") {
        try {
          const res = await api.post('/api/refreshtoken');
          const token = res.data.accessToken;
  
          if (token) {
            setAccessToken(token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const decoded = jwtDecode(token) as JwtPayload;
            setUser({ id: decoded.sub, username: decoded.username });
          }
        } catch (err) {
          console.log(err);
          setUser(null);
        }
      }
    }

    fetchAccessToken();
  }, [])

  useEffect(() => {
    if (accessToken) {
      setupInterceptors({ accessToken, user, login, logout });
    }
  }, [accessToken, user])

  const login = async (data: LoginFormInputs) => {
    try {
      const res = await api.post('/api/login', data, { headers: { 'Content-Type': 'application/json' } });
      
      const token = res.data.accessToken; 

      if (token) {
        setAccessToken(token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const decoded = jwtDecode(token) as JwtPayload;
        setUser({ id: decoded.sub, username: decoded.username });

        localStorage.setItem('rememberMe', data.rememberMe ? "true" : "false");
      }

      return { success: true };
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;

      const message = err.response?.data?.message;

      return { success: false, error: message || "Something went wrong. Please try again" };
    }
  }

  const logout = async () => {
    const res = await api.post('/api/logout');
    
    if (res.data.success) {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem("rememberMe");
  
      delete api.defaults.headers.common.Authorization;
    }
  }

  return (
    <AuthContext.Provider value={{ accessToken, user, login, logout }}>
      { children }
    </AuthContext.Provider>
  )
}
