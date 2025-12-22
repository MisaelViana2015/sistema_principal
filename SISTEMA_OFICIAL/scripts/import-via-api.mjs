// Import shifts via HTTP API
// Run with: node scripts/import-via-api.mjs

const API_BASE = 'http://localhost:5000/api';

// You'll need to get a valid token first by logging in
// For now, we'll use admin credentials
const LOGIN_EMAIL = 'admin@rotaverde.com';
const LOGIN_PASSWORD = 'admin';

const shiftsData = [
    {
        driver: "Robson",
        vehicle: "TQQ0A94",
        date: "2025-12-16",
        start: "09:14",
        end: "14:31",
        km: 65,
        rides: [
            { time: "09:44", value: 14.40, type: "Aplicativo" },
            { time: "10:06", value: 18.00, type: "Aplicativo" },
            { time: "11:09", value: 12.90, type: "Aplicativo" },
            { time: "11:36", value: 24.20, type: "Aplicativo" },
            { time: "12:40", value: 15.80, type: "Aplicativo" },
            { time: "12:51", value: 14.00, type: "Aplicativo" },
            { time: "13:07", value: 15.00, type: "Particular" },
            { time: "13:22", value: 15.00, type: "Aplicativo" },
        ]
    },
    {
        driver: "Misael",
        vehicle: "TQQ0A07",
        date: "2025-12-16",
        start: "19:49",
        end: "20:04",
        km: 0,
        rides: [
            { time: "19:50", value: 25.00, type: "Aplicativo" },
        ]
    },
    {
        driver: "Luan",
        vehicle: "TQS4C30",
        date: "2025-12-16",
        start: "06:44",
        end: "20:21",
        km: 229,
        rides: [
            { time: "06:56", value: 11.70, type: "Aplicativo" },
            { time: "07:22", value: 21.90, type: "Aplicativo" },
            { time: "08:27", value: 10.30, type: "Aplicativo" },
            { time: "08:44", value: 14.00, type: "Aplicativo" },
            { time: "08:57", value: 14.10, type: "Aplicativo" },
            { time: "09:17", value: 15.00, type: "Particular" },
            { time: "09:44", value: 33.10, type: "Aplicativo" },
            { time: "10:03", value: 13.90, type: "Aplicativo" },
            { time: "10:15", value: 14.20, type: "Aplicativo" },
            { time: "11:23", value: 10.80, type: "Aplicativo" },
            { time: "12:05", value: 12.60, type: "Aplicativo" },
            { time: "12:31", value: 12.00, type: "Particular" },
            { time: "12:40", value: 12.70, type: "Aplicativo" },
            { time: "13:00", value: 17.00, type: "Particular" },
            { time: "13:35", value: 12.77, type: "Aplicativo" },
            { time: "13:45", value: 11.40, type: "Aplicativo" },
            { time: "14:27", value: 15.00, type: "Particular" },
            { time: "15:32", value: 19.00, type: "Aplicativo" },
            { time: "15:44", value: 16.10, type: "Aplicativo" },
            { time: "16:04", value: 14.30, type: "Aplicativo" },
            { time: "16:32", value: 12.00, type: "Particular" },
            { time: "18:05", value: 19.77, type: "Aplicativo" },
            { time: "18:32", value: 35.00, type: "Aplicativo" },
            { time: "18:52", value: 15.40, type: "Aplicativo" },
            { time: "19:08", value: 13.60, type: "Aplicativo" },
            { time: "19:30", value: 14.70, type: "Aplicativo" },
            { time: "20:20", value: 13.10, type: "Aplicativo" },
        ]
    },
    {
        driver: "Gustavo",
        vehicle: "TQU0H17",
        date: "2025-12-16",
        start: "06:38",
        end: "21:39",
        km: 152,
        rides: [
            { time: "08:10", value: 15.00, type: "Particular" },
            { time: "08:34", value: 10.00, type: "Particular" },
            { time: "08:50", value: 15.00, type: "Particular" },
            { time: "09:09", value: 15.00, type: "Particular" },
            { time: "11:36", value: 10.00, type: "Particular" },
            { time: "11:40", value: 80.00, type: "Particular" },
            { time: "11:57", value: 15.00, type: "Particular" },
            { time: "13:50", value: 14.77, type: "Aplicativo" },
            { time: "14:04", value: 15.00, type: "Particular" },
            { time: "14:18", value: 15.00, type: "Particular" },
            { time: "14:41", value: 11.10, type: "Aplicativo" },
            { time: "14:46", value: 10.00, type: "Particular" },
            { time: "16:04", value: 13.00, type: "Particular" },
            { time: "16:18", value: 25.00, type: "Particular" },
            { time: "16:36", value: 15.00, type: "Particular" },
            { time: "17:17", value: 15.00, type: "Particular" },
            { time: "17:44", value: 15.00, type: "Particular" },
            { time: "17:56", value: 10.00, type: "Particular" },
            { time: "18:11", value: 9.40, type: "Aplicativo" },
            { time: "18:18", value: 11.10, type: "Aplicativo" },
            { time: "18:44", value: 10.80, type: "Aplicativo" },
            { time: "18:55", value: 10.70, type: "Aplicativo" },
            { time: "19:27", value: 20.00, type: "Particular" },
            { time: "20:17", value: 13.30, type: "Aplicativo" },
            { time: "20:43", value: 18.40, type: "Aplicativo" },
            { time: "21:27", value: 11.70, type: "Aplicativo" },
        ]
    },
    {
        driver: "Felipe",
        vehicle: "TQQ0A94",
        date: "2025-12-16",
        start: "15:31",
        end: "21:59",
        km: 97,
        rides: [
            { time: "15:50", value: 9.90, type: "Aplicativo" },
            { time: "16:12", value: 8.00, type: "Aplicativo" },
            { time: "16:26", value: 10.00, type: "Particular" },
            { time: "16:29", value: 12.70, type: "Aplicativo" },
            { time: "16:40", value: 11.00, type: "Aplicativo" },
            { time: "16:52", value: 8.00, type: "Aplicativo" },
            { time: "17:12", value: 12.00, type: "Aplicativo" },
            { time: "17:25", value: 10.00, type: "Aplicativo" },
            { time: "18:09", value: 10.00, type: "Particular" },
            { time: "18:47", value: 11.90, type: "Aplicativo" },
            { time: "19:43", value: 12.50, type: "Aplicativo" },
            { time: "19:58", value: 25.00, type: "Particular" },
            { time: "20:17", value: 18.80, type: "Aplicativo" },
            { time: "20:49", value: 20.00, type: "Particular" },
            { time: "21:16", value: 12.84, type: "Aplicativo" },
            { time: "21:27", value: 8.00, type: "Aplicativo" },
            { time: "21:45", value: 10.78, type: "Aplicativo" },
        ]
    },
    // December 17
    {
        driver: "Felipe",
        vehicle: "TQQ0A94",
        date: "2025-12-17",
        start: "07:03",
        end: "13:26",
        km: 52,
        rides: [
            { time: "07:17", value: 10.00, type: "Particular" },
            { time: "07:46", value: 20.00, type: "Aplicativo" },
            { time: "08:02", value: 12.60, type: "Aplicativo" },
            { time: "08:49", value: 11.50, type: "Aplicativo" },
            { time: "09:01", value: 11.30, type: "Aplicativo" },
            { time: "11:23", value: 11.00, type: "Aplicativo" },
            { time: "12:12", value: 14.00, type: "Aplicativo" },
            { time: "12:27", value: 11.70, type: "Aplicativo" },
            { time: "13:02", value: 8.00, type: "Aplicativo" },
            { time: "13:18", value: 11.10, type: "Aplicativo" },
        ]
    },
    {
        driver: "Gustavo",
        vehicle: "TQU0H17",
        date: "2025-12-17",
        start: "06:51",
        end: "21:09",
        km: 102,
        rides: [
            { time: "07:40", value: 15.00, type: "Particular" },
            { time: "08:48", value: 15.00, type: "Particular" },
            { time: "09:01", value: 15.00, type: "Particular" },
            { time: "10:38", value: 10.00, type: "Particular" },
            { time: "11:01", value: 16.79, type: "Aplicativo" },
            { time: "11:23", value: 10.00, type: "Particular" },
            { time: "11:29", value: 10.00, type: "Particular" },
            { time: "11:36", value: 10.00, type: "Particular" },
            { time: "11:55", value: 9.10, type: "Aplicativo" },
            { time: "12:27", value: 27.30, type: "Aplicativo" },
            { time: "12:36", value: 10.00, type: "Particular" },
            { time: "15:04", value: 9.60, type: "Aplicativo" },
            { time: "16:29", value: 16.90, type: "Aplicativo" },
            { time: "16:47", value: 15.00, type: "Particular" },
            { time: "17:03", value: 10.00, type: "Particular" },
            { time: "17:42", value: 15.00, type: "Particular" },
            { time: "18:06", value: 10.00, type: "Particular" },
            { time: "19:00", value: 20.00, type: "Particular" },
        ]
    },
    {
        driver: "Felipe",
        vehicle: "TQQ0A94",
        date: "2025-12-17",
        start: "16:32",
        end: "22:23",
        km: 103,
        rides: [
            { time: "16:47", value: 13.50, type: "Aplicativo" },
            { time: "16:58", value: 10.60, type: "Aplicativo" },
            { time: "17:12", value: 12.00, type: "Aplicativo" },
            { time: "18:07", value: 12.00, type: "Aplicativo" },
            { time: "18:25", value: 12.00, type: "Aplicativo" },
            { time: "18:45", value: 12.50, type: "Aplicativo" },
            { time: "19:07", value: 16.70, type: "Aplicativo" },
            { time: "19:25", value: 11.60, type: "Aplicativo" },
            { time: "19:37", value: 12.00, type: "Aplicativo" },
            { time: "20:01", value: 24.50, type: "Aplicativo" },
            { time: "20:12", value: 10.45, type: "Aplicativo" },
            { time: "20:26", value: 11.80, type: "Aplicativo" },
            { time: "20:47", value: 14.00, type: "Particular" },
            { time: "20:58", value: 18.00, type: "Aplicativo" },
            { time: "21:23", value: 17.60, type: "Aplicativo" },
            { time: "21:53", value: 25.00, type: "Particular" },
        ]
    },
    {
        driver: "Luan",
        vehicle: "TQS4C30",
        date: "2025-12-17",
        start: "06:44",
        end: "22:42",
        km: 275,
        rides: [
            { time: "07:05", value: 17.50, type: "Aplicativo" },
            { time: "07:25", value: 14.20, type: "Aplicativo" },
            { time: "08:00", value: 10.40, type: "Aplicativo" },
            { time: "08:22", value: 13.10, type: "Aplicativo" },
            { time: "09:10", value: 11.80, type: "Aplicativo" },
            { time: "09:53", value: 12.40, type: "Aplicativo" },
            { time: "10:15", value: 14.60, type: "Aplicativo" },
            { time: "10:25", value: 10.00, type: "Particular" },
            { time: "10:56", value: 11.20, type: "Aplicativo" },
            { time: "11:19", value: 12.80, type: "Aplicativo" },
            { time: "13:18", value: 15.00, type: "Particular" },
            { time: "13:45", value: 11.90, type: "Aplicativo" },
            { time: "14:00", value: 12.40, type: "Aplicativo" },
            { time: "14:21", value: 16.00, type: "Particular" },
            { time: "14:55", value: 14.50, type: "Aplicativo" },
            { time: "15:12", value: 15.70, type: "Aplicativo" },
            { time: "15:31", value: 13.20, type: "Aplicativo" },
            { time: "15:40", value: 10.00, type: "Aplicativo" },
            { time: "15:59", value: 14.20, type: "Aplicativo" },
            { time: "16:15", value: 17.90, type: "Aplicativo" },
            { time: "17:04", value: 16.40, type: "Aplicativo" },
            { time: "18:43", value: 19.40, type: "Aplicativo" },
            { time: "19:03", value: 16.40, type: "Aplicativo" },
            { time: "19:29", value: 22.20, type: "Aplicativo" },
            { time: "20:39", value: 25.00, type: "Particular" },
            { time: "21:01", value: 12.80, type: "Aplicativo" },
            { time: "21:15", value: 11.00, type: "Aplicativo" },
            { time: "21:59", value: 11.20, type: "Aplicativo" },
            { time: "22:11", value: 16.30, type: "Aplicativo" },
        ]
    },
];

