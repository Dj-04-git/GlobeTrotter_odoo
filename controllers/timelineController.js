import db from "../db.js";

/**
 * GET /api/trips/:tripId/timeline
 * Build day-wise itinerary
 */
export const getTripTimeline = (req, res) => {
  const { tripId } = req.params;

  const sql = `
    SELECT
      sa.scheduled_date AS date,
      c.name AS city,
      a.name AS activity_name,
      COALESCE(sa.custom_cost, a.avg_cost) AS cost
    FROM trips t
    JOIN stops s ON s.trip_id = t.id
    JOIN cities c ON c.id = s.city_id
    JOIN stop_activities sa ON sa.stop_id = s.id
    JOIN activities a ON a.id = sa.activity_id
    WHERE t.id = ?
    ORDER BY sa.scheduled_date ASC
  `;

  db.all(sql, [tripId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Group rows by date
    const timelineMap = {};

    rows.forEach(row => {
      if (!timelineMap[row.date]) {
        timelineMap[row.date] = {
          date: row.date,
          city: row.city,
          activities: []
        };
      }

      timelineMap[row.date].activities.push({
        name: row.activity_name,
        cost: row.cost
      });
    });

    res.json({
      days: Object.values(timelineMap)
    });
  });
};
