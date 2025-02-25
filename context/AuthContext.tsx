"use client";

import { createContext, useContext, ReactNode } from "react";
import { signal } from "@preact/signals-react";

interface User {
  id: string;
  username: string;
  role: "user" | "admin";
}

const userSignal = signal<User | null>(null);

interface AuthContextType {
  user: typeof userSignal;
  setUser: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const setUser = (user: User) => {
    userSignal.value = user;
  };

  const logout = () => {
    userSignal.value = null;
  };

  return (
    <AuthContext.Provider value={{ user: userSignal, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
