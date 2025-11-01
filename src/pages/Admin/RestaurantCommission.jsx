import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Percent,
  DollarSign,
  Building2,
  Settings,
  TrendingUp,
  Search,
} from "lucide-react";
import axios from "axios";
import LoadingForAdmins from "./AdminUtils/LoadingForAdmins";
import apiClient from "../../apis/apiClient/apiClient";

function RestaurantCommission() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [commissionType, setCommissionType] = useState("percentage");
  const [commissionValue, setCommissionValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchRestaurants = async () => {
    try {
      const res = await apiClient.get(
        "/restaurants/all-restaurants"
      );
      setRestaurants(res.data.restaurants || []);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
      setError("Failed to fetch restaurants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleSubmit = async () => {
    setSuccess("");
    setError("");

    if (!selectedRestaurant || !commissionValue) {
      setError("Please select a restaurant and enter commission value");
      return;
    }

    try {
      await apiClient.patch(
        `/admin/restaurant/${selectedRestaurant}/commission`,
        {
          type: commissionType,
          value: parseFloat(commissionValue),
        }
      );
      setSuccess("Commission updated successfully");
      setSelectedRestaurant("");
      setCommissionValue("");
      fetchRestaurants();
    } catch (err) {
      console.error("Error updating commission:", err);
      setError("Failed to update commission");
    }
  };

  const filteredRestaurants = restaurants.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRestaurants = filteredRestaurants.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);

  const stats = {
    total: restaurants.length,
    configured: restaurants.filter((r) => r.commission).length,
    avgCommission:
      restaurants
        .filter((r) => r.commission?.type === "percentage")
        .reduce((acc, r) => acc + (r.commission?.value || 0), 0) /
      Math.max(
        restaurants.filter((r) => r.commission?.type === "percentage").length,
        1
      ),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Building2 className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Commission Management
                </h1>
                <p className="text-sm text-gray-500">
                  Manage restaurant commission structures
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
              Admin Panel
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Restaurants
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Configured */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-600">Configured</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.configured}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Settings className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Average */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg Commission
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.avgCommission.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Commission Form */}
        <div className="bg-white rounded-xl shadow-sm border mb-8">
          <div className="px-6 py-5 border-b flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Settings className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Set Commission Rate
              </h2>
              <p className="text-sm text-gray-500">
                Configure commission structure for restaurants
              </p>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="flex items-center space-x-2 p-4 mb-6 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center space-x-2 p-4 mb-6 text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Select Restaurant
                  </label>
                  <select
                    value={selectedRestaurant}
                    onChange={(e) => setSelectedRestaurant(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm"
                  >
                    <option value="">Choose a restaurant...</option>
                    {restaurants.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Commission Type
                  </label>
                  <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setCommissionType("percentage")}
                      className={`flex-1 px-4 py-3 text-sm ${
                        commissionType === "percentage"
                          ? "bg-orange-600 text-white"
                          : "bg-white"
                      }`}
                    >
                      <div className="flex justify-center items-center space-x-1">
                        <Percent className="w-4 h-4" />
                        <span>Percentage</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setCommissionType("fixed")}
                      className={`flex-1 px-4 py-3 text-sm ${
                        commissionType === "fixed"
                          ? "bg-orange-600 text-white"
                          : "bg-white"
                      }`}
                    >
                      <div className="flex justify-center items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>Fixed</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Commission Value{" "}
                    {commissionType === "percentage" ? "(%)" : "($)"}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={commissionValue}
                      onChange={(e) => setCommissionValue(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg shadow-sm"
                      placeholder={
                        commissionType === "percentage" ? "15.0" : "25"
                      }
                    />
                    <div className="absolute right-4 top-3 text-gray-500">
                      {commissionType === "percentage" ? "%" : "$"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700"
                >
                  Update Commission
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Restaurant Table */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-5 border-b flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Restaurant Commission Overview
              </h2>
              <p className="text-sm text-gray-500">
                View and manage commission rates
              </p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search restaurants..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to page 1 on search
                }}
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          {loading ? (
        <LoadingForAdmins/>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentRestaurants.map((r) => (
                      <tr key={r._id}>
                        <td className="px-6 py-4">{r.name}</td>
                        <td className="px-6 py-4">
                          {r.commission?.type === "percentage"
                            ? "Percentage"
                            : r.commission?.type === "fixed"
                            ? "Fixed Amount"
                            : "Not set"}
                        </td>
                        <td className="px-6 py-4">
                          {r.commission?.value
                            ? `${r.commission.value} ${
                                r.commission.type === "percentage" ? "%" : "$"
                              }`
                            : "—"}
                        </td>
                        <td className="px-6 py-4">
                          {r.commission ? (
                            <span className="text-green-600 font-medium">
                              Active
                            </span>
                          ) : (
                            <span className="text-yellow-500 font-medium">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {currentRestaurants.length === 0 && (
                      <tr>
                        <td
                          colSpan="4"
                          className="text-center py-6 text-gray-500"
                        >
                          No restaurants found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-end items-center px-6 py-4 space-x-2 text-sm">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded border ${
                        currentPage === i + 1
                          ? "bg-orange-600 text-white"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded border text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RestaurantCommission;
