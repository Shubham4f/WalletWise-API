import express from "express";
import {
  checkout,
  history,
  paymentVerification,
  transfer,
} from "../controllers/transaction.controller.js";

const router = express.Router();

router.post("/addbalance", checkout);
router.post("/paymentverification", paymentVerification);
router.post("/transfer", transfer);
router.get("/history", history);

export default router;
