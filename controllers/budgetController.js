import db from "../db.js";

/**
 * GET /api/trips/:tripId/budget
 * Calculate trip budget dynamically
 */
export const getTripBudget = (req, res) => {
  const { tripId } = req.params;

  // 1. Get trip dates
  db.get(
    `
    SELECT start_date, end_date
    FROM trips
    WHERE id = ?
    `,
    [tripId],
    (tripErr, trip) => {
      if (tripErr) return res.status(500).json({ error: tripErr.message });
      if (!trip) return res.status(404).json({ error: "Trip not found" });

      const start = new Date(trip.start_date);
      const end = new Date(trip.end_date);
      const days =
        Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

      // 2. Calculate activities cost
      db.get(
        `
        SELECT
          SUM(COALESCE(sa.custom_cost, a.avg_cost)) AS activities_cost
        FROM stop_activities sa
        JOIN activities a ON a.id = sa.activity_id
        JOIN stops s ON s.id = sa.stop_id
        WHERE s.trip_id = ?
        `,
        [tripId],
        (actErr, actRow) => {
          if (actErr) return res.status(500).json({ error: actErr.message });

          const activitiesCost = actRow.activities_cost || 0;

          // 3. Get budget overrides (stay, transport)
          db.all(
            `
            SELECT category, amount
            FROM trip_budget_overrides
            WHERE trip_id = ?
            `,
            [tripId],
            (budErr, rows) => {
              if (budErr) return res.status(500).json({ error: budErr.message });

              let stay = 0;
              let transport = 0;

              rows.forEach(row => {
                if (row.category === "stay") stay = row.amount;
                if (row.category === "transport") transport = row.amount;
              });

              const total =
                activitiesCost + stay + transport;

              res.json({
                total_cost: total,
                per_day_average: Math.round(total / days),
                breakdown: {
                  activities: activitiesCost,
                  stay,
                  transport
                }
              });
            }
          );
        }
      );
    }
  );
};
