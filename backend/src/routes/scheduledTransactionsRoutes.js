import { Router } from "express";
import {
  createScheduledTransaction,
  deleteScheduledTransaction,
  getScheduledTransactions,
  syncScheduledTransactions,
  updateScheduledTransaction,
} from "../controllers/scheduledTransactionsController.js";

const router = Router();

router.get("/", getScheduledTransactions);
router.post("/", createScheduledTransaction);
router.patch("/:id", updateScheduledTransaction);
router.delete("/:id", deleteScheduledTransaction);
router.post("/sync", syncScheduledTransactions);

export default router;
