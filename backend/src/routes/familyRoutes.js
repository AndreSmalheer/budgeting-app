import { Router } from "express";
import {
  getFamilyStatus,
  getLinkedChildPots,
  getLinkedChildTransactions,
  getPendingApprovals,
  linkChildToParent,
  reviewApproval,
  unlinkFamilyAccount,
} from "../controllers/familyController.js";

const router = Router();

router.get("/status", getFamilyStatus);
router.get("/child/pots", getLinkedChildPots);
router.get("/child/transactions", getLinkedChildTransactions);
router.get("/approvals", getPendingApprovals);
router.post("/link", linkChildToParent);
router.delete("/link", unlinkFamilyAccount);
router.patch("/approvals/:id", reviewApproval);

export default router;
