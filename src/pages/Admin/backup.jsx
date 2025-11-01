import { TicketCheck, Receipt, SquareGanttChart } from "lucide-react";
import React, { useState } from "react";
import { FaUserSecret } from "react-icons/fa";
import {
  FiMenu,
  FiLogOut,
  FiChevronDown,
  FiChevronUp,
  FiPieChart,
  FiClipboard,
  FiHome,
  FiSettings,
} from "react-icons/fi";
import { CiDeliveryTruck } from "react-icons/ci";
import { MdDeliveryDining, MdOutlineLocalOffer } from "react-icons/md";

import { GrUserAdmin, GrUser } from "react-icons/gr";
import { Link, Outlet } from "react-router-dom";

const SidebarItem = ({
  title,
  icon,
  children,
  hasPermission,
  closeSidebar,
}) => {
  const [open, setOpen] = useState(false);

  if (!hasPermission) return null;

  // Function to handle link clicks
  const handleLinkClick = () => {
    if (closeSidebar) {
      closeSidebar();
    }
  };

  return (
    <div className="text-sm w-full">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between w-full px-4 py-3 hover:bg-[#f16a4e] transition-all duration-200 text-white font-medium rounded-lg mx-2 ${
          open ? "bg-[#f16a4e]" : ""
        }`}
      >
        <span className="flex items-center gap-3">
          {icon}
          {title}
        </span>
        {children &&
          (open ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />)}
      </button>
      <div
        className={`ml-6 bg-white text-gray-800 overflow-hidden transition-all duration-300 rounded-lg mt-1 ${
          open ? "max-h-120 py-2" : "max-h-0"
        }`}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              onClick: handleLinkClick,
            });
          }
          return child;
        })}
      </div>
    </div>
  );
};

function AdminDashboard() {
  const [showSidebar, setShowSidebar] = useState(false);
  const permissions = JSON.parse(localStorage.getItem("permissions")) || [];

  // Check if user has specific permission
  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  const closeSidebar = () => {
    setShowSidebar(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Mobile Header */}
      <div className="lg:hidden p-4 bg-[#FC8019] text-white flex justify-between items-center w-full fixed top-0 left-0 z-50">
        <h2 className="text-xl font-bold">ORADO Admin</h2>
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

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto space-y-1 py-4 px-2 z-200">
          <SidebarItem
            title="Dashboard"
            icon={<FiPieChart size={18} />}
            hasPermission={true} // Always show dashboard
            closeSidebar={closeSidebar}
          >
            <Link
              to=""
              className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
            >
              Overview
            </Link>
          </SidebarItem>

          <SidebarItem
            title="Approvals"
            icon={<FiClipboard size={18} />}
            hasPermission={
              hasPermission("merchants.manage") ||
              hasPermission("agents.manage")
            }
            closeSidebar={closeSidebar}
          >
            {hasPermission("merchants.manage") && (
              <Link
                to="restaurant-approvals"
                className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
              >
                Restaurant Approvals
              </Link>
            )}
            {hasPermission("agents.manage") && (
              <Link
                to="#"
                className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
              >
                Agent Approvals
              </Link>
            )}
          </SidebarItem>

          <SidebarItem
            title="Restaurants"
            icon={<FiHome size={18} />}
            hasPermission={hasPermission("merchants.manage")}
            closeSidebar={closeSidebar}
          >
            <Link
              to="restaurant-add"
              className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
            >
              Add Restaurants
            </Link>
            <Link
              to="restaurant-edit"
              className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
            >
              All Restaurants
            </Link>
            <Link
              to="restaurant-createmenu"
              className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
            >
              Create Menu
            </Link>
            <Link
              to="restaurant-permission"
              className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
            >
              Restaurant Permission
            </Link>
            <Link
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
            </Link>
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
          </SidebarItem>

          <SidebarItem
            title="Offers"
            icon={<MdOutlineLocalOffer size={18} />}
            hasPermission={hasPermission("agents.manage")}
            closeSidebar={closeSidebar}
          >
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
          </SidebarItem>
          <SidebarItem
            title="Orders"
            icon={<CiDeliveryTruck size={18} />}
            hasPermission={hasPermission("agents.manage")}
          >
            <Link
              to="restaurant-order"
              className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
            >
              Orders
            </Link>
          </SidebarItem>

          <SidebarItem
            title="Marketing"
            icon={<SquareGanttChart size={18} />}
            hasPermission={hasPermission("agents.manage")}
          >
            <SidebarItem
              title="Promotions"
              icon={<SquareGanttChart size={18} />}
              hasPermission={hasPermission("agents.manage")}
            >
              <Link
                to="admin-promotions-promo"
                className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
              >
                Promo codes
              </Link>

              <Link
                to="promotion-loyalty-points"
                className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
              >
                loyalty-points
              </Link>


                   <Link
                to="promotion-referal"
                className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
              >
                Referal
              </Link>
            </SidebarItem>

            <SidebarItem
              title="Push Campaings"
              icon={<SquareGanttChart size={18} />}
              hasPermission={hasPermission("agents.manage")}
            >
              <Link
                to="campaigns-customer"
                className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
              >
                Customer
              </Link>

              <Link
                to="campaigns-restaurant"
                className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
              >
                Restaurant
              </Link>
            </SidebarItem>

            <SidebarItem></SidebarItem>
          </SidebarItem>

          <SidebarItem
            title="surge"
            icon={<SquareGanttChart size={18} />}
            hasPermission={hasPermission("agents.manage")}
          >
            <Link
              to="admin-surge"
              className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
            >
              Surge Selecter
            </Link>
            <Link
              to="admin-surge-list"
              className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
            >
              List Surge
            </Link>
          </SidebarItem>
          <SidebarItem
            title="Agents"
            icon={<MdDeliveryDining size={18} />}
            hasPermission={hasPermission("agents.manage")}
            closeSidebar={closeSidebar}
          >
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
          </SidebarItem>

          <SidebarItem
            title="Admins"
            icon={<GrUserAdmin size={18} />}
            hasPermission={hasPermission("users.manage")}
            closeSidebar={closeSidebar}
          >
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
          </SidebarItem>

          <SidebarItem
            title="Customers"
            icon={<GrUser size={18} />}
            hasPermission={hasPermission("users.manage")}
            closeSidebar={closeSidebar}
          >
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
          </SidebarItem>

          <SidebarItem
            title="Ticket"
            icon={<TicketCheck size={18} />}
            hasPermission={hasPermission("support.manage")}
            closeSidebar={closeSidebar}
          >
            <Link
              to="admin-ticket"
              className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
            >
              Ticket Manager
            </Link>
          </SidebarItem>
          <SidebarItem
            title="Transactions"
            icon={<Receipt size={18} />}
            hasPermission={hasPermission("support.manage")}
            closeSidebar={closeSidebar}
          >
            <Link
              to="refund/transactions"
              className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
            >
              Refunds
            </Link>
          </SidebarItem>

          <SidebarItem
            title="Tax & Delivery Fee Settings"
            icon={<FiSettings size={18} />}
            hasPermission={true} // Always show settings
            closeSidebar={closeSidebar}
          >
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
          </SidebarItem>

          <SidebarItem
            title="Configure"
            icon={<FiSettings size={18} />}
            hasPermission={true} // Always show settings
            closeSidebar={closeSidebar}
          >
            <SidebarItem
              title="User settings"
              icon={<FiSettings size={18} />}
              hasPermission={true} // Always show settings
              closeSidebar={closeSidebar}
            >
              <Link
                to="admin-deliveryfee-management"
                className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
              >
                Customer
              </Link>
              <Link
                to="admin-deliveryfee-management"
                className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
              >
                Restaurants
              </Link>

              <Link
                to="/admin/dashboard/manger-managment"
                className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
              >
                Mangers
              </Link>

              <Link
                to="/admin/dashboard/role-management"
                className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
              >
                Roles
              </Link>
            </SidebarItem>

            <SidebarItem
              title="Order settings"
              icon={<FiSettings size={18} />}
              hasPermission={true} // Always show settings
              closeSidebar={closeSidebar}
            >


               <Link
                to="/admin/dashboard/order/settings"
                className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
              >
             Order
              </Link>



   <Link
                to="/admin/dashboard/order/cancel-settings"
                className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
              >
            Cancellation
              </Link>


              <Link
                to="/admin/dashboard/delivery-settings"
                className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
              >
               Delivery
              </Link>

               <Link
                to="/admin/dashboard/commission/setup"
                className="block py-2 px-4 hover:text-[#FC8019] hover:bg-orange-50 rounded"
              >
              Commission
              </Link>
            </SidebarItem>




              <SidebarItem
              title=" genter settings"
              icon={<FiSettings size={18} />}
              hasPermission={true} // Always show settings
              closeSidebar={closeSidebar}
            >
           


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
            </SidebarItem>
          </SidebarItem>

          <SidebarItem
            title="Settings"
            icon={<FiSettings size={18} />}
            hasPermission={true} // Always show settings
            closeSidebar={closeSidebar}
          >
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
          </SidebarItem>
        </nav>

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

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 pt-16 lg:pt-0">
        <div className="p-5">
          <div className="bg-white rounded-xl shadow-sm ">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;