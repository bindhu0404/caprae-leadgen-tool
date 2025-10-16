// seed/seedCompanies.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const Company = require("../models/Company"); // model

dotenv.config();
mongoose.set("strictQuery", true);

const results = [];

fs.createReadStream(path.join(__dirname, "../companies_list.csv")) // ✅ correct path
  .pipe(csv())
  .on("data", (data) => {
    if (data["Company"] && data["Industry"] && data["City"]) {
      results.push({
        name: data["Company"],
        industry: data["Industry"],
        city: data["City"],
        website: data["Website"],
        employees: data["Employees"],
        funding: data["Funding"],
        email: data["Email"],
        linkedin: data["LinkedIn"],
      });
    } else {
      console.warn("⚠️ Skipped incomplete row:", data);
    }
  })
  .on("end", async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("✅ MongoDB connected");

      // Delete old companies
      await Company.deleteMany({});
      console.log("🗑 Old companies removed");

      // Insert new companies
      if (results.length > 0) {
        await Company.insertMany(results);
        console.log(`✅ ${results.length} companies inserted successfully!`);
      } else {
        console.log("⚠️ No companies to insert.");
      }

      await mongoose.disconnect();
      console.log("🔌 MongoDB disconnected");
    } catch (err) {
      console.error("❌ Insert error:", err);
    }
  });
