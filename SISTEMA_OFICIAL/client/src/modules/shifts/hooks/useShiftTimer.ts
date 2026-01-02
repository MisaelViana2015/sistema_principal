import { useState, useEffect } from "react";

export function useShiftTimer(startTime: string | Date | undefined) {
    const [workedTime, setWorkedTime] = useState("--h --min");

    useEffect(() => {
        if (!startTime) {
            setWorkedTime("--h --min");
            return;
        }

        const updateTimer = () => {
            const start = new Date(startTime);
            const now = new Date();
            const diffMs = now.getTime() - start.getTime();
            const diffMins = Math.max(0, Math.floor(diffMs / 60000));

            const hours = Math.floor(diffMins / 60);
            const mins = diffMins % 60;

            setWorkedTime(`${hours}h ${mins}min`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 60000);

        return () => clearInterval(interval);
    }, [startTime]);

    return workedTime;
}
