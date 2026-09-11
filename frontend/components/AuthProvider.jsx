"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); const [loading, setLoading] = useState(true);
  const refreshUser = useCallback(async () => { if (!localStorage.getItem("token")) { setUser(null); setLoading(false); return null; } try { const profile = await api("/auth/me"); setUser(profile); return profile; } catch { localStorage.removeItem("token"); setUser(null); return null; } finally { setLoading(false); } }, []);
  useEffect(() => { const timer = setTimeout(() => { refreshUser(); }, 0); return () => clearTimeout(timer); }, [refreshUser]);
  const signIn = (token, profile) => { localStorage.setItem("token", token); setUser(profile); setLoading(false); };
  const logout = async () => { try { await api("/auth/logout", { method: "POST" }); } catch {} localStorage.removeItem("token"); setUser(null); };
  return <AuthContext.Provider value={{ user, loading, signIn, logout, refreshUser }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error("useAuth must be used inside AuthProvider"); return context; }