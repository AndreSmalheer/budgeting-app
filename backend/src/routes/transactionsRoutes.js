import { Router } from "express";
import {
  createTransaction,
  getTransactions,
} from "../controllers/transactionsController.js";

const router = Router();

router.get("/", getTransactions);
router.post("/", createTransaction);

export default router;
