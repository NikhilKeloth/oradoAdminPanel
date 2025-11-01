import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const TopNavbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

const menuItems = [
  { name: "Dashboard", path: "/admin/agent-dashboard" },
  { name: "Agent Aprrovals", path: "/admin/agent-dashboard/agent/approval" },
  { name: "Agent List", path: "/admin/agent-dashboard/agent/list" },
  { name: "Agent Selfie logs", path: "/admin/agent-dashboard/agent-selfie" },
  { name: "Agent allocation methods", path: "/admin/agent-dashboard/settings/allocation-method" },


  { name: "Agent leave approvals", path: "/admin/agent-dashboard/agent-leave" },
  { name: "Agent Earingis settings", path: "/admni/agent-dahsboard/agent-earnigs-settings" },

  { name: "Agent warngis and termination", path: "/admin/agent-dashboard/warings-termination" },




  { name: "Settings", path: "/admin/agent-dashboard/settings" },


];
  return (
    <>
      <div className="h-14 bg-white flex items-center justify-between px-4 shadow border-b fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={toggleSidebar}>
            {isSidebarOpen ? (
              <X className="text-gray-600" />
            ) : (
              <Menu className="text-gray-600" />
            )}
          </button>
          <h2 className="text-xl font-bold text-gray-800">Agent Admin Dashboard</h2>
        </div>
        <div>
          <span className="text-sm text-gray-600">Welcome, Admin</span>
        </div>
      </div>

      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="fixed top-14 left-0 h-[calc(100vh-3.5rem)] w-64 bg-white shadow-lg z-40 overflow-y-auto">
          <div className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item, index) => (
                <li key={index}>
                <Link
  to={item.path}
  onClick={toggleSidebar}
  className="flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
>
  <span>{item.name}</span>
</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Overlay with blur effect */}
      {isSidebarOpen && (
        <div
  onClick={toggleSidebar}
  style={{
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",  // for Safari support
    zIndex: 30
  }}
/>
      )}
    </>
  );
};

export default TopNavbar;