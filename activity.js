import db from "./db.js";

const activities = [
  [1, "Eiffel Tower Visit", "sightseeing", 30, 2],
  [1, "Louvre Museum Tour", "museum", 20, 3],
  [1, "Seine River Cruise", "leisure", 25, 1.5],
  [1, "Montmartre Walking Tour", "walking", 10, 2],

  // -------- Rome (city_id = 2) --------
  [2, "Colosseum Tour", "sightseeing", 35, 2],
  [2, "Vatican Museums", "museum", 25, 3],
  [2, "Roman Food Tasting", "food", 40, 2],
  [2, "Trevi Fountain Walk", "walking", 0, 1],

  // -------- Berlin (city_id = 3) --------
  [3, "Berlin Wall Memorial", "history", 0, 1.5],
  [3, "Museum Island Pass", "museum", 18, 4],
  [3, "Street Art Tour", "walking", 15, 2],

  // -------- Tokyo (city_id = 4) --------
  [4, "Tokyo Skytree Observation Deck", "sightseeing", 28, 1.5],
  [4, "Shibuya Walking Tour", "walking", 0, 2],
  [4, "Tsukiji Food Market Tour", "food", 35, 2],
  [4, "Akihabara Anime Experience", "leisure", 20, 2],

  [5, "Eiffel Tower Visit", "sightseeing", 30, 2],
  [5, "Seine River Cruise", "leisure", 25, 1.5],
  [5, "Louvre Museum", "museum", 20, 3]
];

activities.forEach(([city_id, name, category, cost, hours]) => {
  db.run(
    `
    INSERT INTO activities (city_id, name, category, avg_cost, duration_hours)
    VALUES (?, ?, ?, ?, ?)
    `,
    [city_id, name, category, cost, hours]
  );
});

console.log("Activities seeded");