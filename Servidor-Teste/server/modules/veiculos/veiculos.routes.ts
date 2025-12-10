
import { Router } from "express";
import { veiculosController } from "./veiculos.controller.js";

const router = Router();

router.get("/", veiculosController.getAll);

export default router;
