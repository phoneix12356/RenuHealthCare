import express from "express";
import {
  downloadOfferLetter,
  GenerateICC,
  downloadICC,
} from "../controllers/certificate.controller.js";
const router = express.Router();

router.get("/offerLetter", downloadOfferLetter);
router.post("/generateIcc", GenerateICC);
router.get("/icc", downloadICC);

export default router;
