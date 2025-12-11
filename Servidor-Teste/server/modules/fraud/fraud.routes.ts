
import { Router } from "express";
import * as controller from "./fraud.controller.js";

const router = Router();

router.get("/events", controller.getEvents);
router.get("/stats", controller.getDashboardStats);
router.get("/ranking", controller.getRanking);

export default router;
