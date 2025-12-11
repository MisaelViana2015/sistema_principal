
import { Router } from "express";
import * as controller from "./financial.controller.js";

const router = Router();

router.get("/expenses", controller.getExpenses);
router.get("/cost-types", controller.getCostTypes);
router.get("/fixed-costs", controller.getFixedCosts);

export default router;
