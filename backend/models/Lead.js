// backend/models/Lead.js
const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    industry: { type: String },
    city: { type: String },
    website: { type: String },
    employees: { type: String },
    funding: { type: String },
    email: { type: String },
    linkedin: { type: String },
    score: { type: Number, default: 0 },
    message: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);
