
import MainLayout from "../../components/MainLayout";
import DriversList from "./DriversList";

export default function DriversPage() {
    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto">
                <DriversList />
            </div>
        </MainLayout>
    );
}
