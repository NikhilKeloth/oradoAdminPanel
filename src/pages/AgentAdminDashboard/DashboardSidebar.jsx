import { Settings, User, Layout, LogOut, Map } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const DashboardSidebar = () => {
  const location = useLocation();
  // Extract the active tab from the URL path
  const activeTab = location.pathname.split('/').pop() || 'preferences';

  const menuItems = [
    { id: 'preferences', label: "Preferences", icon: <Settings size={18} /> },
    { id: 'theme', label: "Theme Settings", icon: <Layout size={18} /> },
    { id: 'profile', label: "Profile", icon: <User size={18} /> },
    { id: 'geo-fence', label: "Geo Fence", icon: <Map size={18} /> },
    { id: 'auto-allocation', label: "Auto Allocation", icon: <Settings size={18} /> },
    { id: 'logout', label: "Logout", icon: <LogOut size={18} /> },
  ];

  return (
    <aside className="w-64 bg-white shadow-md overflow-y-auto">
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
                to={`/dashboard/${item.id}`} // Adjust the path as needed
                className={`w-full flex items-center p-3 rounded-lg text-left ${
                  activeTab === item.id
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                aria-current={activeTab === item.id ? "page" : undefined}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default DashboardSidebar;