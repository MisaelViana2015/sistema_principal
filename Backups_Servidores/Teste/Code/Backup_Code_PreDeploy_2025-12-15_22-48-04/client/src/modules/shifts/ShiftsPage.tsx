
import MainLayout from "../../components/MainLayout";
import ShiftsList from "./ShiftsList";

export default function ShiftsPage() {
    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto">
                <ShiftsList />
            </div>
        </MainLayout>
    );
}
