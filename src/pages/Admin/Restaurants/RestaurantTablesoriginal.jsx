import React, { useEffect, useState } from 'react';
import { restaurantTableList } from '../../../apis/adminApis/adminFuntionsApi';
import { Link } from 'react-router-dom';

const RestaurantTables = () => {
const [restaurantList,setRestaurantsList] = useState([])


 useEffect(() => {
  const fetchRestaurantList = async () => {
    try {
      const response = await restaurantTableList();
  
      setRestaurantsList(response.data)
    } catch (error) {
      console.error(error);
    }
  };

  fetchRestaurantList();
}, []);

  const restaurants = [
    {
      id: 1579066,
      name: "Store Name 5",
      address: "388 Market Street, Suite 1300,...",
      phone: "+921234567890",
      email: "roha.qureshi+mp+5851@yelo.red",
      rating: "NA",
      servicable: "OPEN",
      stripeStatus: "",
      city: "-",
      registeredOn: "May 08 2024 8:48 PM"
    },
    {
      id: 1579065,
      name: "Store Name 4",
      address: "388 Market Street, Suite 1300,...",
      phone: "+921234567890",
      email: "roha.qureshi+mp+1575@yelo.red",
      rating: "NA",
      servicable: "OPEN",
      stripeStatus: "",
      city: "-",
      registeredOn: "May 08 2024 8:48 PM"
    },
    {
      id: 1579064,
      name: "Store Name 3",
      address: "388 Market Street, Suite 1300,...",
      phone: "+921234567890",
      email: "roha.qureshi+mp+6235@yelo.red",
      rating: "NA",
      servicable: "OPEN",
      stripeStatus: "",
      city: "-",
      registeredOn: "May 08 2024 8:48 PM"
    },
    {
      id: 1579063,
      name: "BAKED",
      address: "Cantt Road, Sialkot Cantonment...",
      phone: "+921234567890",
      email: "roha.qureshi+mp+6792@yelo.red",
      rating: "NA",
      servicable: "OPEN",
      stripeStatus: "",
      city: "-",
      registeredOn: "May 08 2024 8:48 PM"
    },
    {
      id: 1579062,
      name: "G.Y.M",
      address: "Cantt Road, Sialkot Cantonment...",
      phone: "+9290078601",
      email: "ahmad.khalid+merchantdashboard1@jungleworks.com",
      rating: "NA",
      servicable: "OPEN",
      stripeStatus: "",
      city: "-",
      registeredOn: "May 08 2024 8:48 PM"
    },
    {
      id: 1579050,
      name: "Green Treat",
      address: "Cantt Road, Sialkot Cantonment...",
      phone: "+921234567890",
      email: "roha.qureshi+mp@jungleworks.com",
      rating: "5 / 5",
      servicable: "OPEN",
      stripeStatus: "",
      city: "-",
      registeredOn: "May 16 2019 2:10 PM"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Restaurants List</h2>
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant Name</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicable</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stripe Status</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered On</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {restaurantList.map((restaurant) => (
              <tr key={restaurant.id} className="hover:bg-gray-50">
                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900">
                    <Link 
    to={`/admin/dashboard/merchants/merchant-details/${restaurant.id}`}
    className="text-blue-600 hover:text-blue-800 hover:underline"
  >
                  
                  {restaurant.id.substring(0, 8)}
                  </Link>
                  
                  </td>
                <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900">{restaurant.name}</td>
                <td className="py-4 px-4 text-sm text-gray-700 max-w-xs truncate">{restaurant.address}</td>
                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-700">{restaurant.phone}</td>
                <td className="py-4 px-4 text-sm text-gray-700 max-w-xs truncate">{restaurant.email}</td>
                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-700">{restaurant.rating}</td>
                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-700">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${restaurant.servicable === "OPEN" ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {restaurant.servicable}
                  </span>
                </td>
                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-700">{restaurant.stripeStatus || "-"}</td>
                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-700">{restaurant.city}</td>
                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-700">{restaurant.registeredOn}</td>
                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-700 space-x-2">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs">
                    View
                  </button>
                  <button className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        Showing 1 - {restaurants.length} of {restaurants.length} entries
      </div>
    </div>
  );
};

export default RestaurantTables;