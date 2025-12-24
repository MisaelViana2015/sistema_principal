import axios from 'axios';

const ENDPOINTS = [
    "https://endpoint-api-production-f16d.up.railway.app/api/financial/debug-data",
    "https://endpoint-api-production-f16d.up.railway.app/api/financial/fix-fixed-costs-schema"
];

async function poll() {
    console.log("Polling endpoints...");
    for (let i = 0; i < 60; i++) { // 60 attempts
        try {
            console.log(`-- Attempt ${i + 1} --`);

            for (const endpoint of ENDPOINTS) {
                try {
                    const res = await axios.get(endpoint, { timeout: 5000 });
                    console.log(`Endpoint ${endpoint.split('/').pop()}: ${res.status}`);

                    if (res.request.path.includes('debug-data') && res.status === 200) {
                        console.log("SUCCESS! Debug route is up.");
                        console.log("Meta:", JSON.stringify(res.data.meta, null, 2));
                        console.log("Search Result:", JSON.stringify(res.data.searchResult, null, 2));
                        process.exit(0);
                    }
                } catch (e: any) {
                    // Ignore individual failures
                }
            }
        } catch (e: any) {
            console.log("Error:", e.message);
        }
        await new Promise(r => setTimeout(r, 5000));
    }

}

poll();
