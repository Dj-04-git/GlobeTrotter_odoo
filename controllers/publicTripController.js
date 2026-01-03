import db from "../db.js";

/**
 * GET /api/public/trips/:shareToken
 * Public read-only trip view
 */
export const getPublicTrip = (req, res) => {
  const { shareToken } = req.params;

  // 1. Fetch public trip
  db.get(
    `
    SELECT
      id,
      title,
      start_date,
      end_date
    FROM trips
    WHERE share_token = ?
      AND is_public = 1
    `,
    [shareToken],
    (tripErr, trip) => {
      if (tripErr) {
        return res.status(500).json({ error: tripErr.message });
      }

      if (!trip) {
        return res.status(404).json({ error: "Public trip not found" });
      }

      // Calculate total days
      const start = new Date(trip.start_date);
      const end = new Date(trip.end_date);
      const totalDays = Math.max(
        1,
        Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      );

      // 2. Fetch stops (city names only)
      db.all(
        `
        SELECT
          c.name AS city,
          s.start_date,
          s.end_date,
          s.position
        FROM stops s
        JOIN cities c ON c.id = s.city_id
        WHERE s.trip_id = ?
        ORDER BY s.position ASC
        `,
        [trip.id],
        (stopErr, stops) => {
          if (stopErr) {
            return res.status(500).json({ error: stopErr.message });
          }

          res.json({
            trip: {
              title: trip.title,
              stops: stops || [],
              total_days: totalDays
            }
          });
        }
      );
    }
  );
};
