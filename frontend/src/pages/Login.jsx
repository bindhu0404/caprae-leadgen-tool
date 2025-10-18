// src/pages/Login.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";



  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, formData);
      // expected: { message: "Login successful", token: "..." }
      if (res?.data?.token) {
        localStorage.setItem("token", res.data.token);
        setMessage("Login successful — redirecting...");
        setTimeout(() => navigate("/dashboard"), 800);
      } else {
        setMessage(res.data?.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">Login</h2>
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
        {message && <p className="mt-3 text-center text-sm text-gray-600">{message}</p>}
        <p className="text-center text-sm mt-4 text-gray-700">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
