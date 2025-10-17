// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import FileUpload from "../components/FileUpload";
import ManualEntry from "../components/ManualEntry";
import { useNavigate, Link } from "react-router-dom";
import { FaTrashAlt, FaMagic } from "react-icons/fa"; // export removed on saved leads

const DashboardPage = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const [tab, setTab] = useState("companies");
  const [filters, setFilters] = useState({ industry: "", city: "" });

  const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 2200);
  };

  const handleAxiosError = (err) => {
    if (err?.response?.status === 401) {
      alert("Session expired. Please log in again.");
      localStorage.removeItem("token");
      navigate("/login");
    } else {
      console.error("❌ API Error:", err);
    }
  };

  /* ---------------------- Leads (DB-backed) ---------------------- */
  // Fetch leads and then enrich locally using companies DB (frontend-only enrichment)
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // 1. get leads
      const leadsRes = await axios.get(`${BASE_URL}/api/leads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const freshLeads = Array.isArray(leadsRes.data) ? leadsRes.data : leadsRes.data?.leads || [];

      // 2. get companies (we will use to fill missing city/website)
      // Note: getAllCompanies endpoint exists in your backend (GET /api/companies)
      let companyList = [];
      try {
        const compRes = await axios.get(`${BASE_URL}/api/companies`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        companyList = Array.isArray(compRes.data) ? compRes.data : [];
        setCompanies(companyList);
      } catch (compErr) {
        // If company fetch fails, we still set leads (without enrichment)
        console.warn("⚠️ Failed to fetch companies for enrichment:", compErr);
        companyList = [];
        setCompanies([]);
      }

      // 3. enrich leads client-side by matching company records
      const enriched = enrichLeadsWithCompanies(freshLeads, companyList);

      // 4. update state
      setLeads(enriched);
    } catch (err) {
      console.error("❌ Failed to fetch saved leads:", err);
      showNotification("❌ Failed to fetch saved leads");
      handleAxiosError(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper: match a lead to companies list by website (strong) or name (case-insensitive)
  const enrichLeadsWithCompanies = (leadsArr, companiesArr) => {
    if (!Array.isArray(leadsArr) || !Array.isArray(companiesArr)) return leadsArr || [];

    // Build quick lookup by website and by normalized name
    const byWebsite = new Map();
    const byName = new Map();
    companiesArr.forEach((c) => {
      if (c.website) byWebsite.set(normalizeUrl(c.website), c);
      if (c.name) byName.set((c.name || "").trim().toLowerCase(), c);
    });

    return leadsArr.map((lead) => {
      // copy lead so we don't mutate original
      const item = { ...lead };

      // attempt match by website first
      if (item.website) {
        const normalized = normalizeUrl(item.website);
        const match = byWebsite.get(normalized);
        if (match) {
          // fill missing fields
          item.city = item.city || match.city || item.city;
          item.website = item.website || match.website || item.website;
          item.industry = item.industry || match.industry || item.industry;
          item.employees = item.employees || match.employees || item.employees;
          item.funding = item.funding || match.funding || item.funding;
          item.email = item.email || match.email || item.email;
          item.linkedin = item.linkedin || match.linkedin || item.linkedin;
          return item;
        }
      }

      // attempt match by name
      const leadNameKey = (item.name || item.company || "").trim().toLowerCase();
      if (leadNameKey) {
        const match = byName.get(leadNameKey);
        if (match) {
          item.city = item.city || match.city || item.city;
          item.website = item.website || match.website || item.website;
          item.industry = item.industry || match.industry || item.industry;
          item.employees = item.employees || match.employees || item.employees;
          item.funding = item.funding || match.funding || item.funding;
          item.email = item.email || match.email || item.email;
          item.linkedin = item.linkedin || match.linkedin || item.linkedin;
          return item;
        }
      }

      // no match: just return lead as-is
      return item;
    });
  };

  // normalize URLs for matching - strip trailing slash & protocol
  const normalizeUrl = (u) => {
    if (!u) return u;
    try {
      // ensure it has protocol for URL constructor
      let url = u;
      if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
      const parsed = new URL(url);
      // return host + pathname without trailing slash
      const p = parsed.hostname + parsed.pathname.replace(/\/$/, "");
      return p.toLowerCase();
    } catch (e) {
      return (u || "").toLowerCase().replace(/\/$/, "");
    }
  };

  const saveLead = async (company) => {
    try {
      const token = localStorage.getItem("token");

      const alreadySaved = leads.some(
        (lead) =>
          (lead.name && lead.name.toLowerCase() === (company.name || "").toLowerCase()) ||
          (lead.website && company.website && lead.website === company.website) ||
          (lead.company && lead.company.toLowerCase() === (company.name || "").toLowerCase())
      );

      if (alreadySaved) {
        showNotification("⚠️ Lead already saved!");
        return;
      }

      await axios.post(
        `${BASE_URL}/api/leads`,
        {
          name: company.name,
          industry: company.industry,
          city: company.city,
          website: company.website,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // refresh from DB (will auto-enrich via fetchLeads)
      await fetchLeads();
      showNotification(`✅ Lead saved for ${company.name}`);
    } catch (err) {
      showNotification("❌ Failed to save lead");
      handleAxiosError(err);
    }
  };

  const deleteLead = async (id) => {
    if (!window.confirm("Delete this lead?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/api/leads/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // update UI immediately
      setLeads((prev) => prev.filter((l) => l._id !== id));
      showNotification("🗑 Lead deleted");
    } catch (err) {
      showNotification("❌ Failed to delete lead");
      handleAxiosError(err);
    }
  };

  const clearAllLeads = async () => {
    if (!window.confirm("Are you sure you want to delete all saved leads?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/api/leads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeads([]);
      showNotification("🧹 All leads cleared");
    } catch (err) {
      showNotification("❌ Failed to clear leads");
      handleAxiosError(err);
    }
  };

  /* ---------------------- Companies search (unchanged) ---------------------- */
  const fetchCompanies = async () => {
    if (!filters.industry && !filters.city) {
      showNotification("Please enter at least an industry or location to search.");
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/companies/search`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters,
      });
      setCompanies(res.data || []);
      if (res.data.length === 0) showNotification("No matching companies found.");
    } catch (err) {
      showNotification("Failed to fetch companies");
      handleAxiosError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrich = () => navigate("/enrich");
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    if (tab === "leads") fetchLeads();
    // we intentionally do not auto-fetch companies here; fetchLeads calls GET /api/companies internally
  }, [tab]);

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-blue-700">Company Finder</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setTab("companies")}
          className={`px-4 py-2 rounded-lg ${tab === "companies" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Companies
        </button>
        <button
          onClick={() => setTab("leads")}
          className={`px-4 py-2 rounded-lg ${tab === "leads" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Saved Leads
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-100 text-blue-800 shadow">
          {notification}
        </div>
      )}

      {/* Companies tab */}
      {tab === "companies" && (
        <div>
          <div className="bg-gray-50 rounded-lg p-6 shadow mb-6">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Search Criteria</h2>
            <p className="text-gray-500 mb-4">Enter industry and location to find companies</p>

            <div className="flex flex-wrap gap-4 items-center">
              <input
                type="text"
                placeholder="Example: Fintech"
                value={filters.industry}
                onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                className="border p-2 rounded w-1/3"
              />
              <input
                type="text"
                placeholder="Example: Bangalore"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="border p-2 rounded w-1/3"
              />

              <button onClick={fetchCompanies} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Find Companies
              </button>
              <button onClick={() => { setFilters({ industry: "", city: "" }); setCompanies([]); }} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
                Clear
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-gray-600">Searching companies...</p>
          ) : companies.length > 0 ? (
            <table className="w-full border rounded shadow">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Industry</th>
                  <th className="p-2 border">City</th>
                  <th className="p-2 border">Website</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c._id || c.name} className="hover:bg-gray-50">
                    <td className="p-2 border font-medium text-blue-600">
                      <Link to={`/company/${c._id || ""}`}>{c.name}</Link>
                    </td>
                    <td className="p-2 border">{c.industry}</td>
                    <td className="p-2 border">{c.city || "-"}</td>
                    <td className="p-2 border">
                      {c.website ? (
                        <a href={c.website} target="_blank" rel="noreferrer">
                          {c.website}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-2 border text-center">
                      <button
                        onClick={() => saveLead(c)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Save Lead
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-500">No companies to show. Search to find companies.</p>
          )}
        </div>
      )}

      {/* Saved Leads tab */}
      {tab === "leads" && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUpload onUploadSuccess={fetchLeads} />
            <ManualEntry onManualAdd={fetchLeads} />
          </div>

          {loading ? (
            <p className="text-center text-gray-600">Loading leads...</p>
          ) : leads.length > 0 ? (
            <>
              <table className="w-full border rounded shadow mt-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Name / Company</th>
                    <th className="p-2 border">Industry</th>
                    <th className="p-2 border">City</th>
                    <th className="p-2 border">Website</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-gray-50">
                      <td className="p-2 border text-blue-600">{lead.name || lead.company || "-"}</td>
                      <td className="p-2 border">{lead.industry || "-"}</td>
                      <td className="p-2 border">{lead.city || "-"}</td>
                      <td className="p-2 border">
                        {lead.website ? (
                          <a href={lead.website} target="_blank" rel="noreferrer">
                            {lead.website}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-2 border text-center">
                        <button
                          onClick={() => deleteLead(lead._id)}
                          className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-center gap-6 mt-6">
                <button
                  onClick={clearAllLeads}
                  className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  <FaTrashAlt /> Clear All
                </button>

                <button
                  onClick={handleEnrich}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  <FaMagic /> Enrich
                </button>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500 mt-4">No leads saved yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
