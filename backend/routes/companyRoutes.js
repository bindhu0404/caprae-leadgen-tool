const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  searchCompanies,
  getAllCompanies,
  getCompanyById,
} = require("../controllers/companyController");

// ✅ GET all companies (debug/testing)
router.get("/", authMiddleware, getAllCompanies);

// ✅ Search by query params (industry, city)
router.get("/search", authMiddleware, searchCompanies);

// ✅ Get one company by ID
router.get("/:id", authMiddleware, getCompanyById);

module.exports = router;
