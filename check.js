import db from "./db.js";

db.all("SELECT * FROM cities", [], (err, rows) => {
  if (err) {
    console.error(err.message);
    return;
  }

  console.log("Cities in database:");
  console.table(rows);
});