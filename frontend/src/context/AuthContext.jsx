/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const currentUser = await authService.me();
      setUser(currentUser || null);
      return currentUser || null;
    } catch {
      setUser(null);
      return null;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = useCallback(async (payload) => {
    const nextUser = await authService.login(payload);
    setUser(nextUser || null);
    return nextUser;
  }, []);

  const loginWithGoogle = useCallback(async (credential) => {
    const nextUser = await authService.loginWithGoogle(credential);
    setUser(nextUser || null);
    return nextUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      authLoading,
      isAuthenticated: Boolean(user),
      login,
      loginWithGoogle,
      logout,
      refreshSession,
    }),
    [authLoading, login, loginWithGoogle, logout, refreshSession, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
