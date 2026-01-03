import db from "../db.js";

// Create a new stop (section in itinerary)
export const createStop = (req, res) => {
  const { trip_id, start_date, end_date, description, budget, position } = req.body;
  const user_id = req.user.id;

  // Validate required fields
  if (!trip_id || !start_date || !end_date) {
    return res.status(400).json({
      success: false,
      message: "Trip ID, start date, and end date are required"
    });
  }

  // Validate date order
  if (new Date(start_date) > new Date(end_date)) {
    return res.status(400).json({
      success: false,
      message: "End date must be after start date"
    });
  }

  // First, verify the trip belongs to the user
  db.get(
    "SELECT id, start_date, end_date FROM trips WHERE id = ? AND user_id = ?",
    [trip_id, user_id],
    (err, trip) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Database error",
          error: err.message
        });
      }

      if (!trip) {
        return res.status(403).json({
          success: false,
          message: "Trip not found or you don't have access"
        });
      }

      // Validate dates are within trip range
      const tripStart = new Date(trip.start_date);
      const tripEnd = new Date(trip.end_date);
      const sectionStart = new Date(start_date);
      const sectionEnd = new Date(end_date);

      if (sectionStart < tripStart || sectionEnd > tripEnd) {
        return res.status(400).json({
          success: false,
          message: `Section dates must be between ${trip.start_date} and ${trip.end_date}`
        });
      }

      // Insert the stop
      db.run(
        `INSERT INTO stops (trip_id, start_date, end_date, description, budget, position)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [trip_id, start_date, end_date, description || "", budget || 0, position || 0],
        function (err) {
          if (err) {
            return res.status(500).json({
              success: false,
              message: "Error creating stop",
              error: err.message
            });
          }

          res.status(201).json({
            success: true,
            message: "Stop created successfully",
            id: this.lastID,
            stop: {
              id: this.lastID,
              trip_id,
              start_date,
              end_date,
              description,
              budget,
              position
            }
          });
        }
      );
    }
  );
};

// Get all stops for a trip
export const getStopsForTrip = (req, res) => {
  const { tripId } = req.params;
  const user_id = req.user.id;

  // Verify trip belongs to user
  db.get(
    "SELECT id FROM trips WHERE id = ? AND user_id = ?",
    [tripId, user_id],
    (err, trip) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Database error",
          error: err.message
        });
      }

      if (!trip) {
        return res.status(403).json({
          success: false,
          message: "Trip not found or you don't have access"
        });
      }

      // Get all stops for the trip
      db.all(
        "SELECT * FROM stops WHERE trip_id = ? ORDER BY position ASC",
        [tripId],
        (err, stops) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: "Error fetching stops",
              error: err.message
            });
          }

          res.json({
            success: true,
            stops: stops || []
          });
        }
      );
    }
  );
};

// Update a stop
export const updateStop = (req, res) => {
  const { stopId } = req.params;
  const { start_date, end_date, description, budget, position } = req.body;
  const user_id = req.user.id;

  // Validate date order
  if (start_date && end_date && new Date(start_date) > new Date(end_date)) {
    return res.status(400).json({
      success: false,
      message: "End date must be after start date"
    });
  }

  // Get stop details first
  db.get(
    "SELECT s.*, t.start_date as trip_start, t.end_date as trip_end FROM stops s JOIN trips t ON s.trip_id = t.id WHERE s.id = ? AND t.user_id = ?",
    [stopId, user_id],
    (err, stop) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Database error",
          error: err.message
        });
      }

      if (!stop) {
        return res.status(403).json({
          success: false,
          message: "Stop not found or you don't have access"
        });
      }

      // Use provided dates or existing ones
      const newStartDate = start_date || stop.start_date;
      const newEndDate = end_date || stop.end_date;

      // Validate dates are within trip range
      const tripStart = new Date(stop.trip_start);
      const tripEnd = new Date(stop.trip_end);
      const sectionStart = new Date(newStartDate);
      const sectionEnd = new Date(newEndDate);

      if (sectionStart < tripStart || sectionEnd > tripEnd) {
        return res.status(400).json({
          success: false,
          message: `Section dates must be between ${stop.trip_start} and ${stop.trip_end}`
        });
      }

      // Update the stop
      db.run(
        `UPDATE stops 
         SET start_date = ?, end_date = ?, description = ?, budget = ?, position = ?
         WHERE id = ?`,
        [
          newStartDate,
          newEndDate,
          description !== undefined ? description : stop.description,
          budget !== undefined ? budget : stop.budget,
          position !== undefined ? position : stop.position,
          stopId
        ],
        function (err) {
          if (err) {
            return res.status(500).json({
              success: false,
              message: "Error updating stop",
              error: err.message
            });
          }

          res.json({
            success: true,
            message: "Stop updated successfully",
            id: stopId
          });
        }
      );
    }
  );
};

// Delete a stop
export const deleteStop = (req, res) => {
  const { stopId } = req.params;
  const user_id = req.user.id;

  // Verify stop belongs to user's trip
  db.get(
    "SELECT s.id FROM stops s JOIN trips t ON s.trip_id = t.id WHERE s.id = ? AND t.user_id = ?",
    [stopId, user_id],
    (err, stop) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Database error",
          error: err.message
        });
      }

      if (!stop) {
        return res.status(403).json({
          success: false,
          message: "Stop not found or you don't have access"
        });
      }

      // Delete the stop
      db.run("DELETE FROM stops WHERE id = ?", [stopId], function (err) {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Error deleting stop",
            error: err.message
          });
        }

        res.json({
          success: true,
          message: "Stop deleted successfully"
        });
      });
    }
  );
};

// Legacy functions for city-based stops
export const addStopToTrip = (req, res) => {
  const { tripId } = req.params;
  const { city_id, start_date, end_date } = req.body;

  if (!city_id || !start_date || !end_date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Get next position for this trip
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

      // Insert stop
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

          // Fetch city details for response
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
