import express from "express";
import { addStopToTrip, updateStop,reorderStops } from "../controllers/stopController.js";
import { addActivityToStop } from "../controllers/stopActivityController.js";

const router = express.Router();

// POST /api/trips/:tripId/stops
router.post("/:tripId/stops", addStopToTrip);
router.put("/stops/:stopId", updateStop);
router.post("/reorder", reorderStops);
router.post("/:stopId/activities", addActivityToStop);
import { 
  createStop, 
  getStopsForTrip, 
  updateStop, 
  deleteStop,
  addStopToTrip,
  reorderStops 
} from "../controllers/stopController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Itinerary endpoints with protect middleware
router.post("/", protect, createStop);
router.get("/trip/:tripId", protect, getStopsForTrip);
router.put("/:stopId", protect, updateStop);
router.delete("/:stopId", protect, deleteStop);

// Legacy endpoints
router.post("/:tripId/stops", addStopToTrip);
router.post("/reorder", reorderStops);

export default router;
