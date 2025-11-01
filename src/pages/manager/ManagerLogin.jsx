import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginManager } from "../../../apis/managerApi/mangerAuthapi";
import axios from "axios";
import apiClient from "../../apis/apiClient/apiClient";

const ManagerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async (e) => {
  e.preventDefault();
  
  // Reset errors
  setError("");
  setFieldErrors({ email: "", password: "" });

  setIsSubmitting(true);

  try {
    const response = await apiClient.post("/manager/login",{
        email:email,password:password
    });
    
    const { token, manager } = response.data;
    
    // Store manager data in localStorage for cross-tab access
    localStorage.setItem('managerRole', manager.role.roleName);
    localStorage.setItem('managerPermissions', JSON.stringify(manager.role.permissions));
    localStorage.setItem('assignedRestaurants', JSON.stringify(manager.assignedRestaurants));
    localStorage.setItem('assignedBrands', JSON.stringify(manager.assignedBrands));

    // Save token in localStorage
    localStorage.setItem("managerToken", token);

     navigate("/manager/dashboard");
    toast.success("Login successful");
    
  } catch (err) {
    let errorMessage = "Login failed. Please try again.";
    let backendFieldErrors = { email: "", password: "" };
    
    if (err.response) {
      const { status, data } = err.response;
      
      if (status === 400 || status === 401) {
        // Use backend error messages if available
        if (data.errors) {
          backendFieldErrors = {
            email: data.errors.email || "",
            password: data.errors.password || ""
          };
        }
        
        // Set general error message
        if (data.message && !data.errors) {
          errorMessage = data.message;
        } else if (data.errors?.email) {
          errorMessage = data.errors.email;
        }
      } else if (status === 500) {
        errorMessage = "Server error. Please try again later.";
      }
    } else if (err.request) {
      errorMessage = "Network error. Please check your connection.";
    } else {
      errorMessage = "An unexpected error occurred.";
    }
    
    setError(errorMessage);
    setFieldErrors(backendFieldErrors);
    
    // Show specific field errors if available
    if (backendFieldErrors.email || backendFieldErrors.password) {
      toast.error("Please fix the errors in the form");
    } else {
      toast.error(errorMessage);
    }
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-lg p-8 rounded-lg border border-gray-200">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Manager Portal</h2>
          <p className="text-gray-600 mt-2">Sign in to manage your restaurants</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors(prev => ({ ...prev, email: "" }));
              }}
              className={`w-full px-3 py-2 border ${
                fieldErrors.email ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="manager@example.com"
              required
            />
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors(prev => ({ ...prev, password: "" }));
              }}
              className={`w-full px-3 py-2 border ${
                fieldErrors.password ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="••••••••"
              required
            />
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="/manager/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Need help?</span>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-gray-600">
            <p>
              Contact support at{" "}
              <a href="mailto:support@example.com" className="font-medium text-blue-600 hover:text-blue-500">
                support@example.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerLogin;