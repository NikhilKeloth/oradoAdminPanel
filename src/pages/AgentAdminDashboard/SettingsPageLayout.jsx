// src/layouts/SettingsPageLayout.jsx
import { Settings, User, Layout, LogOut, Map } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";

const SettingsPageLayout = () => {
  const location = useLocation();
  const activeTab = location.pathname.split('/').pop() || 'preferences';

  const menuItems = [
    { id: 'preferences', label: "Preferences", icon: <Settings size={18} /> },
    { id: 'theme-settings', label: "Theme Settings", icon: <Layout size={18} /> },

      { id: 'template', label: "Templates", icon: <User size={18} /> },
    { id: 'geo-fence', label: "Geo Fence", icon: <Map size={18} /> },
    { id: 'allocation-method', label: "Auto Allocation", icon: <Settings size={18} /> },
    { id: 'logout', label: "Logout", icon: <LogOut size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold flex items-center">
            <Settings className="mr-2" />
            Settings
          </h2>
        </div>
        <nav className="p-2">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={`/admin/agent-dashboard/settings/${item.id}`}

                  className={`w-full flex items-center p-3 rounded-lg text-left ${
                    activeTab === item.id
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <Outlet /> {/* This will render the child routes */}
      </div>
    </div>
  );
};

export default SettingsPageLayout;