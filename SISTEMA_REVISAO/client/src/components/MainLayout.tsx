import { ReactNode } from "react";
import HeaderNew from "./layout/HeaderNew";
import BottomNavNew from "./layout/BottomNavNew";

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
            <HeaderNew
                showDesktopNav={true}
            />

            {/*
        Adjusted padding-top (pt-20) to account for fixed header.
        Adjusted padding-bottom (pb-24 mobile, pb-8 desktop) to account for fixed bottom nav on mobile.
      */}
            <main className="flex-1 pt-24 pb-24 md:pb-8 px-4 max-w-7xl mx-auto w-full">
                {children}
            </main>

            {/* Only show bottom nav on mobile */}
            <div className="md:hidden">
                <BottomNavNew />
            </div>
        </div>
    );
};

export default MainLayout;
