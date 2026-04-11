import { Router } from "express";
import {
  createPot,
  deletePot,
  getPotById,
  getPots,
  updatePot,
} from "../controllers/potsController.js";

const router = Router();

router.get("/", getPots);
router.get("/:id", getPotById);
router.post("/", createPot);
router.patch("/:id", updatePot);
router.delete("/:id", deletePot);

export default router;
