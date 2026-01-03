import express from "express";
import {
  createTrip,
  getTrips,
  getTripById
} from "../controllers/tripController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createTrip);
router.get("/", protect, getTrips);
router.get("/:tripId", getTripById);

export default router;
