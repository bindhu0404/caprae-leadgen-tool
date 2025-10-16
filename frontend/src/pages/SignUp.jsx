import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup", formData);
      if (res.status === 201) {
        setSuccess("Account created successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        autoComplete="off"
        className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 w-96"
      >
        <h2 className="text-2xl font-bold text-center mb-4">Create Account</h2>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
          <input
            type="text"
            autoComplete="new-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="border rounded w-full py-2 px-3 text-gray-700"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
          <input
            type="email"
            autoComplete="new-email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="border rounded w-full py-2 px-3 text-gray-700"
          />
        </div>

        <div className="mb-6 relative">
          <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-10 text-gray-600 hover:text-gray-800"
          >
            {/* {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />} */}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-3">{success}</p>}

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
        >
          Sign Up
        </button>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
