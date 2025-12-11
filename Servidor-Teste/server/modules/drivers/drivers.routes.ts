
import { Router } from "express";
import { getAllDriversController } from "./drivers.controller.js";

const router = Router();

router.get("/", getAllDriversController);

export default router;
