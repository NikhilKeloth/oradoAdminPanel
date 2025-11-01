// AdminLogin.jsx
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../../apis/apiClient/apiClient";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const Navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      const from = location.state?.from?.pathname || "/admin/dashboard/order/table";
      Navigate(from, { replace: true });
    }
  }, [Navigate, location.state]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Both fields are required.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await apiClient.post("/admin/login", {
        email,
        password,
      });
      

      console.log(response.data)
      const { token, user } = response.data;
      localStorage.setItem('userId',user.id)

      localStorage.setItem('userRole',user.userType)
      localStorage.setItem('permissions',JSON.stringify(user.adminPermissions))
      // Save token in localStorage for cross-tab access
      localStorage.setItem("adminToken", token);
      Navigate("/admin/dashboard/order/table");
      toast.success("Login successFull");
      // Redirect to admin dashboard or homepage
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || "Login failed.");
      } else {
        setError("Network error.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full shadow-lg p-8 rounded-md border border-gray-200">
        <h2 className="text-3xl font-sans font-bold text-center text-[#EA4424] mb-6">
          Admin Login
        </h2>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-md mt-1 focus:ring-[#EA4424] focus:border-[#EA4424]"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-md mt-1 focus:ring-[#EA4424] focus:border-[#EA4424]"
              placeholder="********"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="text-[#EA4424] focus:ring-[#EA4424]"
              />
              Remember Me
            </label>
            <a
              href="/forgot-password"
              className="text-[#EA4424] hover:underline"
            >
              Forgot Password?
            </a>
          </div>

          {/* Optional 2FA Placeholder */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              2FA Code
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 p-2 rounded-md mt-1"
              placeholder="Enter your code"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#EA4424] text-white font-semibold py-2 rounded-md hover:bg-[#cf3b1f] transition-colors"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-xs text-gray-500 text-center">
          This page is protected by HTTPS to keep your credentials secure.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
