
import MainLayout from "../../components/MainLayout";
import VehiclesList from "./VehiclesList";

export default function VehiclesPage() {
    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto">
                <VehiclesList />
            </div>
        </MainLayout>
    );
}
