import { Router } from "express";
import { databaseStatusCheck, healthCheck } from "../controllers/systemController.js";

const router = Router();

router.get("/health", healthCheck);
router.get("/db-status", databaseStatusCheck);

export default router;
