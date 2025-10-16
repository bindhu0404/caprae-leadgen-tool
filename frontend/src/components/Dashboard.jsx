// src/components/Dashboard.jsx
import React from "react";

const Dashboard = ({ leads, copyMessage }) => {
  if (!leads || leads.length === 0)
    return <p className="mt-4 text-gray-600">No leads yet for this user.</p>;

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {["name/company", "email", "website", "industry", "city", "score", "action"].map((key) => (
              <th key={key} className="border px-3 py-2 text-left text-sm font-medium text-gray-700">
                {key.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, i) => {
            const score = typeof lead.score === "number" ? lead.score : 0;
            const rowClass =
              score > 70 ? "bg-green-50" : score > 40 ? "bg-yellow-50" : "bg-red-50";

            return (
              <tr key={lead._id || i} className={`${rowClass} hover:bg-gray-100`}>
                <td className="border px-3 py-2">{lead.name || lead.company || "-"}</td>
                <td className="border px-3 py-2">{lead.email || "-"}</td>
                <td className="border px-3 py-2">
                  {lead.website ? (
                    <a href={lead.website} target="_blank" rel="noreferrer" className="text-blue-600">
                      {lead.website}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="border px-3 py-2">{lead.industry || "-"}</td>
                <td className="border px-3 py-2">{lead.city || "-"}</td>
                <td className="border px-3 py-2">{score}</td>
                <td className="border px-3 py-2">
                  {lead.message ? (
                    <button
                      onClick={() => copyMessage(lead.message)}
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      Copy Message
                    </button>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
