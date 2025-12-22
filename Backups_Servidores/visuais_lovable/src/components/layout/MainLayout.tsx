import { ReactNode } from "react";
import Header from "./Header";
import BottomNav from "./BottomNav";

type Tab = "turno" | "corridas" | "caixa" | "desempenho" | "veiculos";

interface MainLayoutProps {
  children: ReactNode;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const MainLayout = ({ children, activeTab, onTabChange }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        activeTab={activeTab} 
        onTabChange={onTabChange}
        showDesktopNav={true}
      />
      <main className="flex-1 pt-20 pb-24 md:pb-8 px-4 max-w-7xl mx-auto w-full overflow-y-auto">
        {children}
      </main>
      {/* Only show bottom nav on mobile */}
      <div className="md:hidden">
        <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
      </div>
    </div>
  );
};

export default MainLayout;
