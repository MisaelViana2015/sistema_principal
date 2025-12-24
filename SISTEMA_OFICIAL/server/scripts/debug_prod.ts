
import axios from 'axios';

const URL = 'https://endpoint-api-production-f16d.up.railway.app/api/financial/debug';

async function debug() {
    try {
        console.log("Calling Debug Endpoint...");
        const res = await axios.get(URL);
        console.log("Status:", res.status);
        console.log("Data:", JSON.stringify(res.data, null, 2));
    } catch (err: any) {
        console.error("Error:", err.response ? err.response.data : err.message);
    }
}

debug();
