// src/components/FileUpload.jsx
import React, { useState } from "react";
import axios from "axios";

const FileUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      const res = await axios.post(`${BASE_URL}/api/leads/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      alert(res.data?.message || "✅ Leads uploaded successfully!");
      setFile(null);

      // trigger parent refresh
      if (typeof onUploadSuccess === "function") onUploadSuccess();
    } catch (err) {
      console.error("❌ File upload failed:", err);
      if (err.response?.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        alert(err.response?.data?.error || "Failed to upload leads file");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow w-100 bg-white">
      <h2 className="font-bold text-lg mb-2">Upload Leads (CSV)</h2>

      <label className="block mb-2 text-sm text-gray-600">Select CSV file</label>
      <div className="flex items-center gap-3">
        <input
          id="file-input"
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
          className="text-sm"
        />
      </div>

      {file && <p className="mt-2 text-sm text-gray-700">Selected: <span className="font-medium">{file.name}</span></p>}

      <div className="mt-14">
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="bg-blue-600 disabled:opacity-60 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
