const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const leadRoutes = require("./routes/leadRoutes");
const authRoutes = require("./routes/authRoutes");
const companyRoutes = require("./routes/companyRoutes");
// const enrichLeadsRoutes = require("./routes/enrichLeads");



const app = express();

// Middlewares
app.use(cors({
  origin: [process.env.FRONTEND_URL, "http://localhost:3000"],
  credentials: true,
}));

app.use(express.json());
// app.use("/api/enrich-leads", enrichLeadsRoutes);

// Routes
app.use("/api/leads", leadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// Root route
app.get("/", (req, res) => {
  res.send("ProspectPro backend running ✅");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));