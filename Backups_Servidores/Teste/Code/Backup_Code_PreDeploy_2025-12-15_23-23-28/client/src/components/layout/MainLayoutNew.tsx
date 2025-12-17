import { ReactNode } from "react";
import HeaderNew from "./HeaderNew";
import BottomNavNew from "./BottomNavNew";

interface MainLayoutNewProps {
    children: ReactNode;
}

const MainLayoutNew = ({ children }: MainLayoutNewProps) => {
    return (
        <div className="min-h-screen flex flex-col">
            <HeaderNew
                showDesktopNav={true}
            />
            <main className="flex-1 pt-20 pb-24 md:pb-8 px-4 max-w-7xl mx-auto w-full overflow-y-auto">
                {children}
            </main>
            {/* Only show bottom nav on mobile */}
            <div className="md:hidden">
                <BottomNavNew />
            </div>
        </div>
    );
};

export default MainLayoutNew;
