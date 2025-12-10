import { createContext, useContext, useState, useEffect } from "react";
import type { Driver } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

interface AuthContextType {
  user: Driver | null;
  setUser: (user: Driver | null) => void;
  isAdmin: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Driver | null>(null);

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          // User not authenticated - clear cache to prevent stale data
          setUser(null);
          queryClient.clear();
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
        queryClient.clear();
      }
    };
    checkAuth();
  }, []);

  const logout = () => {
    setUser(null);
    // Clear all React Query cache on logout to prevent stale data
    queryClient.clear();
    fetch("/api/auth/logout", { method: "POST" });
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, setUser, isAdmin, logout }}>
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
