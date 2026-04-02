import { Router } from "express";
import {
  createPot,
  deletePot,
  getPotById,
  getPots,
} from "../controllers/potsController.js";

const router = Router();

router.get("/", getPots);
router.get("/:id", getPotById);
router.post("/", createPot);
router.delete("/:id", deletePot);

export default router;
