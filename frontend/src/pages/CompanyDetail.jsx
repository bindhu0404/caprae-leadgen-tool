import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const CompanyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/api/companies/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCompany(res.data);
      } catch (err) {
        alert("Failed to load company details");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!company) return <p className="text-center mt-10">Company not found</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-4">{company.name}</h1>
      <p><strong>Industry:</strong> {company.industry}</p>
      <p><strong>City:</strong> {company.city}</p>
      <p><strong>Website:</strong> {company.website || "-"}</p>
      <p><strong>Revenue:</strong> {company.revenue || "-"}</p>
    </div>
  );
};

export default CompanyDetail;
