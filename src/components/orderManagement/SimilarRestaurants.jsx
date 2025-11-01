import React from 'react';

const restaurants = [
  {
    name: "McDonald's London",
    image: 'https://blog.logomyway.com/wp-content/uploads/2017/01/mcdonalds-logo-1.jpg',
    bgColor: 'bg-red-600',
  },
  {
    name: 'Papa Johns',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSI5Z_v-pdGwU-eiWtUXCdElfa6_qiMYkbuBg&s',
    bgColor: 'bg-green-700',
  },
  {
    name: 'KFC West London',
    image: 'https://blog.logomyway.com/wp-content/uploads/2020/09/KFC-logo.jpg',
    bgColor: 'bg-red-500',
  },
  {
    name: 'Texas Chicken',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpZbhPKoggUSSizAfTIyNSZ5EDdDGPTRZSpg&s',
    bgColor: 'bg-blue-800',
  },
  {
    name: 'Burger King',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Burger_King_2020.svg/1200px-Burger_King_2020.svg.png',
    bgColor: 'bg-orange-500',
  },
  {
    name: 'Shaurma 1',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2utlHhHObilp_KIOEVKpPOm_iROgLEPJrYg&s',
    bgColor: 'bg-orange-400',
  },
];

const SimilarRestaurants = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 bg-gray-50">
      <h2 className="text-2xl font-bold mb-8 text-gray-900">Similar Restaurants</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
        {restaurants.map((rest, idx) => (
          <div
            key={idx}
            className="group cursor-pointer transform hover:scale-105 transition-all duration-300 ease-in-out"
          >
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              {/* Logo Container */}
              <div>
                <div className="h-30 rounded-xl shadow-inner flex items-center justify-center ">
                  <img
                    src={rest.image}
                    alt={rest.name}
                    className="object-contain max-h-full max-w-full filter drop-shadow-sm "
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div 
                    className="hidden w-12 h-12 bg-gray-200 rounded-lg items-center justify-center"
                    style={{display: 'none'}}
                  >
                    <div className="w-8 h-8 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>
              
              {/* Restaurant Name */}
              <div className="p-4 bg-white">
                <h3 className="text-sm font-semibold text-gray-800 text-center leading-tight group-hover:text-red-600 transition-colors duration-200">
                  {rest.name}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarRestaurants;