
import { FraudRepository } from "./server/modules/fraud/fraud.repository.js";

async function testRepo() {
    try {
        console.log("Testing FraudRepository.getFraudEvents...");

        const events = await FraudRepository.getFraudEvents({
            status: 'pendente,em_analise,confirmado',
            limit: 10,
            offset: 0
        });

        console.log(`Found ${events.length} events using Repository logic.`);
        if (events.length > 0) {
            console.log("First event:", JSON.stringify(events[0], null, 2));
        } else {
            console.log("No events found repository logic.");
        }

    } catch (e) {
        console.error("Repo Error:", e);
    }
    process.exit(0);
}

testRepo();
