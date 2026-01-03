import express from "express";
import { getPublicTrip } from "../controllers/publicTripController.js";

const router = express.Router();

// GET /api/public/trips/:shareToken
router.get("/trips/:shareToken", getPublicTrip);

export default router;
