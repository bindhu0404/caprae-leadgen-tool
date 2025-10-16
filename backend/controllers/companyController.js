const Company = require("../models/Company");

// @desc Search companies by industry & city
// @route GET /api/companies/search
const searchCompanies = async (req, res) => {
  try {
    const { industry, city } = req.query;
    const query = {};

    if (industry) query.industry = { $regex: industry, $options: "i" };
    if (city) query.city = { $regex: city, $options: "i" };

    const companies = await Company.find(query).limit(50);
    res.json(companies);
  } catch (err) {
    console.error("❌ Search error:", err);
    res.status(500).json({ message: "Server error while searching companies" });
  }
};

// @desc Get all companies (for testing)
// @route GET /api/companies
const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find().limit(50);
    res.json(companies);
  } catch (err) {
    console.error("❌ Fetch error:", err);
    res.status(500).json({ message: "Server error while fetching companies" });
  }
};

// @desc Get company by ID
// @route GET /api/companies/:id
const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.json(company);
  } catch (err) {
    console.error("❌ Fetch by ID error:", err);
    res.status(500).json({ message: "Server error while fetching company" });
  }
};

module.exports = { searchCompanies, getAllCompanies, getCompanyById };
