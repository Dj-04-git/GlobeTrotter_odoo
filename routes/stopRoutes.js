import express from "express";
import { addStopToTrip, updateStop,reorderStops } from "../controllers/stopController.js";


const router = express.Router();

// POST /api/trips/:tripId/stops
router.post("/:tripId/stops", addStopToTrip);
router.put("/stops/:stopId", updateStop);


export default router;
