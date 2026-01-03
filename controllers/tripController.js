import db from "../db.js";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

/**
 * POST /api/trips
 * Create a new trip - only logged-in users
 */
export const createTrip = (req, res) => {
  // Only authenticated users can create trips
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const userId = req.user.id;
  const { title, description, start_date, end_date } = req.body;

  // Validate required fields
  if (!title || !start_date || !end_date) {
    return res.status(400).json({ error: "Missing required fields: title, start_date, end_date" });
  }

  // Validate dates
  const startDate = new Date(start_date);
  const endDate = new Date(end_date);
  
  if (endDate < startDate) {
    return res.status(400).json({ error: "End date must be after start date" });
  }

  db.run(
    `
    INSERT INTO trips (user_id, title, description, start_date, end_date)
    VALUES (?, ?, ?, ?, ?)
    `,
    [userId, title, description || null, start_date, end_date],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        trip: {
          id: this.lastID,
          title,
          start_date,
          end_date,
          guest: userId === null
        }
      });
    }
  );
};

/**
 * GET /api/trips
 * List all trips for logged-in user
 */
export const getTrips = (req, res) => {
  // Get user_id from authenticated request (optional, can fetch all trips if not protected)
  const userId = req.user?.id;

  let query = `
    SELECT
      t.id,
      t.title,
      t.description,
      t.start_date,
      t.end_date,
      t.created_at
    FROM trips t
  `;

  let params = [];

  // If user is authenticated, filter by user_id
  if (userId) {
    query += ` WHERE t.user_id = ? `;
    params = [userId];
  }

  query += ` ORDER BY t.created_at DESC`;

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({
      trips: rows || []
    });
  });
};

/**
 * GET /api/trips/:tripId
 * Get full trip details with stops
 */
export const getTripById = (req, res) => {
  const { tripId } = req.params;
  const userId = req.user?.id;

  // 1. Fetch trip
  db.get(
    `
    SELECT
      id,
      title,
      description,
      start_date,
      end_date,
      is_public,
      user_id
    FROM trips
    WHERE id = ?
    `,
    [tripId],
    (err, trip) => {
      if (err) {
        console.error('Database error fetching trip:', err);
        return res.status(500).json({ error: err.message });
      }

      if (!trip) {
        return res.status(404).json({ error: "Trip not found" });
      }

      // Check if user has access to this trip (if they're not the owner and trip is not public)
      if (trip.user_id !== userId && !trip.is_public) {
        return res.status(403).json({ error: "You don't have access to this trip" });
      }

      // 2. Fetch stops for this trip (including itinerary sections)
      db.all(
        `
        SELECT
          id,
          trip_id,
          city_id,
          start_date,
          end_date,
          position,
          description,
          budget
        FROM stops
        WHERE trip_id = ?
        ORDER BY position ASC
        `,
        [tripId],
        (stopErr, stops) => {
          if (stopErr) {
            console.error('Database error fetching stops:', stopErr);
            return res.status(500).json({ error: stopErr.message });
          }

          res.json({
            id: trip.id,
            title: trip.title,
            description: trip.description,
            start_date: trip.start_date,
            end_date: trip.end_date,
            is_public: Boolean(trip.is_public),
            stops: stops || []
          });
        }
      );
    }
  );
};
