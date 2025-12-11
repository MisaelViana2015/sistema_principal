import { Router } from "express";
import { getAllShiftsController } from "./shifts.controller.js";

const router = Router();

router.get("/", getAllShiftsController);

export default router;
