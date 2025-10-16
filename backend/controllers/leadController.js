// backend/controllers/leadController.js
const Lead = require("../models/Lead");
const { enrichLead } = require("../utils/enrichment");
const csv = require("csv-parser");
const fs = require("fs");
const { Parser } = require("json2csv");
const Company = require("../models/Company");

async function fillFromCompanyDB(leadData) {
  if (!leadData || !leadData.name) return leadData;

  // find matching company by name + industry (loose match)
  const company = await Company.findOne({
    name: leadData.name,
    industry: leadData.industry || { $exists: true },
  });

  if (company) {
    if (!leadData.city) leadData.city = company.city;
    if (!leadData.website) leadData.website = company.website;
  }

  return leadData;
}

/**
 * Helper: derive userId robustly from req.user
 */
function resolveUserId(req) {
  if (!req || !req.user) return null;
  // common shapes: req.user.id (string), req.user._id (ObjectId or string),
  // or req.user._doc._id (when using mongoose user doc attached)
  const u = req.user;
  if (u.id) return u.id;
  if (u._id) return u._id.toString ? u._id.toString() : u._id;
  if (u._doc && u._doc._id) return u._doc._id.toString ? u._doc._id.toString() : u._doc._id;
  return null;
}

/* -------------------------------------------------------------------------- */
/* 🧩 POST /api/leads — Save lead from company search                         */
/* -------------------------------------------------------------------------- */
exports.saveLead = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { name, industry, city, website, revenue } = req.body;

    if (!name || !industry) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Prevent duplicate saves for the same user
    const existing = await Lead.findOne({ name, userId });
    if (existing) {
      return res.status(400).json({ message: "Lead already saved for this company" });
    }

    const lead = new Lead({
      name,
      industry,
      city,
      website,
      revenue,
      userId,
    });

    await lead.save();
    res.status(201).json({ message: "✅ Lead saved successfully", lead });
  } catch (error) {
    console.error("❌ Error saving lead:", error);
    res.status(500).json({ error: "Failed to save lead" });
  }
};

/* -------------------------------------------------------------------------- */
/* 📁 POST /api/leads/upload — Upload & enrich CSV for logged-in user         */
/* -------------------------------------------------------------------------- */
exports.uploadLeads = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const leads = [];
    const filePath = req.file.path;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => leads.push(data))
      .on("end", async () => {
        try {
          const enrichedLeads = [];
          for (const leadRow of leads) {
            let enriched = enrichLead(leadRow) || {};
            enriched.userId = userId;

            // 🔥 fill missing city/website from DB
            enriched = await fillFromCompanyDB(enriched);

            enrichedLeads.push(enriched);
          }

          if (enrichedLeads.length > 0) {
            await Lead.insertMany(enrichedLeads);
          }

          try { fs.unlinkSync(filePath); } catch (e) {}

          res.status(200).json({
            message: "✅ Leads uploaded successfully",
            count: enrichedLeads.length,
          });
        } catch (dbError) {
          console.error("❌ Error saving leads:", dbError);
          res.status(500).json({ error: "Failed to save leads" });
        }
      })
      .on("error", (err) => {
        console.error("❌ CSV parse error:", err);
        res.status(500).json({ error: "Error parsing CSV" });
      });
  } catch (error) {
    console.error("❌ Error uploading leads:", error);
    res.status(500).json({ error: "Failed to upload leads" });
  }
};
/* -------------------------------------------------------------------------- */
/* 🧾 POST /api/leads/manual — Add one lead manually                          */
/* -------------------------------------------------------------------------- */
exports.addManualLead = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    let leadData = req.body || {};

    // Enrich first
    leadData = enrichLead(leadData) || {};
    leadData.userId = userId;

    // 🔥 Auto-fill missing fields from Company DB
    leadData = await fillFromCompanyDB(leadData);

    const leadToSave = new Lead(leadData);
    await leadToSave.save();

    res.status(201).json(leadToSave);
  } catch (error) {
    console.error("❌ Error adding manual lead:", error);
    res.status(500).json({ error: "Failed to add lead" });
  }
};


/* -------------------------------------------------------------------------- */
/* 📊 GET /api/leads — Fetch all leads for the logged-in user                 */
/* -------------------------------------------------------------------------- */
exports.getAllLeads = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const leads = await Lead.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(leads);
  } catch (error) {
    console.error("❌ Error fetching leads:", error);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
};

/* -------------------------------------------------------------------------- */
/* 📤 GET /api/leads/export — Export current user's leads as CSV              */
/* -------------------------------------------------------------------------- */
exports.exportLeads = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const leads = await Lead.find({ userId });

    if (!leads.length) {
      return res.status(404).json({ message: "No leads available to export" });
    }

    const fields = [
      "name",
      "email",
      "company",
      "website",
      "linkedin",
      "industry",
      "employees",
      "funding",
      "score",
      "message",
    ];

    const parser = new Parser({ fields });
    const csvData = parser.parse(leads.map((l) => (l.toObject ? l.toObject() : l)));

    res.header("Content-Type", "text/csv");
    res.attachment("ProspectPro_Leads.csv");
    res.send(csvData);
  } catch (error) {
    console.error("❌ Error exporting leads:", error);
    res.status(500).json({ error: "Failed to export leads" });
  }
};

/* -------------------------------------------------------------------------- */
/* ❌ DELETE /api/leads/:id — Delete a specific lead                          */
/* -------------------------------------------------------------------------- */
exports.deleteLead = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const lead = await Lead.findOneAndDelete({
      _id: req.params.id,
      userId,
    });

    if (!lead) {
      return res.status(404).json({ message: "Lead not found or not owned by you" });
    }

    res.json({ message: "Lead removed successfully" });
  } catch (err) {
    console.error("❌ Error deleting lead:", err);
    res.status(500).json({ message: "Failed to remove lead" });
  }
};

/* -------------------------------------------------------------------------- */
/* 🧹 DELETE /api/leads — Clear all saved leads for current user              */
/* -------------------------------------------------------------------------- */
exports.clearAllLeads = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    await Lead.deleteMany({ userId });
    res.json({ message: "🧹 All saved leads cleared successfully" });
  } catch (error) {
    console.error("❌ Error clearing all leads:", error);
    res.status(500).json({ error: "Failed to clear leads" });
  }
};
