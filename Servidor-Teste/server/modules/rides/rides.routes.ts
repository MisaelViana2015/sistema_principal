
import { Router } from "express";
import { getAllRidesController } from "./rides.controller.js";

const router = Router();

router.get("/", getAllRidesController);

export default router;
