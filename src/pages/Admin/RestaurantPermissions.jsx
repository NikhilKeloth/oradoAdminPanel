import React, { useState, useEffect } from 'react';
import { Check, X, ChevronRight, Shield, Settings, Users, AlertCircle, Search } from 'lucide-react';
import axios from 'axios';
import LoadingForAdmins from './AdminUtils/LoadingForAdmins';
import apiClient from '../../apis/apiClient/apiClient';

const RestaurantPermissions = () => {
  const token = localStorage.getItem('adminToken');
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [selectedActions, setSelectedActions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    apiClient
      .get('/admin/getrestuarants/permissions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const data = res.data?.data || [];
        setRestaurants(data);
        setFilteredRestaurants(data); // Initialize filtered restaurants with all data

        const initSelections = {};
        data.forEach((rest) => {
          initSelections[rest._id] = {
            canManageMenu: rest.permissions.canManageMenu ? 'accept' : 'reject',
            canAcceptOrder: rest.permissions.canAcceptOrder ? 'accept' : 'reject',
            canRejectOrder: rest.permissions.canRejectOrder ? 'accept' : 'reject',
            canManageOffers: rest.permissions.canManageOffers ? 'accept' : 'reject',
            canViewReports: rest.permissions.canViewReports ? 'accept' : 'reject',
          };
        });
        setSelectedActions(initSelections);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching restaurants:', err);
      });
  }, []);

  // Filter restaurants based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRestaurants(restaurants);
    } else {
      const filtered = restaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRestaurants(filtered);
    }
  }, [searchTerm, restaurants]);

  const handleAction = (restaurantId, permissionKey, actionType) => {
    setSelectedActions((prev) => {
      const updatedForOne = {
        ...prev[restaurantId],
        [permissionKey]: actionType,
      };
      const newSelected = {
        ...prev,
        [restaurantId]: updatedForOne,
      };
      sendUpdatedPermissions(restaurantId, updatedForOne);
      return newSelected;
    });
  };

  const sendUpdatedPermissions = (restaurantId, updatedPermissionsMap) => {
    const permissionsToSend = {};
    Object.entries(updatedPermissionsMap).forEach(([key, val]) => {
      permissionsToSend[key] = val === 'accept';
    });

    apiClient
      .put(
        '/admin/restuarants/permissions',
        {
          restaurantId,
          permissions: permissionsToSend,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        console.log(`Permissions updated for restaurant ${restaurantId}:`, res.data.permissions);
      })
      .catch((err) => {
        console.error('Failed to update permissions:', err);
      });
  };

  const permissionKeys = [
    { key: 'canManageMenu', label: 'Manage Menu', icon: Settings },
    { key: 'canAcceptOrder', label: 'Accept Orders', icon: Check },
    { key: 'canRejectOrder', label: 'Reject Orders', icon: X },
    { key: 'canManageOffers', label: 'Manage Offers', icon: AlertCircle },
    { key: 'canViewReports', label: 'View Reports', icon: Users },
  ];

  if (loading) {
    return <LoadingForAdmins />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center text-sm text-orange-600 mb-4">
            <Shield className="w-4 h-4 mr-2" />
            <span>Admin Dashboard</span>
            <ChevronRight className="mx-2 h-4 w-4" />
            <span className="font-medium">Permissions Management</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-100 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Restaurant Permissions
                </h1>
                <p className="text-gray-600 text-lg">
                  Manage and control restaurant access to dashboard features with precision
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Filter */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-2xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
              placeholder="Search restaurants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Permissions Table Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-orange-100">
          <div className="overflow-auto max-h-[80vh]"> {/* Increased height to 80% of viewport */}
            <table className="min-w-full">
              <thead className="sticky top-0 z-10 bg-gradient-to-r from-orange-500 to-red-500">
                <tr>
                  <th className="px-8 py-6 text-left font-bold text-white text-lg min-w-[300px]">
                    Restaurant
                  </th>
                  {permissionKeys.map((perm) => {
                    const Icon = perm.icon;
                    return (
                      <th
                        key={perm.key}
                        className="px-6 py-6 text-center font-bold text-white min-w-[200px]"
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <Icon className="w-5 h-5" />
                          <span className="text-sm">{perm.label}</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRestaurants.map((rest, index) => (
                  <tr
                    key={rest._id}
                    className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-300"
                  >
                    <td className="px-8 py-6 sticky left-0 bg-white min-w-[300px] z-5">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-400 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">
                              {rest.name[0].toUpperCase()}
                            </span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-gray-900 text-lg">{rest.name}</h3>
                          <p className="text-gray-500 text-sm">{rest.email}</p>
                        </div>
                      </div>
                    </td>
                    {permissionKeys.map((perm) => {
                      const current = selectedActions[rest._id]?.[perm.key];
                      return (
                        <td key={`${rest._id}-${perm.key}`} className="px-6 py-6 text-center min-w-[200px]">
                          <div className="flex justify-center">
                            <div className="bg-gray-100 rounded-2xl p-1 shadow-inner">
                              <div className="flex" role="group">
                                <button
                                  onClick={() => handleAction(rest._id, perm.key, 'accept')}
                                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${current === 'accept'
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-200'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                                    }`}
                                >
                                  <Check className="w-4 h-4" />
                                  <span>Allow</span>
                                </button>
                                <button
                                  onClick={() => handleAction(rest._id, perm.key, 'reject')}
                                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ml-1 ${current === 'reject'
                                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-200'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                                    }`}
                                >
                                  <X className="w-4 h-4" />
                                  <span>Deny</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRestaurants.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-12 h-12 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {searchTerm ? 'No matching restaurants found' : 'No restaurants found'}
              </h3>
              <p className="text-gray-500 text-lg">
                {searchTerm
                  ? 'Try adjusting your search query'
                  : 'There are no restaurants available to manage permissions for.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default RestaurantPermissions;      