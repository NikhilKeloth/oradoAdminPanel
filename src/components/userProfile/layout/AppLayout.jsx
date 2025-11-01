import React from 'react';
import UserProfileHeader from './UserProfileHeader';

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-orange-600 mt-15">
      {/* Teal header section */}
      <UserProfileHeader />
      
      {/* White content area with rounded top corners */}
      <div className="bg-white mx-16 shadow-lg min-h-[calc(100vh-8rem)] my-2">
        {children}
      </div>
    </div>
  );
};

export default AppLayout;