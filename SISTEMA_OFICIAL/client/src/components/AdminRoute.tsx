import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AdminNavigation from "../components/AdminNavigation";

export default function AdminRoute() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user || user.role !== "admin") {
        // Updated redirect to /garagem instead of /turno
        return <Navigate to="/garagem" replace />;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex-1 pb-20"> {/* Padding bottom for fixed nav */}
                <Outlet />
            </div>
            <AdminNavigation />
        </div>
    );
}
