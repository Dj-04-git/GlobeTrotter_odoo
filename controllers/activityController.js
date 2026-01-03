import db from "../db.js";

export const getActivities = (req, res) => {
  const { city_id, type } = req.query;

  if (!city_id) {
    return res.status(400).json({ error: "city_id is required" });
  }

  let sql = `
    SELECT
      id,
      name,
      category,
      avg_cost,
      duration_hours
    FROM activities
    WHERE city_id = ?
  `;

  const params = [city_id];

  if (type) {
    sql += ` AND category = ?`;
    params.push(type);
  }

  sql += `
    ORDER BY avg_cost ASC
    LIMIT 20
  `;

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({
      activities: rows
    });
  });
};
