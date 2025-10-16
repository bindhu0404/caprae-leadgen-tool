// backend/index.js
import express from "express";
import cors from "cors";
import multer from "multer";
import csv from "fast-csv";
import fs from "fs";

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// Enrichment + scoring logic
const enrichLead = (lead) => {
  const industries = ["SaaS", "FinTech", "Retail", "Healthcare"];
  const sizes = ["1-10", "11-50", "51-200", "201-500", "500+"];
  const revenues = ["<$1M", "$1M-$5M", "$5M-$20M", "$20M+"];

  const linkedinScore = Math.random() > 0.5 ? 20 : 0;
  const emailScore = lead.email.includes("@") ? 30 : 0;
  const websiteScore = lead.website ? 30 : 0;
  const companyScore = 20; // simple placeholder

  const score = emailScore + websiteScore + linkedinScore + companyScore;

  const message = `Hi ${lead.name}, I noticed ${lead.company} is in the ${industries[Math.floor(Math.random() * industries.length)]} industry. We help companies like yours scale faster with AI-powered lead solutions.`;

  return {
    ...lead,
    industry: industries[Math.floor(Math.random() * industries.length)],
    size: sizes[Math.floor(Math.random() * sizes.length)],
    revenue: revenues[Math.floor(Math.random() * revenues.length)],
    linkedin: linkedinScore > 0 ? "Yes" : "No",
    score,
    message,
  };
};

// Upload CSV and enrich
app.post("/upload", upload.single("file"), (req, res) => {
  const leads = [];
  fs.createReadStream(req.file.path)
    .pipe(csv.parse({ headers: true }))
    .on("data", (row) => leads.push(row))
    .on("end", () => {
      const enriched = leads.map(enrichLead);
      fs.unlinkSync(req.file.path);
      res.json(enriched);
    });
});

// Manual lead input
app.post("/manual", (req, res) => {
  const enrichedLead = enrichLead(req.body);
  res.json(enrichedLead);
});

// Export CSV
app.post("/export", (req, res) => {
  const leads = req.body.leads;
  const ws = fs.createWriteStream("leads_export.csv");
  csv.write(leads, { headers: true }).pipe(ws).on("finish", () => {
    res.download("leads_export.csv", "ProspectPro_Leads.csv", (err) => {
      if (err) console.log(err);
      fs.unlinkSync("leads_export.csv");
    });
  });
});

app.listen(port, () => console.log(`✅ Backend running on http://localhost:${port}`));
