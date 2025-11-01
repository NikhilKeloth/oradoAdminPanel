import React, { useState } from 'react';

export default function MenuNavigation() {
  const [activeItem, setActiveItem] = useState('Pizzas');

  const menuItems = [
    'Pizzas',
    'Garlic Bread',
    'Calzone',
    'Kebabas',
    'Salads',
    'Cold drinks',
    'Happy Meal®',
    'Desserts',
    'Hot drinks',
    'Sauces',
    'Orbit®'
  ];

  return (
    <div className="w-full max-w-xs bg-white border-r border-gray-200 h-screen overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 flex flex-col justify-center gap-1">
            <div className="w-full h-0.5 bg-gray-800"></div>
            <div className="w-full h-0.5 bg-gray-800"></div>
            <div className="w-full h-0.5 bg-gray-800"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Menu</h2>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => setActiveItem(item)}
            className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-50 ${
              activeItem === item 
                ? 'bg-gray-900 text-white' 
                : 'text-gray-800'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}