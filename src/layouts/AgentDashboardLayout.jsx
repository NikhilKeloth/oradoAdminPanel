import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AgentSidebar from '../components/AgentAdminDashboard/common/AgentSidebar';
import { FiMenu, FiX } from 'react-icons/fi';

const AgentDashboardLayout = ({ children }) => {
  const [showSidebar, setShowSidebar] = useState(true);

  const toggleSidebar = () => {
    setShowSidebar(prev => !prev);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop Toggle Button */}
      <div className="hidden md:block fixed top-4 left-4 z-50">
        <button 
          onClick={toggleSidebar}
          className="p-3 bg-[#FC8019] text-white rounded-lg hover:bg-orange-600 transition-all duration-300 shadow-lg"
        >
          {showSidebar ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden p-4 bg-[#FC8019] text-white flex justify-between items-center w-full fixed top-0 left-0 z-50">
        <h2 className="text-xl font-bold">ORADO Agent</h2>
        <button 
          onClick={toggleSidebar}
          className="p-1 rounded-md hover:bg-orange-600 transition-colors"
        >
          {showSidebar ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden" 
          onClick={() => setShowSidebar(false)}
        ></div>
      )}

      {/* Sidebar with Toggle Functionality */}
      <div className={`
        fixed md:static z-40 top-0 left-0 h-full bg-[#FC8019] text-white
        transform transition-all duration-300 ease-in-out
        ${showSidebar ? "translate-x-0 w-64" : "-translate-x-full md:w-0 md:overflow-hidden"}
      `}>
        {/* Mobile Close Button */}
        <div className="flex md:hidden justify-end p-4">
          <button
            onClick={() => setShowSidebar(false)}
            className="text-white text-2xl p-1 hover:bg-orange-600 rounded-md"
          >
            ×
          </button>
        </div>

        <AgentSidebar 
          isOpen={showSidebar} 
          toggleSidebar={() => setShowSidebar(false)}
        />
      </div>
      
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${showSidebar ? "md:ml-2" : "md:ml-0"}`}>
        {/* Add top padding for mobile header */}
        <main className="flex-1 overflow-y-auto  ">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AgentDashboardLayout;