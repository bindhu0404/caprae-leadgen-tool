// routes/leadRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  saveLead,
  uploadLeads,
  addManualLead,
  getAllLeads,
  exportLeads,
  deleteLead,
  clearAllLeads,
} = require("../controllers/leadController");

const authMiddleware = require("../middleware/authMiddleware");

// ✅ Multer setup for CSV uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});
const upload = multer({ storage });

// ✅ Routes
router.post("/", authMiddleware, saveLead);                // Save single lead
router.post("/upload", authMiddleware, upload.single("file"), uploadLeads); // Upload CSV
router.post("/manual", authMiddleware, addManualLead);     // Add manually
router.get("/", authMiddleware, getAllLeads);              // Fetch all leads
router.get("/export", authMiddleware, exportLeads);        // Export CSV
router.delete("/:id", authMiddleware, deleteLead);         // Delete single
router.delete("/", authMiddleware, clearAllLeads);         // Clear all

module.exports = router;
