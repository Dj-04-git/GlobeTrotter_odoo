import db from "./db.js";

const cities = [
  ["Paris", "France", 80, 95],
  ["Rome", "Italy", 70, 88],
  ["Berlin", "Germany", 65, 82],
  ["Tokyo", "Japan", 85, 97],
  ["London", "UK", 90, 96],
  ["Kyoto", "Japan", 60, 75]
];

cities.forEach(([name, country, cost, popularity]) => {
  db.run(
    `
    INSERT INTO cities (name, country, cost_index, popularity_score)
    VALUES (?, ?, ?, ?)
    `,
    [name, country, cost, popularity],
    (err) => {
      if (err) console.error(err.message);
    }
  );
});

console.log("Cities seeded successfully");
