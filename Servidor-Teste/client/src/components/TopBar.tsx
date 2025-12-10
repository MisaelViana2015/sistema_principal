import { LogOut, Settings, Home, Shield } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { Button } from "./ui/button";

/**
 * TOP BAR ATUALIZADO
 * - Engrenagem: Configurações (placeholder)
 * - Escudo: Painel Admin (Base Replit)
 * - Casa: Início
 * - Tema e Logout
 */

export function TopBar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Lado Esquerdo: Logo e Info User */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-foreground">Rota Verde</h1>
          {user && (
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <span>•</span>
              <span className="font-medium">{user.nome}</span>
              {isAdmin && (
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  Admin
                </span>
              )}
            </div>
          )}
        </div>

        {/* Lado Direito: Menus e Ações */}
        <div className="flex items-center gap-2">

          {/* Botão Casa (Sempre visível para navegar) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            title="Início"
            className={location.pathname === "/" ? "bg-accent" : ""}
          >
            <Home className="w-5 h-5 text-foreground" />
          </Button>

          {/* Botões Administrativos */}
          {isAdmin && (
            <>
              {/* Painel Admin (Base Replit) - ESCUDO */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/admin")}
                title="Painel Administrativo (Base Replit)"
                className={isAdminRoute ? "bg-accent text-primary" : ""}
              >
                <Shield className="w-5 h-5" />
              </Button>

              {/* Configurações (Geral) - ENGRENAGEM */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/settings")} // Futura página de settings
                title="Configurações"
              >
                <Settings className="w-5 h-5 text-foreground" />
              </Button>
            </>
          )}

          {/* Tema (Sol/Lua) */}
          <ThemeToggle />

          {/* Logout */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Sair"
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
