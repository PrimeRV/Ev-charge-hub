import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("ev_token"));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ev_user")); } catch { return null; }
  });

  function login(tok, usr) {
    localStorage.setItem("ev_token", tok);
    localStorage.setItem("ev_user", JSON.stringify(usr));
    setToken(tok);
    setUser(usr);
  }

  function logout() {
    localStorage.removeItem("ev_token");
    localStorage.removeItem("ev_user");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
