import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { FiMenu,FiHome, FiLogOut } from "react-icons/fi";
import { toast } from "react-toastify";
import Sidebar from "./SIdebar";

function ManagerDashboard() {
  const [showSidebar, setShowSidebar] = useState(false);
  const navigate = useNavigate();
  const permissions = JSON.parse(localStorage.getItem("managerPermissions")) || [];
  const assignedRestaurants = JSON.parse(localStorage.getItem("assignedRestaurants")) || [];
  const assignedBrands = JSON.parse(localStorage.getItem("assignedBrands")) || [];

  // Check if user has specific permission
  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  // Check if manager has access to specific restaurant
  const hasRestaurantAccess = (restaurantId) => {
    return assignedRestaurants.some(r => r._id === restaurantId);
  };

  // Check if manager has access to specific brand
  const hasBrandAccess = (brandId) => {
    return assignedBrands.some(b => b._id === brandId);
  };

  const closeSidebar = () => {
    setShowSidebar(false);
  };

  const handleLogout = () => {
    // Clear all manager-related storage
    localStorage.removeItem("managerToken");
    localStorage.removeItem("managerRole");
    localStorage.removeItem("managerPermissions");
    localStorage.removeItem("assignedRestaurants");
    localStorage.removeItem("assignedBrands");
    
    toast.success("Logged out successfully");
    navigate("/manager/login");
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Mobile Header */}
      <div className="lg:hidden p-4 bg-[#FC8019] text-white flex justify-between items-center w-full fixed top-0 left-0 z-50">
        <h2 className="text-xl font-bold">ORADO Manager</h2>
        <button onClick={() => setShowSidebar(!showSidebar)}>
          <FiMenu size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static z-40 top-0 left-0 h-full w-[20rem] bg-[#FC8019] text-white flex flex-col border-r border-orange-200
        transform ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0
        transition-transform duration-300 ease-in-out
      `}
      >
        {/* Close Sidebar Button (Mobile) */}
        <div className="flex lg:hidden justify-end p-4">
          <button
            onClick={() => setShowSidebar(false)}
            className="text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 flex flex-col">
          {/* Brand/Logo */}
          <div className="p-4 flex items-center justify-center border-b border-orange-200">
            <h1 className="text-2xl font-bold">Manager Portal</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  to="/manager/dashboard"
                  className="flex items-center p-3 rounded-lg hover:bg-orange-600 transition-colors"
                  onClick={closeSidebar}
                >
                  <FiHome className="mr-3" />
                  Dashboard
                </Link>
              </li>

              {hasPermission("view_restaurants") && (
                <li>
                  <Link
                    to="/manager/restaurants"
                    className="flex items-center p-3 rounded-lg hover:bg-orange-600 transition-colors"
                    onClick={closeSidebar}
                  >
                    <FiShoppingBag className="mr-3" />
                    My Restaurants
                  </Link>
                </li>
              )}

              {hasPermission("view_orders") && (
                <li>
                  <Link
                    to="/manager/orders"
                    className="flex items-center p-3 rounded-lg hover:bg-orange-600 transition-colors"
                    onClick={closeSidebar}
                  >
                    <FiList className="mr-3" />
                    Orders
                  </Link>
                </li>
              )}

              {hasPermission("view_menu") && (
                <li>
                  <Link
                    to="/manager/menu"
                    className="flex items-center p-3 rounded-lg hover:bg-orange-600 transition-colors"
                    onClick={closeSidebar}
                  >
                    <FiClipboard className="mr-3" />
                    Menu Management
                  </Link>
                </li>
              )}

              {hasPermission("view_reports") && (
                <li>
                  <Link
                    to="/manager/reports"
                    className="flex items-center p-3 rounded-lg hover:bg-orange-600 transition-colors"
                    onClick={closeSidebar}
                  >
                    <FiPieChart className="mr-3" />
                    Reports
                  </Link>
                </li>
              )}

              {hasPermission("manage_staff") && (
                <li>
                  <Link
                    to="/manager/staff"
                    className="flex items-center p-3 rounded-lg hover:bg-orange-600 transition-colors"
                    onClick={closeSidebar}
                  >
                    <FiUsers className="mr-3" />
                    Staff Management
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {/* Bottom Section - User & Logout */}
          <div className="p-4 border-t border-orange-200">
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-orange-600 transition-colors cursor-pointer">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-white font-medium">
                    {localStorage.getItem("managerRole")?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">Manager</p>
                  <p className="text-xs opacity-80">{localStorage.getItem("managerRole")}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-orange-700"
                title="Logout"
              >
                <FiLogOut />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 pt-16 lg:pt-0">
        <div className="p-5">
          <div className="bg-white rounded-xl shadow-sm">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManagerDashboard;