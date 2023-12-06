import express from "express";
import { viewBalance, viewDetails } from "../controllers/account.controller.js";

const router = express.Router();

router.get("/balance", viewBalance);
router.get("/details/:phoneNumber", viewDetails);

export default router;
