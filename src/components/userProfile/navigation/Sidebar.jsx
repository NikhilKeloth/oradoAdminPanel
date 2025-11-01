import React from 'react';
import SidebarItem from './SidebarItem';

const sidebarItems = [
  { name: 'Orders', path: '/my-account/orders' },
  { name: 'Orado One', path: '/swiggy-one' },
  { name: 'Favourites', path: '/favourites' },
  { name: 'Payments', path: '/payments' },
  { name: 'Addresses', path: '/addresses' },
  { name: 'Settings', path: '/my-account/settings' }
];

const Sidebar = () => {
  return (
    <div className="w-64 p-4">
      <nav>
        <ul className="space-y-1">
          {sidebarItems.map((item) => (
            <SidebarItem 
              key={item.name}
              name={item.name}
              path={item.path}
            />
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;