import { type AxiosError } from 'axios';
import { jwtDecode } from "jwt-decode";
import { type ReactNode, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Loading } from "../components/Loading";
import api from '../lib/api';
import { ejectInterceptors, setupInterceptors } from '../lib/apiInterceptors';
import type { ApiErrorResponse } from '../types/api';
import type { JwtPayload, User } from "../types/auth";
import type { LoginFormInputs } from "../types/form";
import { AuthContext } from "./AuthContext";

const idempotencyKey = uuidv4();

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAccessToken = async () => {
      const rememberMe = localStorage.getItem("rememberMe") === "true";
      const sessionActive = sessionStorage.getItem("sessionActive") === "true";

      if (rememberMe || sessionActive) {
        try {
          const res = await api.post('/api/auth/refreshtoken', { rememberMe }, {
            headers: {
              'Content-Type': 'application/json',
              'Idempotency-Key': idempotencyKey
            }
          });
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

      setLoading(false);
    };

    fetchAccessToken();
  }, [])

  useEffect(() => {
    if (accessToken) {
      setupInterceptors({ accessToken, user, login, logout, setAccessToken });
    }
  }, [accessToken, user])

  const login = async (data: LoginFormInputs) => {
    try {
      const res = await api.post('/api/auth/login', data, { headers: { 'Content-Type': 'application/json' } });
      
      const token = res.data.accessToken; 

      if (token) {
        setAccessToken(token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const decoded = jwtDecode(token) as JwtPayload;
        setUser({ id: decoded.sub, username: decoded.username });

        localStorage.setItem("rememberMe", data.rememberMe ? "true" : "false");
        sessionStorage.setItem("sessionActive", "true");
      }

      return { success: true };
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;

      const message = err.response?.data?.message;

      return { success: false, error: message || "Something went wrong. Please try again" };
    } finally {
      setLoading(false);
    }
  }

  const logout = async () => {
    try {
      const res = await api.post('/api/auth/logout');

      setAccessToken(null);
      setUser(null);
      localStorage.removeItem("rememberMe");
      sessionStorage.removeItem("sessionActive");
  
      delete api.defaults.headers.common.Authorization;
      ejectInterceptors();

      return { success: true, data: res.data };
    } catch(error) {
      const err = error as AxiosError<ApiErrorResponse>;

      const message = err.response?.data?.message;

      return { success: false, error: message || "Something went wrong. Please try again" };
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <AuthContext.Provider value={{ accessToken, user, login, logout, setAccessToken }}>
      { children }
    </AuthContext.Provider>
  )
}
