import express from "express";
import { getCities } from "../controllers/cityController.js";

const router = express.Router();

// GET /api/cities
router.get("/", getCities);

export default router;
