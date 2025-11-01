// AnalyticsDashboardSwitcher.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

const AnalyticsDashboardSwitcher = () => {
  const location = useLocation();

  // Helper function to determine if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="p-6 pt-0 pl-1 flex gap-4">
      <Link
        to="/admin/dashboard/analytics/user"
        className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center gap-2
                 ${isActive("/user/analytics") ? "bg-orange-100 text-orange-600 shadow-md" : "bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:shadow-md"}`}
      >
        👥 User Analytics
      </Link>

      <Link
        to="/admin/dashboard/analytics/order"
        className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center gap-2
                 ${isActive("/orders/analytics") ? "bg-orange-100 text-orange-600 shadow-md" : "bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:shadow-md"}`}
      >
        📊 Orders & Revenue
      </Link>
    </div>
  );
};

export default AnalyticsDashboardSwitcher;