import db from "../db.js";

/**
 * POST /api/trips
 * Create a new trip (guest or logged-in user)
 */
export const createTrip = (req, res) => {
  // Guest mode supported
  const userId = req.user?.id || null;

  const { title, description, start_date, end_date } = req.body;

  if (!title || !start_date || !end_date) {
    return res.status(400).json({ error: "Missing required fields" });
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
 * List all trips with city count
 */
export const getTrips = (req, res) => {
  const query = `
    SELECT
      t.id,
      t.title,
      t.start_date,
      t.end_date,
      COUNT(s.id) AS city_count
    FROM trips t
    LEFT JOIN stops s ON s.trip_id = t.id
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({
      trips: rows
    });
  });
};

/**
 * GET /api/trips/:tripId
 * Get full trip details with stops
 */
export const getTripById = (req, res) => {
  const { tripId } = req.params;

  // 1. Fetch trip
  db.get(
    `
    SELECT
      id,
      title,
      description,
      start_date,
      end_date,
      is_public
    FROM trips
    WHERE id = ?
    `,
    [tripId],
    (err, trip) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!trip) {
        return res.status(404).json({ error: "Trip not found" });
      }

      // 2. Fetch stops for this trip
      db.all(
        `
        SELECT
          s.id,
          s.city_id,
          c.name AS city_name,
          c.country AS country,
          s.start_date,
          s.end_date,
          s.position
        FROM stops s
        JOIN cities c ON c.id = s.city_id
        WHERE s.trip_id = ?
        ORDER BY s.position ASC
        `,
        [tripId],
        (stopErr, stops) => {
          if (stopErr) {
            return res.status(500).json({ error: stopErr.message });
          }

          res.json({
            trip: {
              id: trip.id,
              title: trip.title,
              description: trip.description,
              start_date: trip.start_date,
              end_date: trip.end_date,
              is_public: Boolean(trip.is_public),
              stops: stops || []
            }
          });
        }
      );
    }
  );
};
