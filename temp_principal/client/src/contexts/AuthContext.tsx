import { createContext, useContext, useState, useEffect } from "react";
import type { Driver } from "@shared/schema";
import { queryClient } from "../lib/queryClient";
import { api } from "../lib/api";

interface AuthContextType {
  user: Driver | null;
  setUser: (user: Driver | null) => void;
  isAdmin: boolean;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Use api instance to ensure token is sent
        const response = await api.get("/auth/me");
        if (response.data && response.data.success) {
          setUser(response.data.data);
        } else {
          setUser(null);
        }
      } catch (error) {
        // Silent error for auth check
        setUser(null);
        // Do NOT clear queryClient here to avoid flashing content if it's just a temporary failure
        // But if 401, axios interceptor handles redirect.
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const logout = () => {
    setUser(null);
    queryClient.clear();
    api.post("/auth/logout").catch(console.error);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, setUser, isAdmin, isLoading, logout }}>
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
