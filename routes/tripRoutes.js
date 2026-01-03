import express from "express";
import {
  createTrip,
  getTrips,
  getTripById
} from "../controllers/tripController.js";

const router = express.Router();

router.post("/", createTrip);
router.get("/", getTrips);
router.get("/:tripId", getTripById);

export default router;
