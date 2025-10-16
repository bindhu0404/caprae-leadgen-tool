function getRandomSizeAndRevenue() {
  // Random size
  const sizes = ["Small", "Medium", "Large"];
  const size = sizes[Math.floor(Math.random() * sizes.length)];

  // Revenue brackets based on size
  let revenue;
  if (size === "Small") revenue = Math.floor(Math.random() * 1000000) + 50000; // $50k–$1M
  else if (size === "Medium") revenue = Math.floor(Math.random() * 9000000) + 1000000; // $1M–$10M
  else revenue = Math.floor(Math.random() * 90000000) + 10000000; // $10M–$100M

  return { size, revenue };
}

function validateEmail(email) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email) ? 1 : 0;
}

function checkWebsite(website) {
  return website && website !== "" ? 1 : 0;
}

function checkLinkedIn(linkedin) {
  return linkedin && linkedin !== "" ? 1 : 0;
}

function industryScore(industry, targetIndustries = ["Tech", "Finance", "Healthcare"]) {
  return targetIndustries.includes(industry) ? 100 : 50;
}

function sizeScore(size) {
  if (size === "Small") return 50;
  else if (size === "Medium") return 70;
  else return 100; // Large
}

function revenueScore(revenue) {
  if (revenue < 1000000) return 50;
  else if (revenue < 10000000) return 70;
  else return 100;
}

function generateMessage(name, company, score) {
  if (score >= 80) {
    return `Hi ${name}, we see great potential for ${company} to benefit from our solutions. Let's connect!`;
  } else if (score >= 60) {
    return `Hi ${name}, we thought ${company} might find our solutions interesting. Would love to chat.`;
  } else {
    return `Hi ${name}, reaching out from ProspectPro. Happy to discuss opportunities with ${company}.`;
  }
}

// Main enrichment function
function enrichLead(lead) {
  // Generate size/revenue if missing
  if (!lead.size || !lead.revenue) {
    const generated = getRandomSizeAndRevenue();
    lead.size = generated.size;
    lead.revenue = generated.revenue;
  }

  // Scoring weights
  const emailScore = validateEmail(lead.email) * 25;
  const websiteScoreValue = checkWebsite(lead.website) * 15;
  const linkedinScoreValue = checkLinkedIn(lead.linkedin) * 10;
  const sizeScoreValue = sizeScore(lead.size) * 0.2;
  const revenueScoreValue = revenueScore(lead.revenue) * 0.2;
  const indScore = industryScore(lead.industry) * 0.1;

  // Weighted total score
  const totalScore =
    emailScore +
    websiteScoreValue +
    linkedinScoreValue +
    sizeScoreValue +
    revenueScoreValue +
    indScore;

  lead.score = Math.min(Math.round(totalScore), 100);
  lead.message = generateMessage(lead.name, lead.company, lead.score);

  return lead;
}

module.exports = { enrichLead };
