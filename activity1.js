import db from "./db.js";

const tripId = 2;

db.run(
  `
  INSERT INTO trip_budget_overrides (trip_id, category, amount)
  VALUES (?, 'stay', 500),
         (?, 'transport', 300)
  `,
  [tripId, tripId],
  err => {
    if (err) console.error(err.message);
    else console.log("Budget overrides added");
  }
);
