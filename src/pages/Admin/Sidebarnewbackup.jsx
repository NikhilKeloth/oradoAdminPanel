import React, { useState, useEffect } from 'react';
import { 
  FiHome, 
  FiList, 
  FiCalendar, 
  FiShoppingBag, 
  FiUsers, 
  FiPieChart,
  FiTag,
  FiMail,
  FiSettings,
  FiLayers,
  FiImage,
  FiLogOut,
  FiClipboard,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import { FaChevronRight, FaChevronDown as FaChevronDownIcon, FaUserSecret } from 'react-icons/fa';
import { CiDeliveryTruck } from "react-icons/ci";
import { MdDeliveryDining, MdOutlineLocalOffer } from "react-icons/md";
import { GrUserAdmin, GrUser } from "react-icons/gr";
import { TicketCheck, Receipt, SquareGanttChart } from "lucide-react";
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    getStarted: true, // Expanded by default
    dashboard: false,
    approvals: false,
    restaurants: false,
    offers: false,
    orders: false,
    marketing: false,
    surge: false,
    agents: false,
    admins: false,
    customers: false,
    ticket: false,
    transactions: false,
    taxDelivery: false,
    configure: false,
    settings: false,
    merchants: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Check if a path is active
  const isActivePath = (path) => {
    if (path === '' && location.pathname === '/admin/dashboard') return true;
    return location.pathname.includes(path);
  };

  // Check if a link should be active
  const isLinkActive = (linkPath) => {
    if (linkPath === '' && location.pathname === '/admin/dashboard') return true;
    if (linkPath && location.pathname.includes(linkPath)) return true;
    return false;
  };

  // Auto-expand sections based on current route
  useEffect(() => {
    const path = location.pathname;
    
    // Auto-expand sections based on current route
    const newExpandedState = { ...expandedSections };
    
    if (path.includes('/admin/dashboard/analytics')) {
      newExpandedState.getStarted = true;
    }
    if (path.includes('restaurant-approvals') || path.includes('approvals')) {
      newExpandedState.approvals = true;
    }
    if (path.includes('restaurant-') || path.includes('products')) {
      newExpandedState.restaurants = true;
      newExpandedState.getStarted = true;
    }
    if (path.includes('marketing') || path.includes('promotions') || path.includes('campaigns')) {
      newExpandedState.marketing = true;
    }
    if (path.includes('surge')) {
      newExpandedState.surge = true;
    }
    if (path.includes('admin-') && (path.includes('add') || path.includes('manage'))) {
      newExpandedState.admins = true;
    }
    if (path.includes('user-') || path.includes('customer')) {
      newExpandedState.customers = true;
      newExpandedState.getStarted = true;
    }
    if (path.includes('merchants')) {
      newExpandedState.merchants = true;
      newExpandedState.getStarted = true;
    }
    if (path.includes('configure') || path.includes('settings') || path.includes('commission') || path.includes('taxes') || path.includes('deliveryfee') || path.includes('city') || path.includes('geofence')) {
      newExpandedState.configure = true;
    }
    if (path.includes('order/table')) {
      newExpandedState.getStarted = true;
    }

    setExpandedSections(newExpandedState);
  }, [location.pathname]);

  return (
    <div className="flex flex-col h-full bg-[#FC8019] text-white">
      {/* Logo */}
      <div className="p-5 border-b border-orange-200 flex items-center">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
          <span className="text-[#FC8019] font-bold text-lg">O</span>
        </div>
        <h2 className="text-xl font-bold">ORADO Admin</h2>
      </div>

      {/* Panel Title */}
      <div className="p-3 border-b border-orange-200">
        <div className="bg-orange-500 text-white rounded-lg p-2 text-center text-sm font-medium">
          Admin Panel
        </div>
      </div>

      {/* Single scrollable container for all content */}
      <div className="flex-1 overflow-y-auto">
        <div className="py-4 space-y-1 px-2">
          {/* Get Started Group */}
          <div className="mb-4">
            <div 
              className="flex justify-between items-center px-4 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer bg-orange-600"
              onClick={() => toggleSection('getStarted')}
            >
              <div className="flex items-center">
                <FiHome className="mr-3" />
                <span className="font-semibold">Get Started</span>
              </div>
              {expandedSections.getStarted ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </div>
            {expandedSections.getStarted && (
              <div className="ml-2 mt-2 space-y-1">
                {/* Home (formerly Dashboard) */}
                <Link 
                  to="" 
                  className={`flex items-center px-6 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer ${
                    isLinkActive('') ? 'bg-[#f16a4e] border-l-4 border-white' : ''
                  }`}
                >
                  <FiHome className="mr-3" />
                  <span>Home</span>
                </Link>

                {/* Orders */}
                <Link 
                  to="order/table" 
                  className={`flex items-center px-6 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer ${
                    isLinkActive('order/table') ? 'bg-[#f16a4e] border-l-4 border-white' : ''
                  }`}
                >
                  <CiDeliveryTruck className="mr-3" />
                  <span>Orders</span>
                </Link>

                {/* Merchants */}
                <div className="mb-1">
                  <div 
                    className={`flex justify-between items-center px-6 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer ${
                      isLinkActive('merchants') ? 'bg-[#f16a4e] border-l-4 border-white' : ''
                    }`}
                    onClick={() => toggleSection('merchants')}
                  >
                    <div className="flex items-center">
                      <FiUsers className="mr-3" />
                      <span>Merchants</span>
                    </div>
                    {expandedSections.merchants ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                  </div>
                  {expandedSections.merchants && (
                    <div className="ml-6 bg-white text-gray-800 rounded-lg mt-1 py-2">
                      <Link 
                        to="merchants-permission" 
                        className={`block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded ${
                          isLinkActive('merchants-permission') ? 'text-[#FC8019] bg-orange-50' : ''
                        }`}
                      >
                        Permission
                      </Link>
                    </div>
                  )}
                </div>

                {/* Customers */}
                <div className="mb-1">
                  <div 
                    className={`flex justify-between items-center px-6 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer ${
                      isLinkActive('user-') || isLinkActive('customer') ? 'bg-[#f16a4e] border-l-4 border-white' : ''
                    }`}
                    onClick={() => toggleSection('customers')}
                  >
                    <div className="flex items-center">
                      <GrUser className="mr-3" size={18} />
                      <span>Customers</span>
                    </div>
                    {expandedSections.customers ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                  </div>
                  {expandedSections.customers && (
                    <div className="ml-6 bg-white text-gray-800 rounded-lg mt-1 py-2">
                      <Link 
                        to="user-managemnet" 
                        className={`block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded ${
                          isLinkActive('user-managemnet') ? 'text-[#FC8019] bg-orange-50' : ''
                        }`}
                      >
                        Customer Management
                      </Link>
                      <Link 
                        to="admin-customer-chat" 
                        className={`block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded ${
                          isLinkActive('admin-customer-chat') ? 'text-[#FC8019] bg-orange-50' : ''
                        }`}
                      >
                        Customer Chats
                      </Link>
                    </div>
                  )}
                </div>

                {/* Products */}
                <div className="mb-1">
                  <div 
                    className={`flex justify-between items-center px-6 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer ${
                      isLinkActive('restaurant-') ? 'bg-[#f16a4e] border-l-4 border-white' : ''
                    }`}
                    onClick={() => toggleSection('restaurants')}
                  >
                    <div className="flex items-center">
                      <FiHome className="mr-3" />
                      <span>Products</span>
                    </div>
                    {expandedSections.restaurants ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                  </div>
                  {expandedSections.restaurants && (
                    <div className="ml-6 bg-white text-gray-800 rounded-lg mt-1 py-2">
                      <Link 
                        to="restaurant-add" 
                        className={`block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded ${
                          isLinkActive('restaurant-add') ? 'text-[#FC8019] bg-orange-50' : ''
                        }`}
                      >
                        Add Restaurants
                      </Link>
                      <Link 
                        to="restaurant-table" 
                        className={`block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded ${
                          isLinkActive('restaurant-table') ? 'text-[#FC8019] bg-orange-50' : ''
                        }`}
                      >
                        All Restaurants
                      </Link>
                      <Link 
                        to="restaurant-permission" 
                        className={`block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded ${
                          isLinkActive('restaurant-permission') ? 'text-[#FC8019] bg-orange-50' : ''
                        }`}
                      >
                        Restaurant Permission
                      </Link>
                      <Link 
                        to="restaurant-feedback" 
                        className={`block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded ${
                          isLinkActive('restaurant-feedback') ? 'text-[#FC8019] bg-orange-50' : ''
                        }`}
                      >
                        Restaurant Reviews
                      </Link>
                      <Link 
                        to="restaurant-chats" 
                        className={`block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded ${
                          isLinkActive('restaurant-chats') ? 'text-[#FC8019] bg-orange-50' : ''
                        }`}
                      >
                        Restaurant Chats
                      </Link>
                    </div>
                  )}
                </div>

                {/* Analytics */}
                <Link 
                  to="/admin/dashboard/analytics/order"
                  className={`flex items-center px-6 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer ${
                    isLinkActive('analytics') ? 'bg-[#f16a4e] border-l-4 border-white' : ''
                  }`}
                >
                  <FiPieChart className="mr-3" />
                  <span>Analytics</span>
                </Link>
              </div>
            )}
          </div>

          {/* Approvals */}
          <div className="mb-1">
            <div 
              className={`flex justify-between items-center px-4 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer ${
                isLinkActive('approvals') ? 'bg-[#f16a4e] border-l-4 border-white' : ''
              }`}
              onClick={() => toggleSection('approvals')}
            >
              <div className="flex items-center">
                <FiClipboard className="mr-3" />
                <span>Approvals</span>
              </div>
              {expandedSections.approvals ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </div>
            {expandedSections.approvals && (
              <div className="ml-6 bg-white text-gray-800 rounded-lg mt-1 py-2">
                <Link 
                  to="restaurant-approvals" 
                  className={`block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded ${
                    isLinkActive('restaurant-approvals') ? 'text-[#FC8019] bg-orange-50' : ''
                  }`}
                >
                  Restaurant Approvals
                </Link>
              </div>
            )}
          </div>

          {/* Agent Dashboard Link */}
          <div className="mb-1">
            <a 
              href="/oradoadmin/admin/agent-slider" 
              target="_blank" rel="noopener noreferrer"
              className="flex items-center px-4 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer"
            >
              <FiPieChart className="mr-3" />
              <span>Agent Dashboard</span>
            </a>
          </div>

          {/* Marketing */}
          <div className="mb-1">
            <div 
              className={`flex justify-between items-center px-4 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer ${
                isLinkActive('marketing') || isLinkActive('promotions') || isLinkActive('campaigns') ? 'bg-[#f16a4e] border-l-4 border-white' : ''
              }`}
              onClick={() => toggleSection('marketing')}
            >
              <div className="flex items-center">
                <SquareGanttChart className="mr-3" size={18} />
                <span>Marketing</span>
              </div>
              {expandedSections.marketing ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </div>
            {expandedSections.marketing && (
              <div className="ml-6 bg-white text-gray-800 rounded-lg mt-1 py-2">
                <div className="mb-2">
                  <div 
                    className={`flex justify-between items-center px-4 py-2 hover:text-[#FC8019] hover:bg-orange-50 rounded cursor-pointer ${
                      isLinkActive('promotions') ? 'text-[#FC8019] bg-orange-50' : ''
                    }`}
                    onClick={() => toggleSection('promotions')}
                  >
                    <span>Promotions</span>
                    {expandedSections.promotions ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                  </div>
                  {expandedSections.promotions && (
                    <div className="ml-4 mt-1">
                      <Link 
                        to="admin-promotions-promo" 
                        className={`block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded ${
                          isLinkActive('admin-promotions-promo') ? 'text-[#FC8019] bg-orange-50' : ''
                        }`}
                      >
                        Promo codes
                      </Link>
                      <Link 
                        to="promotions-offer" 
                        className={`block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded ${
                          isLinkActive('promotions-offer') ? 'text-[#FC8019] bg-orange-50' : ''
                        }`}
                      >
                        Offer
                      </Link>
                      <Link 
                        to="promotion-loyalty-points" 
                        className={`block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded ${
                          isLinkActive('promotion-loyalty-points') ? 'text-[#FC8019] bg-orange-50' : ''
                        }`}
                      >
                        Loyalty Points
                      </Link>
                      <Link 
                        to="promotion-referal" 
                        className={`block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded ${
                          isLinkActive('promotion-referal') ? 'text-[#FC8019] bg-orange-50' : ''
                        }`}
                      >
                        Referral
                      </Link>
                    </div>
                  )}
                </div>
                <div className="mb-2">
                  <div 
                    className={`flex justify-between items-center px-4 py-2 hover:text-[#FC8019] hover:bg-orange-50 rounded cursor-pointer ${
                      isLinkActive('campaigns') ? 'text-[#FC8019] bg-orange-50' : ''
                    }`}
                    onClick={() => toggleSection('campaigns')}
                  >
                    <span>Push Campaigns</span>
                    {expandedSections.campaigns ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                  </div>
                  {expandedSections.campaigns && (
                    <div className="ml-4 mt-1">
                      <Link 
                        to="/admin/dashboard/campaigns-pushnotification" 
                        className={`block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded ${
                          isLinkActive('campaigns-pushnotification') ? 'text-[#FC8019] bg-orange-50' : ''
                        }`}
                      >
                        Push notifcation
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Surge */}
          <div className="mb-1">
            <div 
              className={`flex justify-between items-center px-4 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer ${
                isLinkActive('surge') ? 'bg-[#f16a4e] border-l-4 border-white' : ''
              }`}
              onClick={() => toggleSection('surge')}
            >
              <div className="flex items-center">
                <SquareGanttChart className="mr-3" size={18} />
                <span>Surge</span>
              </div>
              {expandedSections.surge ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </div>
            {expandedSections.surge && (
              <div className="ml-6 bg-white text-gray-800 rounded-lg mt-1 py-2">
                <Link 
                  to="admin-surge" 
                  className={`block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded ${
                    isLinkActive('admin-surge') ? 'text-[#FC8019] bg-orange-50' : ''
                  }`}
                > 
                  Surge Selector
                </Link>
                <Link 
                  to="admin-surge-list" 
                  className={`block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded ${
                    isLinkActive('admin-surge-list') ? 'text-[#FC8019] bg-orange-50' : ''
                  }`}
                >
                  List Surge
                </Link>
              </div>
            )}
          </div>

          {/* Admins */}
          <div className="mb-1">
            <div 
              className={`flex justify-between items-center px-4 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer ${
                isLinkActive('admin-') && (isLinkActive('add') || isLinkActive('manage')) ? 'bg-[#f16a4e] border-l-4 border-white' : ''
              }`}
              onClick={() => toggleSection('admins')}
            >
              <div className="flex items-center">
                <GrUserAdmin className="mr-3" size={18} />
                <span>Admins</span>
              </div>
              {expandedSections.admins ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </div>
            {expandedSections.admins && (
              <div className="ml-6 bg-white text-gray-800 rounded-lg mt-1 py-2">
                <Link 
                  to="admin-add" 
                  className={`block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded ${
                    isLinkActive('admin-add') ? 'text-[#FC8019] bg-orange-50' : ''
                  }`}
                >
                  Add Admins
                </Link>
                <Link 
                  to="admin-manage" 
                  className={`block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded ${
                    isLinkActive('admin-manage') ? 'text-[#FC8019] bg-orange-50' : ''
                  }`}
                >
                  Manage Admins
                </Link>
              </div>
            )}
          </div>

          {/* Ticket */}
          <div className="mb-1">
            <Link 
              to="admin-ticket" 
              className={`flex items-center px-4 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer ${
                isLinkActive('admin-ticket') ? 'bg-[#f16a4e] border-l-4 border-white' : ''
              }`}
            >
              <TicketCheck className="mr-3" size={18} />
              <span>Ticket</span>
            </Link>
          </div>

          {/* Configure */}
          <div className="mb-1">
            <div 
              className={`flex justify-between items-center px-4 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer ${
                isLinkActive('configure') || isLinkActive('settings') || isLinkActive('commission') || isLinkActive('taxes') || isLinkActive('deliveryfee') || isLinkActive('city') || isLinkActive('geofence') ? 'bg-[#f16a4e] border-l-4 border-white' : ''
              }`}
              onClick={() => toggleSection('configure')}
            >
              <div className="flex items-center">
                <FiSettings className="mr-3" />
                <span>Configure</span>
              </div>
              {expandedSections.configure ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </div>
            {expandedSections.configure && (
              <div className="ml-6 bg-white text-gray-800 rounded-lg mt-1 py-2">
                {/* Order Settings */}
                <div className="mb-2">
                  <div 
                    className={`flex justify-between items-center px-4 py-2 hover:text-[#FC8019] hover:bg-orange-50 rounded cursor-pointer ${
                      isLinkActive('commission') || isLinkActive('deliveryfee') || isLinkActive('taxes') ? 'text-[#FC8019] bg-orange-50' : ''
                    }`}
                    onClick={() => toggleSection('orderSettings')}
                  >
                    <span>Order Settings</span>
                    {expandedSections.orderSettings ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                  </div>
                  {expandedSections.orderSettings && (
                    <div className="ml-4 mt-1">
                      <Link 
                        to="/admin/dashboard/commission/setup" 
                        className={`block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded ${
                          isLinkActive('commission') ? 'text-[#FC8019] bg-orange-50' : ''
                        }`}
                      >
                        Commission
                      </Link>
                      <Link 
                        to="admin-deliveryfee-management" 
                        className={`block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded ${
                          isLinkActive('deliveryfee') ? 'text-[#FC8019] bg-orange-50' : ''
                        }`}
                      >
                        Delivery Fee Settings
                      </Link>
                      <Link 
                        to="/admin/dashboard/taxes-charges" 
                        className={`block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded ${
                          isLinkActive('taxes') ? 'text-[#FC8019] bg-orange-50' : ''
                        }`}
                      >
                        Tax,Fee, & Charges
                      </Link>
                    </div>  
                  )}
                </div>

                {/* General Settings */}
                <div className="mb-2">
                  <div 
                    className={`flex justify-between items-center px-4 py-2 hover:text-[#FC8019] hover:bg-orange-50 rounded cursor-pointer ${
                      isLinkActive('general') ? 'text-[#FC8019] bg-orange-50' : ''
                    }`}
                    onClick={() => toggleSection('generalSettings')}
                  >
                    <span>General Settings</span>
                    {expandedSections.generalSettings ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                  </div>
                  {expandedSections.generalSettings && (
                    <div className="ml-4 mt-1">
                      <Link 
                        to="/admin/dashboard/general/preference" 
                        className={`block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded ${
                          isLinkActive('preference') ? 'text-[#FC8019] bg-orange-50' : ''
                        }`}
                      >
                        Preference
                      </Link>
                      <Link 
                        to="/admin/dashboard/general/terminology" 
                        className={`block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded ${
                          isLinkActive('terminology') ? 'text-[#FC8019] bg-orange-50' : ''
                        }`}
                      >
                        Terminology
                      </Link>
                    </div>
                  )}
                </div>

                {/* City Configuration */}
                <div className="mb-2">
                  <div 
                    className={`flex justify-between items-center px-4 py-2 hover:text-[#FC8019] hover:bg-orange-50 rounded cursor-pointer ${
                      isLinkActive('city') || isLinkActive('geofence') ? 'text-[#FC8019] bg-orange-50' : ''
                    }`}
                    onClick={() => toggleSection('cityConfig')}
                  >
                    <span>City Configuration</span>
                    {expandedSections.cityConfig ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                  </div>
                  {expandedSections.cityConfig && (
                    <div className="ml-4 mt-1">
                      <Link 
                        to="/admin/dashboard/city/list" 
                        className={`block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded ${
                          isLinkActive('city') ? 'text-[#FC8019] bg-orange-50' : ''
                        }`}
                      >
                        City Management
                      </Link>
                      <Link 
                        to="/admin/dashboard/geofence" 
                        className={`block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded ${
                          isLinkActive('geofence') ? 'text-[#FC8019] bg-orange-50' : ''
                        }`}
                      >
                        Geofence Management
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="mb-1">
            <div 
              className={`flex justify-between items-center px-4 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer ${
                isLinkActive('access-logs') ? 'bg-[#f16a4e] border-l-4 border-white' : ''
              }`}
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
                  to="#" 
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                >
                  Edit Profile
                </Link>
                <Link 
                  to="#" 
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                >
                  Change Password
                </Link>
                <Link 
                  to="access-logs" 
                  className={`block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded ${
                    isLinkActive('access-logs') ? 'text-[#FC8019] bg-orange-50' : ''
                  }`}
                >
                  Access Logs
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Logout */}
        <div className="border-t border-orange-200 p-4">
          <div className="flex items-center justify-between text-white hover:bg-orange-500 transition-all duration-200 cursor-pointer rounded-lg p-3">
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

export default Sidebar;