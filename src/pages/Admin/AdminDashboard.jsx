import { TicketCheck, Receipt, SquareGanttChart } from "lucide-react";
import React, { useState } from "react";
import { FaUserSecret } from "react-icons/fa";
import {
  FiMenu,
  FiX,
  FiLogOut,
  FiChevronDown,
  FiChevronUp,
  FiPieChart,
  FiClipboard,
  FiHome,
  FiSettings,
  FiList,
  FiCalendar,
  FiShoppingBag,
  FiUsers,
  FiTag,
  FiMail,
  FiLayers,
  FiImage
} from "react-icons/fi";
import { CiDeliveryTruck } from "react-icons/ci";
import { MdDeliveryDining, MdOutlineLocalOffer } from "react-icons/md";
import { FaChevronRight, FaChevronDown as FaChevronDownIcon } from "react-icons/fa";
import { GrUserAdmin, GrUser } from "react-icons/gr";
import { Link, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function AdminDashboard() {
  const [showSidebar, setShowSidebar] = useState(true);
  const permissions = JSON.parse(localStorage.getItem("permissions")) || [];

  const toggleSidebar = () => {
    setShowSidebar(prev => !prev);
  };

  const closeSidebar = () => {
    setShowSidebar(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Mobile Header */}
      <div className="lg:hidden p-4 bg-[#FC8019] text-white flex justify-between items-center w-full fixed top-0 left-0 z-50">
        <h2 className="text-xl font-bold">ORADO Admin</h2>
        <button 
          onClick={toggleSidebar}
          className="p-1 rounded-md hover:bg-orange-600 transition-colors"
        >
          {showSidebar ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Desktop Hamburger */}
      <div className="hidden lg:block fixed top-4 left-4 z-50">
        <button 
          onClick={toggleSidebar}
          className="p-3 bg-[#FC8019] text-white rounded-lg hover:bg-orange-600 transition-all duration-300 shadow-lg"
        >
          {showSidebar ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden" 
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static z-40 top-0 left-0 h-full bg-[#FC8019] text-white flex flex-col
          transform transition-all duration-300 ease-in-out
          ${showSidebar ? "translate-x-0 w-64" : "-translate-x-full lg:w-0 lg:overflow-hidden"}
        `}
      >
        {/* Mobile Close Button */}
        <div className="flex lg:hidden justify-end p-4">
          <button
            onClick={closeSidebar}
            className="text-white text-2xl p-1 hover:bg-orange-600 rounded-md"
          >
            ×
          </button>
        </div>

        <Sidebar 
          isOpen={showSidebar} 
          toggleSidebar={closeSidebar}
        />
      </div>

      {/* Main Content - FIXED SPACING */}
      <div className={`flex-1 overflow-auto transition-all duration-300 ${showSidebar ? "lg:ml-8" : "lg:ml-0"}`}>
        <div className="min-h-full bg-gray-50">
          <div className="p-0"> {/* REMOVED padding */}
            <div className="bg-white min-h-screen"> {/* REMOVED rounded and shadow */}
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;