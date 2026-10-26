import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { TOKEN_KEY, setUnauthorizedHandler } from '../api/client';
import * as apiCalls from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)));

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    apiCalls
      .getMe()
      .then(setUser)
      .catch(() => logout())
      .finally(() => setChecking(false));
  }, [logout]);

  const login = useCallback(async (email, password) => {
    const { token, user: loggedInUser } = await apiCalls.login(email, password);
    localStorage.setItem(TOKEN_KEY, token);
    setUser(loggedInUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, checking }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
