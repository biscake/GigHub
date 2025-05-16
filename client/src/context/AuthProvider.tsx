import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children } : { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    // TODO: decode jwt if exist
  }, [])

  const login = (data) => {
    // TODO: decode jwt

  }

  const logout = () => {
    // TODO: remove token
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
