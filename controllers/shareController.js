import db from "../db.js";
import crypto from "crypto";

/**
 * POST /api/trips/:tripId/share
 * Generate a public share link for a trip
 */
export const shareTrip = (req, res) => {
  const { tripId } = req.params;

  // Generate random token
  const shareToken = crypto.randomBytes(6).toString("hex"); // e.g. abc123

  db.run(
    `
    UPDATE trips
    SET is_public = 1,
        share_token = ?
    WHERE id = ?
    `,
    [shareToken, tripId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Trip not found" });
      }

      res.json({
        share_url: `/public/trips/${shareToken}`
      });
    }
  );
};
