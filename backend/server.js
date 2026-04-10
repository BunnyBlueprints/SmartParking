require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { initializeDatabase } = require("./database");
const parkingRoutes = require("./routes/parking");

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

app.use("/api/parking", parkingRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Parking Lot API is running" });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

async function startServer() {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`Parking Lot Server running on http://localhost:${PORT}`);
      console.log("API Endpoints:");
      console.log("   GET  /api/parking/slots    - View all slots");
      console.log("   POST /api/parking/park     - Park a vehicle");
      console.log("   POST /api/parking/exit     - Exit a vehicle");
      console.log("   GET  /api/parking/tickets  - Active tickets");
      console.log("   GET  /api/parking/history  - Exit history");
    });
  } catch (error) {
    console.error("Failed to initialize the database:", error);
    process.exit(1);
  }
}

startServer();
