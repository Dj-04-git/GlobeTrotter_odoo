import express from "express";
import { 
  createStop, 
  getStopsForTrip, 
  updateStop, 
  deleteStop,
  addStopToTrip,
  reorderStops 
} from "../controllers/stopController.js";
import { addActivityToStop } from "../controllers/stopActivityController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Itinerary endpoints with protect middleware
router.post("/", protect, createStop);
router.get("/trip/:tripId", protect, getStopsForTrip);
router.put("/:stopId", protect, updateStop);
router.delete("/:stopId", protect, deleteStop);

// Activity endpoints
router.post("/:stopId/activities", addActivityToStop);

// Legacy endpoints
router.post("/:tripId/stops", addStopToTrip);
router.post("/reorder", reorderStops);


router.post("/reorder", reorderStops);

export default router;
