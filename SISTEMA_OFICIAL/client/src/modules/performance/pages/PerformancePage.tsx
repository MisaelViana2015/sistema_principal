import React, { Suspense } from "react";
import MainLayout from "../../../components/MainLayout";
import PerformanceContent from "../components/PerformanceContent";

export default function PerformancePage() {
    return (
        <MainLayout>
            <Suspense fallback={<div className="p-10 text-center">Carregando análise...</div>}>
                <PerformanceContent />
            </Suspense>
        </MainLayout>
    );
}
