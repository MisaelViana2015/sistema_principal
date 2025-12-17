
import { Router } from "express";
import * as tiresController from "./tires.controller.js";

const router = Router();

router.post("/", tiresController.createTire);
router.get("/", tiresController.getAllTires);
router.delete("/:id", tiresController.deleteTire);

export default router;
