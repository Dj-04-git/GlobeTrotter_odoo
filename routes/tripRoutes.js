import express from "express";
import {
  createTrip,
  getTrips,
  getTripById
} from "../controllers/tripController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createTrip);
router.get("/", protect, getTrips);
router.get("/:tripId", protect, getTripById);

export default router;
