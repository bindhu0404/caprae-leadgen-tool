import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import DashboardPage from "./pages/Dashboard";
import CompanyDetail from "./pages/CompanyDetail";
import EnrichPage from "./pages/EnrichPage"; 

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Default route → login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/enrich" element={<EnrichPage />} /> 

        {/* Company detail */}
        <Route path="/company/:id" element={<CompanyDetail />} />
      </Routes>
    </Router>
  );
};

export default App;
