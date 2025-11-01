import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function PizzasListing() {
  const [selectedSizes, setSelectedSizes] = useState({
    farmhouse: 'Small',
    deluxe: 'Small', 
    tandoori: 'Small'
  });

  const [sortBy, setSortBy] = useState('default');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const pizzas = [
    {
      id: 'farmhouse',
      name: 'Farm House Xtreme Pizza',
      spiceLevel: 2,
      description: '1 McChicken™, 1 Big Mac™, 1 Royal Cheeseburger, 3 medium sized French Fries , 3 cold drinks',
      image: 'https://img.freepik.com/free-psd/delicious-veggie-pizza-freshly-baked-toppings-cheese-mushrooms-peppers-olives_84443-37364.jpg?semt=ais_hybrid&w=740',
      basePrice: 21.90
    },
    {
      id: 'deluxe',
      name: 'Deluxe Pizza',
      spiceLevel: 2,
      description: '1 McChicken™, 1 Big Mac™, 1 Royal Cheeseburger, 3 medium sized French Fries , 3 cold drinks',
      image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/11/8d/c5/a9/vegetarian-pizza.jpg?w=600&h=400&s=1',
      basePrice: 25.90
    },
    {
      id: 'tandoori',
      name: 'Tandoori Pizza',
      spiceLevel: 2,
      description: '1 McChicken™, 1 Big Mac™, 1 Royal Cheeseburger, 3 medium sized French Fries , 3 cold drinks',
      image: 'https://www.southernliving.com/thmb/neXdkcBhnuLrIuF30-ZJ8GYVr-E=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Supreme_Pizza_006-3b04db62117d404e9c37b126d7a7f0a2.jpg',
      basePrice: 19.90
    }
  ];

  const sizeOptions = [
    { size: 'Small', price: '£21.90' },
    { size: 'Medium', price: '£25.80' },
    { size: 'Large', price: '£27.90' }
  ];

  const handleSizeSelect = (pizzaId, size) => {
    setSelectedSizes(prev => ({
      ...prev,
      [pizzaId]: size
    }));
  };

  const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name', label: 'Name A-Z' }
  ];

  const getSortedPizzas = () => {
    const pizzasCopy = [...pizzas];
    
    switch (sortBy) {
      case 'price-low':
        return pizzasCopy.sort((a, b) => a.basePrice - b.basePrice);
      case 'price-high':
        return pizzasCopy.sort((a, b) => b.basePrice - a.basePrice);
      case 'name':
        return pizzasCopy.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return pizzasCopy;
    }
  };

  const getCurrentSortLabel = () => {
    return sortOptions.find(option => option.value === sortBy)?.label || 'Sort by Pricing';
  };

  const renderSpiceLevel = (level) => {
    return (
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <span 
            key={i} 
            className={`text-sm ${i <= level ? 'text-red-500' : 'text-gray-300'}`}
          >
            🌶
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pizzas</h1>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 bg-white border border-gray-300 rounded-full px-4 py-2 hover:bg-gray-50"
          >
            <span className="text-sm text-gray-600">{getCurrentSortLabel()}</span>
            <ChevronDown 
              size={16} 
              className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-[200px]">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSortBy(option.value);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                    sortBy === option.value ? 'bg-gray-100 font-medium' : ''
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pizza Cards */}
      <div className="space-y-4">
        {getSortedPizzas().map((pizza) => (
          <div key={pizza.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex gap-6">
              
              {/* Right Image */}
              <div className="flex-shrink-0 order-2">
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden bg-gray-100">
                  <img 
                    src={pizza.image} 
                    alt={pizza.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Left Content */}
              <div className="flex-1 order-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {pizza.name}
                </h3>
                
                {renderSpiceLevel(pizza.spiceLevel)}
                
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  {pizza.description}
                </p>
                
                {/* Size Options */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {sizeOptions.map((option) => (
                    <button
                      key={option.size}
                      onClick={() => handleSizeSelect(pizza.id, option.size)}
                      className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                        selectedSizes[pizza.id] === option.size
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.size} {option.price}
                    </button>
                  ))}
                </div>
                
                {/* XL Option */}
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
                  XL Large with Sauces £32.90
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}