async function login() {
    const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: LOGIN_EMAIL, senha: LOGIN_PASSWORD })
    });

    if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.token;
}

async function getDrivers(token) {
    const response = await fetch(`${API_BASE}/drivers`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return Array.isArray(data) ? data : (data.data || data);
}

async function getVehicles(token) {
    const response = await fetch(`${API_BASE}/vehicles`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return Array.isArray(data) ? data : (data.data || data);
}

async function createShift(token, shiftData) {
    const response = await fetch(`${API_BASE}/shifts`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(shiftData)
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create shift: ${error}`);
    }

    return await response.json();
}

async function createRide(token, rideData) {
    const response = await fetch(`${API_BASE}/rides`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(rideData)
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create ride: ${error}`);
    }

    return await response.json();
}

async function importShifts() {
    console.log('🚀 Starting import via API...\n');

    try {
        // Login
        console.log('🔐 Logging in...');
        const token = await login();
        console.log('✓ Logged in successfully\n');

        // Get drivers and vehicles
        console.log('📋 Fetching drivers and vehicles...');
        const drivers = await getDrivers(token);
        const vehicles = await getVehicles(token);
        console.log(`✓ Found ${drivers?.length || 0} drivers and ${vehicles?.length || 0} vehicles\n`);

        // Import each shift
        for (const shiftData of shiftsData) {
            try {
                // Find driver
                const driver = drivers.find(d => d.nome === shiftData.driver);
                if (!driver) {
                    console.log(`❌ Driver "${shiftData.driver}" not found, skipping...`);
                    continue;
                }

                // Find vehicle
                const vehicle = vehicles.find(v => v.plate === shiftData.vehicle);
                if (!vehicle) {
                    console.log(`❌ Vehicle "${shiftData.vehicle}" not found, skipping...`);
                    continue;
                }

                // Calculate totals
                const totalApp = shiftData.rides.filter(r => r.type === "Aplicativo").reduce((sum, r) => sum + r.value, 0);
                const totalParticular = shiftData.rides.filter(r => r.type === "Particular").reduce((sum, r) => sum + r.value, 0);

                // Create shift
                const shift = await createShift(token, {
                    driverId: driver.id,
                    vehicleId: vehicle.id,
                    inicio: `${shiftData.date}T${shiftData.start}:00-03:00`,
                    fim: `${shiftData.date}T${shiftData.end}:00-03:00`,
                    kmInicial: 0,
                    kmFinal: shiftData.km,
                });

                console.log(`✅ Shift created: ${driver.nome} - ${vehicle.plate} (${shiftData.date})`);

                // Create rides
                for (const ride of shiftData.rides) {
                    await createRide(token, {
                        shiftId: shift.id,
                        tipo: ride.type,
                        valor: ride.value,
                        hora: `${shiftData.date}T${ride.time}:00-03:00`,
                    });
                }

                console.log(`   📍 ${shiftData.rides.length} rides added\n`);

            } catch (error) {
                console.error(`❌ Error importing shift for ${shiftData.driver}:`, error.message);
            }
        }

        console.log('✨ Import completed!');

    } catch (error) {
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    }
}

importShifts();
