import React, { useState } from 'react';
import { 
  FiHome, 
  FiList, 
  FiClipboard,
  FiUsers,
  FiAlertCircle,
  FiDollarSign,
  FiSettings,
  FiLogOut,
  FiChevronDown,
  FiChevronUp,
  FiPieChart
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

const AgentSidebar = ({ isOpen, toggleSidebar }) => {
  const [expandedSections, setExpandedSections] = useState({
    agents: false,
    settings: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle link clicks - close sidebar on mobile
  const handleLinkClick = () => {
    if (window.innerWidth < 768) { // Mobile breakpoint
      toggleSidebar();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FC8019] text-white">
      {/* Logo */}
      <div className="p-5 border-b border-orange-200 flex items-center">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
          <span className="text-[#FC8019] font-bold text-lg">O</span>
        </div>
        <h2 className="text-xl font-bold">ORADO Agent</h2>
      </div>

      {/* Panel Title */}
      <div className="p-3 border-b border-orange-200">
        <div className="bg-orange-500 text-white rounded-lg p-2 text-center text-sm font-medium">
          Agent Panel
        </div>
      </div>

      {/* Single scrollable container for all content */}
      <div className="flex-1 overflow-y-auto">
        <div className="py-4 space-y-1 px-2">
          {/* Dashboard */}
          <div className="mb-1">
            <Link 
              to="/admin/agent-slider" 
              className="flex items-center px-4 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer"
              onClick={handleLinkClick}
            >
              <FiPieChart className="mr-3" />
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Agents Section */}
          <div className="mb-1">
            <div 
              className="flex justify-between items-center px-4 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer"
              onClick={() => toggleSection('agents')}
            >
              <div className="flex items-center">
                <FiUsers className="mr-3" />
                <span>Agents</span>
              </div>
              {expandedSections.agents ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </div>
            {expandedSections.agents && (
              <div className="ml-6 bg-white text-gray-800 rounded-lg mt-1 py-2">
                <Link 
                  to="/admin/agent-slider/agent/approval" 
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                  onClick={handleLinkClick}
                >
                  Agent Approvals
                </Link>
                <Link 
                  to="/admin/agent-slider/agent/list" 
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                  onClick={handleLinkClick}
                >
                  Agent List
                </Link>
                <Link 
                  to="/admin/agent-slider/agent-selfie" 
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                  onClick={handleLinkClick}
                >
                  Agent Selfie Logs
                </Link>
                <Link 
                  to="/admin/agent-slider/agent-payout" 
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                  onClick={handleLinkClick}
                >
                  Agent Payouts
                </Link>
                <Link 
                  to="/admin/agent-slider/agent-cod-limit" 
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                  onClick={handleLinkClick}
                >
                  Agent COD Monitoring
                </Link>
                <Link 
                  to="/admin/agent-slider/agent-leave" 
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                  onClick={handleLinkClick}
                >
                  Agent Leave Approvals
                </Link>
                <Link 
                  to="/admin/agent-slider/warnings-termination" 
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                  onClick={handleLinkClick}
                >
                  Warnings & Termination
                </Link>
              </div>
            )}
          </div>

          {/* Allocation Methods */}
          <div className="mb-1">
            <Link 
              to="/admin/agent-slider/settings/allocation-method" 
              className="flex items-center px-4 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer"
              onClick={handleLinkClick}
            >
              <FiList className="mr-3" />
              <span>Allocation Methods</span>
            </Link>
          </div>

          {/* Earnings Settings */}
          <div className="mb-1">
            <Link 
              to="/admin/agent-slider/agent-earnings-settings" 
              className="flex items-center px-4 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer"
              onClick={handleLinkClick}
            >
              <FiDollarSign className="mr-3" />
              <span>Earnings Settings</span>
            </Link>
          </div>

          {/* Settings */}
          <div className="mb-1">
            <div 
              className="flex justify-between items-center px-4 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer"
              onClick={() => toggleSection('settings')}
            >
              <div className="flex items-center">
                <FiSettings className="mr-3" />
                <span>Settings</span>
              </div>
              {expandedSections.settings ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </div>
            {expandedSections.settings && (
              <div className="ml-6 bg-white text-gray-800 rounded-lg mt-1 py-2">
                <Link 
                  to="/admin/agent-slider/theme-settings" 
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                  onClick={handleLinkClick}
                >
                  Theme Settings
                </Link>
                <Link 
                  to="/admin/agent-slider/settings/incentive-plan" 
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                  onClick={handleLinkClick}
                >
                  Incentive Plans
                </Link>
                <Link 
                  to="/admin/agent-slider/settings/milestone" 
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                  onClick={handleLinkClick}
                >
                  Milestone Rules
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Logout */}
        <div className="border-t border-orange-200 p-4">
          <div 
            className="flex items-center justify-between text-white hover:bg-orange-500 transition-all duration-200 cursor-pointer rounded-lg p-3"
            onClick={handleLinkClick}
          >
            <div className="flex items-center">
              <FiLogOut size={18} />
              <span className="ml-3 font-medium">Logout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentSidebar;