// models/Company.js
const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  industry: { type: String, required: true },
  city: { type: String, required: true },
  website: { type: String },
  employees: { type: String },
  funding: { type: String },
  email: { type: String },
  linkedin: { type: String },
});

const Company = mongoose.model("Company", companySchema);

module.exports = Company;
