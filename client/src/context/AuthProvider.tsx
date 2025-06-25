import { type AxiosError } from 'axios';
import { jwtDecode } from "jwt-decode";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import api from '../lib/api';
import { ejectInterceptors, setupInterceptors } from '../lib/apiInterceptors';
import type { ApiErrorResponse, PostLoginResponse } from '../types/api';
import type { JwtPayload, User } from "../types/auth";
import type { LoginFormInputs } from "../types/form";
import { AuthContext } from "./AuthContext";
import { Loading } from '../components/Loading';
import { clearUserData, deleteEncryptedE2eeKey } from '../lib/indexeddb';
import { useIdempotencyKey } from '../hooks/useIdempotencyKey';
import { v4 as uuidv4 } from "uuid";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { get, clear } = useIdempotencyKey();
  const deviceIdRef = useRef<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);

  useEffect(() => {
    const devId = localStorage.getItem("deviceId");
    if (devId) {
      deviceIdRef.current = devId;
      return;
    }

    localStorage.setItem("deviceId", uuidv4());
  }, [])

  useEffect(() => {
    const fetchAccessToken = async () => {
      const rememberMe = localStorage.getItem("rememberMe") === "true";
      const sessionActive = sessionStorage.getItem("sessionActive") === "true";

      if (rememberMe || sessionActive) {
        try {
          const res = await api.post('/api/auth/refreshtoken', { rememberMe }, {
            headers: {
              'Content-Type': 'application/json',
              'Idempotency-Key': get()
            }
          });

          if (!res.data) {
            return;
          }

          const token = res.data.accessToken;
  
          if (token) {
            setAccessToken(token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const decoded = jwtDecode(token) as JwtPayload;
            setUser({ id: decoded.sub, username: decoded.username });
          }
        } catch (err) {
          console.error(err);
          setUser(null);
        } finally {
          clear();
        }
      }

      setLoading(false);
    };

    fetchAccessToken();
  }, [clear, get])

  const login = useCallback(async (data: LoginFormInputs) => {
    try {
      const deviceId = deviceIdRef.current;
      if (!deviceId) throw new Error("Device Id not initialized");
      const res = await api.post<PostLoginResponse>('/api/auth/login', { ...data, deviceId }, { headers: { 'Content-Type': 'application/json' } });
      
      const token = res.data.accessToken;
      const userId = res.data.user.id;

      if (token && userId) {
        const lastLoggedInUser = localStorage.getItem("lastLoginUser");
        if (lastLoggedInUser !== userId.toString()) {
          localStorage.setItem("lastLoginUser", userId.toString());
          await clearUserData();
        }
        
        setPassword(data.password);
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
  }, [setPassword])

  const logout = useCallback(async () => {
    try {
      if (!user) return;

      const res = await api.post('/api/auth/logout');

      await deleteEncryptedE2eeKey(user.id);
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
  }, [user])

  useEffect(() => {
    if (accessToken) {
      setupInterceptors({ accessToken, logout, setAccessToken });
    }
  }, [accessToken, logout])

  return (
    <AuthContext.Provider value={{ accessToken, user, login, logout, setAccessToken, deviceIdRef, password, setPassword }}>
      {loading ? <Loading /> : children}
    </AuthContext.Provider>
  )
}
