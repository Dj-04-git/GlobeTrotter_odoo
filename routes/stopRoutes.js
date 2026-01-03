import express from "express";
import { addStopToTrip, updateStop,reorderStops } from "../controllers/stopController.js";
import { addActivityToStop } from "../controllers/stopActivityController.js";

const router = express.Router();

// POST /api/trips/:tripId/stops
router.post("/:tripId/stops", addStopToTrip);
router.put("/stops/:stopId", updateStop);
router.post("/reorder", reorderStops);
router.post("/:stopId/activities", addActivityToStop);

export default router;
