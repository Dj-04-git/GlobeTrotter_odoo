import express from "express";
import {
  createTrip,
  getTrips,
  getTripById
} from "../controllers/tripController.js";

import { getTripTimeline } from "../controllers/timelineController.js";

import { getTripBudget } from "../controllers/budgetController.js";

import { shareTrip } from "../controllers/shareController.js";

const router = express.Router();

router.post("/", createTrip);
router.get("/", getTrips);
router.get("/:tripId", getTripById);
router.get("/:tripId/timeline", getTripTimeline);
router.get("/:tripId/budget", getTripBudget);
// POST /api/trips/:tripId/share
router.post("/:tripId/share", shareTrip);

export default router;
