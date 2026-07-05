import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import type { User } from "@workspace/api-client-react";
import { useLocation } from "wouter";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("zentrivex_token");
    }
    return null;
  });
  const [_, setLocation] = useLocation();

  const { data: user, isLoading, refetch } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      enabled: !!token,
      retry: false,
    }
  });

  const handleLogin = (newToken: string) => {
    localStorage.setItem("zentrivex_token", newToken);
    setToken(newToken);
    refetch();
  };

  const handleLogout = () => {
    localStorage.removeItem("zentrivex_token");
    setToken(null);
    setLocation("/login");
  };

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading: isLoading && !!token, login: handleLogin, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
