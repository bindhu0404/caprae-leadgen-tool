// src/pages/Signup.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";


  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axios.post(`${API_URL}/api/auth/signup`, formData);
      if (res.status === 201) {
        setMessage("Account created. Redirecting to login...");
        setTimeout(() => navigate("/login"), 1200);
      } else {
        setMessage(res.data?.message || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setMessage(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} autoComplete="off" className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 w-96">
        <h2 className="text-2xl font-bold text-center mb-4">Create Account</h2>
        <input name="name" value={formData.name} onChange={handleChange} required placeholder="Name" className="border rounded w-full py-2 px-3 mb-3"/>
        <input name="email" value={formData.email} onChange={handleChange} type="email" required placeholder="Email" className="border rounded w-full py-2 px-3 mb-3"/>
        <input name="password" value={formData.password} onChange={handleChange} type="password" required placeholder="Password" className="border rounded w-full py-2 px-3 mb-3"/>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">Sign Up</button>
        {message && <p className="text-sm mt-3 text-center">{message}</p>}
        <p className="text-center text-sm mt-4">Already have an account? <Link to="/login" className="text-blue-600">Login</Link></p>
      </form>
    </div>
  );
}
