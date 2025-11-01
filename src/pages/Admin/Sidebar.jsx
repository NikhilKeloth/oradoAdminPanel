
import React, { useState } from 'react';
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
import { Link } from 'react-router-dom';
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [expandedSections, setExpandedSections] = useState({
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
    settings: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
          {/* Dashboard */}
          <div className="mb-1">
            <Link 
              to="" 
              className="flex items-center px-4 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer"
            >
              <FiPieChart className="mr-3" />
              <span>Dashboard</span>
            </Link>
          </div>



          <div className="mb-1">
            <a 
              href="/admin/agent-slider" 
              target="_blank" rel="noopener noreferrer"
              className="flex items-center px-4 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer"
            >
              <FiPieChart className="mr-3" />
              <span>Agent Dashboard</span>
            </a>
          </div>

          {/* Approvals */}
          <div className="mb-1">
            <div 
              className="flex justify-between items-center px-4 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer"
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
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                >
                  Restaurant Approvals
                </Link>
                {/* <Link 
                  to="#" 
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                >
                  Agent Approvals
                </Link> */}
              </div>
            )}
          </div>

          {/* Restaurants */}
          <div className="mb-1">
            <div 
              className="flex justify-between items-center px-4 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer"
              onClick={() => toggleSection('restaurants')}
            >
              <div className="flex items-center">
                <FiHome className="mr-3" />
                <span>Restaurants</span>
              </div>
              {expandedSections.restaurants ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </div>
            {expandedSections.restaurants && (
              <div className="ml-6 bg-white text-gray-800 rounded-lg mt-1 py-2">
                <Link 
                  to="restaurant-add" 
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                >
                  Add Restaurants
                </Link>
                <Link 
                  to="restaurant-table" 
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                >
                  All Restaurants
                </Link>
                {/* <Link 
                  to="restaurant-createmenu" 
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                >
                  Create Menu
                </Link> */}
                <Link 
                  to="restaurant-permission" 
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                >
                  Restaurant Permission
                </Link>
                {/* <Link 
                  to="restaurant-commission" 
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                >
                  Restaurant Commission
                </Link>
                <Link 
                  to="restaurant-earnings" 
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                >
                  Restaurant Earnings
                </Link> */}
                <Link 
                  to="restaurant-feedback" 
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                >
                  Restaurant Reviews
                </Link>
                <Link 
                  to="restaurant-chats" 
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                >
                  Restaurant Chats
                </Link>
              </div>
            )}
          </div>

          {/* Offers */}
          {/* <div className="mb-1">
            <div 
              className="flex justify-between items-center px-4 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer"
              onClick={() => toggleSection('offers')}
            >
              <div className="flex items-center">
                <MdOutlineLocalOffer className="mr-3" />
                <span>Offers</span>
              </div>
              {expandedSections.offers ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </div>
            {expandedSections.offers && (
              <div className="ml-6 bg-white text-gray-800 rounded-lg mt-1 py-2">
                <Link 
                  to="create-offer" 
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                >
                  Create Offers
                </Link>
                <Link 
                  to="assign-offer" 
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                >
                  Assign Offer
                </Link>
                <Link 
                  to="manage-offer" 
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                >
                  Offer Management
                </Link>
              </div>
            )}
          </div> */}

          {/* Orders */}
          <div className="mb-1">
            <Link 
              to="order/table" 
              className="flex items-center px-4 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer"
            >
              <CiDeliveryTruck className="mr-3" />
              <span>Orders</span>
            </Link>
          </div>



          {/* Analytics */}
<Link 
  to="/admin/dashboard/analytics/order"
  className="flex items-center px-4 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer"
>
  <FiPieChart className="mr-3" />
  <span>Analytics</span>
</Link>


          {/* Marketing */}
          <div className="mb-1">
            <div 
              className="flex justify-between items-center px-4 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer"
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
                    className="flex justify-between items-center px-4 py-2 hover:text-[#FC8019] hover:bg-orange-50 rounded cursor-pointer"
                    onClick={() => toggleSection('promotions')}
                  >
                    <span>Promotions</span>
                    {expandedSections.promotions ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                  </div>
                  {expandedSections.promotions && (
                    <div className="ml-4 mt-1">
                      <Link 
                        to="admin-promotions-promo" 
                        className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                      >
                        Promo codes
                      </Link>


  <Link 
                        to="promotions-offer" 
                        className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                      >
                     Offer
                      </Link>








                       
                      <Link 
                        to="promotion-loyalty-points" 
                        className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                      >
                        Loyalty Points
                      </Link>
                      <Link 
                        to="promotion-referal" 
                        className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                      >
                        Referral
                      </Link>
                    </div>
                  )}
                </div>
                <div className="mb-2">
                  <div 
                    className="flex justify-between items-center px-4 py-2 hover:text-[#FC8019] hover:bg-orange-50 rounded cursor-pointer"
                    onClick={() => toggleSection('campaigns')}
                  >
                    <span>Push Campaigns</span>
                    {expandedSections.campaigns ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                  </div>
                  {expandedSections.campaigns && (



                    <div className="ml-4 mt-1">
                      <Link 
                        to="/admin/dashboard/campaigns-pushnotification" 
                        className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
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
              className="flex justify-between items-center px-4 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer"
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
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                > 
                  Surge Selector
                </Link>
                <Link 
                  to="admin-surge-list" 
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                >
                  List Surge
                </Link>
              </div>
            )}
          </div>

          {/* Agents */}
          {/* <div className="mb-1">
            <div 
              className="flex justify-between items-center px-4 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer"
              onClick={() => toggleSection('agents')}
            >
              <div className="flex items-center">
                <MdDeliveryDining className="mr-3" size={18} />
                <span>Agents</span>
              </div>
              {expandedSections.agents ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </div>
            {expandedSections.agents && (
              <div className="ml-6 bg-white text-gray-800 rounded-lg mt-1 py-2">
                <Link 
                  to="/admin/agent-dashboard" 
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                >
                  View Agents
                </Link>
                <Link 
                  to="#" 
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                >
                  Assign Projects
                </Link>
              </div>
            )}
          </div> */}

          {/* Admins */}
          <div className="mb-1">
            <div 
              className="flex justify-between items-center px-4 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer"
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
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                >
                  Add Admins
                </Link>
                <Link 
                  to="admin-manage" 
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                >
                  Manage Admins
                </Link>
              </div>
            )}
          </div>

          {/* Customers */}
          <div className="mb-1">
            <div 
              className="flex justify-between items-center px-4 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer"
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
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                >
                  Customer Management
                </Link>
                <Link 
                  to="admin-customer-chat" 
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                >
                  Customer Chats
                </Link>
              </div>
            )}
          </div>

          {/* Ticket */}
          <div className="mb-1">
            <Link 
              to="admin-ticket" 
              className="flex items-center px-4 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer"
            >
              <TicketCheck className="mr-3" size={18} />
              <span>Ticket</span>
            </Link>
          </div>

          {/* Transactions */}
          {/* <div className="mb-1">
            <Link 
              to="refund/transactions" 
              className="flex items-center px-4 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer"
            >
              <Receipt className="mr-3" size={18} />
              <span>Transactions</span>
            </Link>
          </div> */}

          {/* Tax & Delivery Fee Settings */}
          {/* <div className="mb-1">
            <div 
              className="flex justify-between items-center px-4 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer"
              onClick={() => toggleSection('taxDelivery')}
            >
              <div className="flex items-center">
                <FiSettings className="mr-3" />
                <span>Tax & Delivery Fee</span>
              </div>
              {expandedSections.taxDelivery ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </div>
            {expandedSections.taxDelivery && (
              <div className="ml-6 bg-white text-gray-800 rounded-lg mt-1 py-2">
                <Link 
                  to="admin-tax-management" 
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                >
                  Tax Settings
                </Link>
                <Link 
                  to="admin-deliveryfee-management" 
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                >
                  Delivery Fee Settings
                </Link>
              </div>
            )}
          </div> */}

          {/* Configure */}
          <div className="mb-1">
            <div 
              className="flex justify-between items-center px-4 py-3 hover:bg-[#f16a4e] text-white rounded-lg mx-2 cursor-pointer"
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
                {/* User Settings */}
                {/* <div className="mb-2">
                  <div 
                    className="flex justify-between items-center px-4 py-2 hover:text-[#FC8019] hover:bg-orange-50 rounded cursor-pointer"
                    onClick={() => toggleSection('userSettings')}
                  >
                    <span>User Settings</span>
                    {expandedSections.userSettings ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                  </div>
                  {expandedSections.userSettings && (
                    <div className="ml-4 mt-1">
                      <Link 
                        to="#" 
                        className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                      >
                        Customer
                      </Link>
                      <Link 
                        to="#" 
                        className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                      >
                        Restaurants
                      </Link>
                      <Link 
                        to="/admin/dashboard/manger-managment" 
                        className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                      >
                        Managers
                      </Link>
                      <Link 
                        to="/admin/dashboard/role-management" 
                        className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                      >
                        Roles
                      </Link>
                    </div>
                  )}
                </div> */}

                {/* Order Settings */}
                <div className="mb-2">
                  <div 
                    className="flex justify-between items-center px-4 py-2 hover:text-[#FC8019] hover:bg-orange-50 rounded cursor-pointer"
                    onClick={() => toggleSection('orderSettings')}
                  >
                    <span>Order Settings</span>
                    {expandedSections.orderSettings ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                  </div>
                  {expandedSections.orderSettings && (
                    <div className="ml-4 mt-1">
                      {/* <Link 
                        to="/admin/dashboard/order/settings" 
                        className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                      >
                        Order
                      </Link> */}
                      {/* <Link 
                        to="/admin/dashboard/order/cancel-settings" 
                        className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                      >
                        Cancellation
                      </Link> */}
                      {/* <Link 
                        to="/admin/dashboard/delivery-settings" 
                        className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                      >
                        Delivery
                      </Link> */}
                      <Link 
                        to="/admin/dashboard/commission/setup" 
                        className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                      >
                        Commission
                      </Link>

                        <Link 
                  to="admin-deliveryfee-management" 
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                >
                  Delivery Fee Settings
                </Link>


    <Link 
                        to="/admin/dashboard/taxes-charges" 
                        className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                      >
                       Tax,Fee, & Charges
                      </Link>


                    </div>  
                  )}
                </div>

                {/* General Settings */}
                <div className="mb-2">
                  <div 
                    className="flex justify-between items-center px-4 py-2 hover:text-[#FC8019] hover:bg-orange-50 rounded cursor-pointer"
                    onClick={() => toggleSection('generalSettings')}
                  >
                    <span>General Settings</span>
                    {expandedSections.generalSettings ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                  </div>
                  {expandedSections.generalSettings && (
                    <div className="ml-4 mt-1">
                      <Link 
                        to="/admin/dashboard/general/preference" 
                        className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                      >
                        Preference
                      </Link>
                      <Link 
                        to="/admin/dashboard/general/terminology" 
                        className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
                      >
                        Terminology
                      </Link>
                    </div>
                  )}
                </div>










                {/* Inside the Configure section, after General Settings */}
<div className="mb-2">
  <div 
    className="flex justify-between items-center px-4 py-2 hover:text-[#FC8019] hover:bg-orange-50 rounded cursor-pointer"
    onClick={() => toggleSection('cityConfig')}
  >
    <span>City Configuration</span>
    {expandedSections.cityConfig ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
  </div>
  {expandedSections.cityConfig && (
    <div className="ml-4 mt-1">
      <Link 
        to="/admin/dashboard/city/list" 
        className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
      >
        City Management
      </Link>
      <Link 
        to="/admin/dashboard/geofence" 
        className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
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
                  className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
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