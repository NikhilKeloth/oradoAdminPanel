import React, { useState } from 'react';
import AppLayout from '../../components/userProfile/layout/AppLayout';
import Sidebar from '../../components/userProfile/navigation/Sidebar';
import Navbar from '../../components/layout/Navbar';
import Setting from '../../components/userProfile/settings/Setting';
import { Menu } from 'lucide-react'; // Icon for sidebar toggle on mobile

const SettingsPage = () => {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <>
      <Navbar />
      <AppLayout>
        <div className="flex flex-col md:flex-row">
          {/* Mobile header with toggle */}
          <div className="md:hidden flex justify-between items-center p-4 bg-white border-b">
            <h2 className="text-xl font-semibold">Settings</h2>
            <button onClick={() => setShowSidebar(!showSidebar)}>
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Sidebar - toggle visible on small screens */}
          <div
            className={`${
              showSidebar ? 'block' : 'hidden'
            } md:block w-full md:w-64 border-r bg-white`}
          >
            <Sidebar />
          </div>

          {/* Main content */}
          <div className="flex-1 p-4 md:p-6">
            <Setting />
          </div>
        </div>
      </AppLayout>
    </>
  );
};

export default SettingsPage;
