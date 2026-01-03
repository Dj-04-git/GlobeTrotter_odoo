import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from pages folder
app.use(express.static(path.join(__dirname, "pages")));

app.use("/api/auth", authRoutes);

// Serve pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "login.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "register.html"));
});

app.get("/verify-otp", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "verify-otp.html"));
});

app.get("/forgot-password", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "forgot-password.html"));
});

app.get("/reset-password", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "reset-password.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "dashboard.html"));
});

app.get("/profile", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "profile.html"));
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
