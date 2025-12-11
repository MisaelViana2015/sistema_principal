import { Router } from "express";
import { getAllShiftsController } from "./shifts.controller";

const router = Router();

router.get("/", getAllShiftsController);

export default router;
