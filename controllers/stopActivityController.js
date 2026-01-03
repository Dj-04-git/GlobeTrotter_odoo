import db from "../db.js";


 // POST /api/stops/:stopId/activities

export const addActivityToStop = (req, res) => {
  const { stopId } = req.params;
  const { activity_id, scheduled_date, custom_cost } = req.body;

  if (!activity_id) {
    return res.status(400).json({ error: "activity_id is required" });
  }

  // 1. Insert into stop_activities
  db.run(
    `
    INSERT INTO stop_activities (stop_id, activity_id, scheduled_date, custom_cost)
    VALUES (?, ?, ?, ?)
    `,
    [stopId, activity_id, scheduled_date || null, custom_cost || null],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const stopActivityId = this.lastID;

      // 2. Fetch activity details for response
      db.get(
        `
        SELECT id, name, category, avg_cost
        FROM activities
        WHERE id = ?
        `,
        [activity_id],
        (actErr, activity) => {
          if (actErr) {
            return res.status(500).json({ error: actErr.message });
          }

          if (!activity) {
            return res.status(400).json({ error: "Activity not found" });
          }

          res.status(201).json({
            stop_activity: {
              id: stopActivityId,
              activity: {
                id: activity.id,
                name: activity.name,
                category: activity.category
              },
              scheduled_date,
              cost: custom_cost ?? activity.avg_cost
            }
          });
        }
      );
    }
  );
};
