
import axios from 'axios';

const URL_TEST = 'https://endpoint-api-production-f16d.up.railway.app/api/financial/test-recurrence';
const URL_FIX = 'https://endpoint-api-production-f16d.up.railway.app/api/financial/fix-fixed-costs-schema';

async function poll() {
    console.log("Polling...");
    for (let i = 0; i < 30; i++) {
        try {
            console.log(`-- Attempt ${i + 1} --`);

            // Check FIX route
            try {
                const r1 = await axios.get(URL_FIX, { timeout: 3000 });
                console.log("FIX Route:", r1.status);
            } catch (e: any) {
                console.log("FIX Route Error:", e.response?.status || e.message);
            }

            // Check TEST route
            try {
                const r2 = await axios.get(URL_TEST, { timeout: 3000 });
                console.log("TEST Route:", r2.status, r2.data);
                if (r2.status === 200) {
                    console.log("SUCCESS! Deployed.");
                    break;
                }
            } catch (e: any) {
                console.log("TEST Route Error:", e.response?.status || e.message);
            }

        } catch (err) {
            console.error(err);
        }
        await new Promise(r => setTimeout(r, 5000));
    }
}

poll();
