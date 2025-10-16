// // routes/enrichLeads.js
// const express = require("express");
// const router = express.Router();
// const SavedLead = require("../models/SavedLead");

// // Example enrichment logic
// router.get("/", async (req, res) => {
//   try {
//     const leads = await SavedLead.find();

//     // Enrichment (dummy auto-fill for now, you can replace with real logic)
//     const enrichedLeads = leads.map((lead) => ({
//       ...lead.toObject(),
//       employees: lead.employees || Math.floor(Math.random() * 1000 + 10),
//       funding: lead.funding || `$${(Math.random() * 50).toFixed(1)}M`,
//       email: lead.email || `${lead.name.toLowerCase().replace(/\s+/g, "")}@gmail.com`,
//       linkedin: lead.linkedin || `https://linkedin.com/company/${lead.name.toLowerCase().replace(/\s+/g, "-")}`,
//       score: Math.floor(Math.random() * 100), // Score based on enriched data
//     }));

//     res.json(enrichedLeads);
//   } catch (err) {
//     console.error("Error enriching leads:", err);
//     res.status(500).json({ error: "Failed to enrich leads" });
//   }
// });

// module.exports = router;
