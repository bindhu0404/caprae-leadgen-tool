import React, { useEffect, useState } from "react";
import * as CryptoJS from "crypto-js";
import { FaCopy, FaEdit, FaTrash } from "react-icons/fa";


/**
 * Vault page (TypeScript)
 * - stores encrypted passwords in localStorage
 * - AES encrypt / decrypt via crypto-js
 * - add / edit / delete / copy
 * - search & simple UI (Tailwind)
 */

/* simple item type */
type VaultItem = {
  id: string;
  site: string;
  username: string;
  password: string; // encrypted
};

const STORAGE_KEY = "prospectpro_vault";
const ENCRYPTION_KEY = import.meta.env.VITE_VAULT_KEY || "prospectpro-default-key";

export default function Vault(){
  const [items, setItems] = useState<VaultItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as VaultItem[]) : [];
    } catch {
      return [];
    }
  });

  const [site, setSite] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    // persist to localStorage whenever items change
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Failed to persist vault:", err);
    }
  }, [items]);

  // Encryption helpers
  function encrypt(clear: string) {
    return CryptoJS.AES.encrypt(clear, ENCRYPTION_KEY).toString();
  }

  function decrypt(cipher: string) {
    try {
      const bytes = CryptoJS.AES.decrypt(cipher, ENCRYPTION_KEY);
      const text = bytes.toString(CryptoJS.enc.Utf8);
      return text;
    } catch {
      return "";
    }
  }

  function resetForm() {
    setSite("");
    setUsername("");
    setPassword("");
    setEditingId(null);
  }

  function handleAddOrUpdate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!site.trim() || !username.trim() || !password) {
      // basic validation
      return;
    }

    const encrypted = encrypt(password);

    if (editingId) {
      setItems((prev) =>
        prev.map((it) => (it.id === editingId ? { ...it, site, username, password: encrypted } : it))
      );
    } else {
      const newItem: VaultItem = {
        id: Date.now().toString(),
        site: site.trim(),
        username: username.trim(),
        password: encrypted,
      };
      setItems((prev) => [...prev, newItem]);
    }
    resetForm();
  }

  function handleEdit(id: string) {
    const it = items.find((i) => i.id === id);
    if (!it) return;
    setSite(it.site);
    setUsername(it.username);
    setPassword(decrypt(it.password));
    setEditingId(id);
    // scroll to form (nice UX)
    const el = document.querySelector("#vault-form");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this item?")) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (editingId === id) resetForm();
  }

  async function handleCopy(id: string) {
    const it = items.find((i) => i.id === id);
    if (!it) return;
    const text = decrypt(it.password);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch (err) {
      console.error("clipboard error", err);
    }
  }

  const filtered = items.filter(
    (it) =>
      it.site.toLowerCase().includes(search.toLowerCase()) ||
      it.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-blue-700">ProspectPro Vault</h1>
          <div className="text-sm text-gray-500">Encrypted client-side with AES</div>
        </div>

        {/* form */}
        <form id="vault-form" onSubmit={handleAddOrUpdate} className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              className="border rounded p-2"
              placeholder="Website / App name"
              value={site}
              onChange={(e) => setSite(e.target.value)}
              name="site"
            />
            <input
              className="border rounded p-2"
              placeholder="Username / Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              name="username"
            />
            <input
              className="border rounded p-2"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              name="password"
            />
          </div>

          <div className="flex gap-3 mt-3">
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            >
              {editingId ? "Update Entry" : "Add Entry"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-100 border px-3 rounded text-gray-700"
            >
              Reset
            </button>

            <input
              type="text"
              placeholder="Search by site or username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ml-auto border rounded p-2 w-60"
            />
          </div>
        </form>

        {/* list */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Password</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-500">No entries found.</td>
                </tr>
              ) : (
                filtered.map((it) => (
                  <tr key={it.id}>
                    <td className="px-4 py-3">{it.site}</td>
                    <td className="px-4 py-3">{it.username}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{/* masked */}••••••••</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          title="Copy password"
                          onClick={() => handleCopy(it.id)}
                          className="p-2 rounded hover:bg-gray-100"
                        >
                          <FaCopy />
                        </button>

                        <button
                          title="Edit"
                          onClick={() => handleEdit(it.id)}
                          className="p-2 rounded hover:bg-gray-100"
                        >
                          <FaEdit />
                        </button>

                        <button
                          title="Delete"
                          onClick={() => handleDelete(it.id)}
                          className="p-2 rounded hover:bg-gray-100 text-red-600"
                        >
                          <FaTrash />
                        </button>
                      </div>

                      {/* small inline status */}
                      <div className="text-xs text-gray-500 mt-1">
                        {copiedId === it.id ? "Copied to clipboard" : ""}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* helpful footer */}
        <div className="text-xs text-gray-500 mt-3">
          Note: Passwords are encrypted client-side using AES. They never leave your browser in this demo.
        </div>
      </div>
    </div>
  );
}
