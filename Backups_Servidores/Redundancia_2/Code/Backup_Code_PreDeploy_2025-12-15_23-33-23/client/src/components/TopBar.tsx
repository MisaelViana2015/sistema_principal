import { LogOut, Settings } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../lib/api";
import { useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../contexts/ThemeContext";
import { Button } from "./ui/button";

/**
 * TOP BAR ATUALIZADO
 * - Engrenagem: Configurações (placeholder)
 * - Escudo: Painel Admin (Base Replit)
 * - Casa: Início
 * - Tema e Logout
 */


export function TopBar() {
  const { user: contextUser, logout, isAdmin: contextIsAdmin } = useAuth();
  // Fallback to localStorage user if context is not yet ready or failed
  const user = contextUser || authService.getUser();
  const isAdmin = user?.role === 'admin';
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAdminRoute = location.pathname.startsWith("/admin");

  const styles = {
    header: {
      position: 'sticky' as const,
      top: 0,
      zIndex: 10,
      backgroundColor: isDark ? '#1a2332' : '#ffffff',
      borderBottom: `1px solid ${isDark ? '#374151' : '#e2e8f0'}`,
      padding: '0.75rem 1rem',
      transition: 'background-color 0.2s ease-in-out'
    },
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      maxWidth: '1280px',
      margin: '0 auto'
    }
  };

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        {/* Lado Esquerdo: Info User */}
        <div className="flex items-center gap-6">
          {user && (
            <div className="flex items-center gap-3">
              <span className={`font-medium text-sm transition-colors ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {user.nome}
              </span>
            </div>
          )}
        </div>

        {/* Lado Direito: Menus e Ações */}
        <div className="flex items-center gap-3">

          {/* Botão REPLIT (Legacy) */}
          {/* Botão REPLIT (Legacy) */}
          {isAdmin && (
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate("/admin-legacy")}
              style={{
                backgroundColor: isDark ? 'rgba(79, 70, 229, 0.2)' : '#e0e7ff',
                color: isDark ? '#818cf8' : '#4338ca',
                fontWeight: 'bold',
                fontSize: '12px',
                height: '32px',
                padding: '0 1rem',
                marginRight: '0.5rem'
              }}
              className="hover:opacity-80 transition-opacity"
            >
              REPLIT
            </Button>
          )}

          {/* Configurações */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/settings")}
            className={`transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
            title="Configurações"
          >
            <Settings className="w-5 h-5" />
          </Button>

          {/* Tema */}
          <ThemeToggle />

          {/* Logout */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Sair"
            className={`ml-1 transition-colors ${isDark
              ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
              : 'text-red-500 hover:text-red-700 hover:bg-red-50'
              }`}
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
