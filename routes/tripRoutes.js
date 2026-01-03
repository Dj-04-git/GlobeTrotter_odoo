import express from "express";
import {
  createTrip,
  getTrips,
  getTripById
} from "../controllers/tripController.js";
import { protect } from "../middleware/authMiddleware.js";

import { getTripTimeline } from "../controllers/timelineController.js";

import { getTripBudget } from "../controllers/budgetController.js";

import { shareTrip } from "../controllers/shareController.js";

const router = express.Router();

router.post("/", protect, createTrip);
router.get("/", protect, getTrips);
router.get("/:tripId", protect,getTripById);
router.get("/:tripId/timeline", protect,getTripTimeline);
router.get("/:tripId/budget", protect,getTripBudget);
// POST /api/trips/:tripId/share
router.post("/:tripId/share", shareTrip);

export default router;
