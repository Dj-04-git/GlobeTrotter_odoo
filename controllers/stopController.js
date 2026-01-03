import db from "../db.js";

/**
 * POST /api/trips/:tripId/stops
 * Add a city as a stop to a trip
 */
export const addStopToTrip = (req, res) => {
  const { tripId } = req.params;
  const { city_id, start_date, end_date } = req.body;

  if (!city_id || !start_date || !end_date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // 1. Get next position for this trip
  db.get(
    `
    SELECT COALESCE(MAX(position), 0) + 1 AS next_position
    FROM stops
    WHERE trip_id = ?
    `,
    [tripId],
    (posErr, posRow) => {
      if (posErr) {
        return res.status(500).json({ error: posErr.message });
      }

      const position = posRow.next_position;

      // 2. Insert stop
      db.run(
        `
        INSERT INTO stops (trip_id, city_id, start_date, end_date, position)
        VALUES (?, ?, ?, ?, ?)
        `,
        [tripId, city_id, start_date, end_date, position],
        function (insertErr) {
          if (insertErr) {
            return res.status(500).json({ error: insertErr.message });
          }

          const stopId = this.lastID;

          // 3. Fetch city details for response
         db.get(
  `
  SELECT id, name, country
  FROM cities
  WHERE id = ?
  `,
  [city_id],
  (cityErr, city) => {
    if (cityErr) {
      return res.status(500).json({ error: cityErr.message });
    }

    if (!city) {
      return res.status(400).json({
        error: "City not found. Invalid city_id."
      });
    }

    res.status(201).json({
      stop: {
        id: stopId,
        city: {
          id: city.id,
          name: city.name,
          country: city.country
        },
        start_date,
        end_date,
        position
      }
    });
  }
);

        }
      );
    }
  );
};

/**
 * PUT /api/stops/:stopId
 * Update stop dates and/or position
 */
export const updateStop = (req, res) => {
  const { stopId } = req.params;
  const { start_date, end_date, position } = req.body;

  if (!start_date && !end_date && position === undefined) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  const fields = [];
  const values = [];

  if (start_date) {
    fields.push("start_date = ?");
    values.push(start_date);
  }

  if (end_date) {
    fields.push("end_date = ?");
    values.push(end_date);
  }

  if (position !== undefined) {
    fields.push("position = ?");
    values.push(position);
  }

  values.push(stopId);

  const query = `
    UPDATE stops
    SET ${fields.join(", ")}
    WHERE id = ?
  `;

  db.run(query, values, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Stop not found" });
    }

    res.json({ success: true });
  });
};


export const reorderStops = (req, res) => {
  const { trip_id, ordered_stop_ids } = req.body;

  // Basic validation
  if (
    !trip_id ||
    !Array.isArray(ordered_stop_ids) ||
    ordered_stop_ids.length === 0
  ) {
    return res.status(400).json({ error: "Invalid input" });
  }

  db.serialize(() => {
    // Start transaction
    db.run("BEGIN TRANSACTION");

    ordered_stop_ids.forEach((stopId, index) => {
      db.run(
        `
        UPDATE stops
        SET position = ?
        WHERE id = ? AND trip_id = ?
        `,
        [index + 1, stopId, trip_id]
      );
    });

    // Commit transaction
    db.run("COMMIT", (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ success: true });
    });
  });
};
