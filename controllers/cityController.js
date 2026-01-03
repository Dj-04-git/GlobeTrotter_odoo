import db from "../db.js";


export const getCities = (req, res) => {
  const { query } = req.query;

  // If no query, return popular cities (optional but useful)
  let sql = `
    SELECT id, name, country, cost_index, popularity_score
    FROM cities
  `;
  let params = [];

  if (query) {
    sql += `
      WHERE name LIKE ? OR country LIKE ?
    `;
    params = [`%${query}%`, `%${query}%`];
  }

  sql += `
    ORDER BY popularity_score DESC
    LIMIT 10
  `;

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({
      cities: rows
    });
  });
};
