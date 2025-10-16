// src/components/ManualEntry.jsx
import React, { useState } from "react";
import axios from "axios";

const ManualEntry = ({ onManualAdd }) => {
  // We'll only send minimal fields (name + industry) so backend enrichment fills remaining fields.
  const [form, setForm] = useState({
    name: "",
    industry: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name && !form.industry) return alert("Please provide at least a name or industry");

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      await axios.post(`${BASE_URL}/api/leads/manual`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ Lead added successfully");
      setForm({ name: "", industry: "" });

      // refresh parent list from server
      if (typeof onManualAdd === "function") onManualAdd();
    } catch (err) {
      console.error("❌ Error adding lead manually:", err);
      alert(err.response?.data?.error || "Failed to add lead manually");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg shadow w-100 bg-white">
      <h2 className="font-bold text-lg mb-2">Add Lead Manually</h2>

      <input
        name="name"
        type="text"
        placeholder="Name (or contact)"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="block border p-2 mb-2 rounded w-full"
      />

      <input
        name="industry"
        type="text"
        placeholder="Industry"
        value={form.industry}
        onChange={(e) => setForm({ ...form, industry: e.target.value })}
        className="block border p-2 mb-2 rounded w-full"
      />

      <p className="text-xs text-gray-500 mb-2">
        Name and industry fields are required
      </p>

      <button
        type="submit"
        disabled={submitting}
        className="bg-green-600 disabled:opacity-60 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        {submitting ? "Adding..." : "Add Lead"}
      </button>
    </form>
  );
};

export default ManualEntry;
