import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FiEye,
  FiCheck,
  FiX,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiClock,
  FiAlignLeft,
  FiMail,
  FiPhone,
  FiMessageSquare,
  FiBarChart2,
  FiPieChart,
  FiTrendingUp,
  FiInfo,
  FiUser,
  FiMapPin,
  FiImage,
} from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { FaEnvelope, FaPhoneAlt } from "react-icons/fa";
import LoadingForAdmins from "./AdminUtils/LoadingForAdmins";
import apiClient from "../../apis/apiClient/apiClient";

const RestaurantApprovalsPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState("approvals");
  const [contactMethod, setContactMethod] = useState(null);
  const [message, setMessage] = useState("");

  // Analytics data
  const statusData = [
    {
      name: "Approved",
      value: restaurants.filter((r) => r.status === "Approved").length,
    },
    {
      name: "Pending",
      value: restaurants.filter((r) => r.status === "Pending").length,
    },
    {
      name: "Rejected",
      value: restaurants.filter((r) => r.status === "Rejected").length,
    },
  ];

  const locationData = restaurants.reduce((acc, curr) => {
    const existing = acc.find((item) => item.name === curr.location);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: curr.location, value: 1 });
    }
    return acc;
  }, []);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const response = await apiClient.get("/admin/restaurant-requests", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // console.log(response.data)

        const formatted = response.data.restaurants.map((restaurant) => {
          // Format opening hours properly
          const formattedOpeningHours = restaurant.openingHours
            ? restaurant.openingHours.map((hour) => ({
                day: hour.day.toLowerCase(),
                openingTime: hour.openingTime || "--:--",
                closingTime: hour.closingTime || "--:--",
                isClosed: hour.isClosed || false,
              }))
            : [];

          return {
            id: restaurant._id,
            name: restaurant.name || "N/A",
            merchantSearchName: restaurant.merchantSearchName || "N/A",
            ownerId: restaurant.ownerId,
            email: restaurant.email,
            phone: restaurant.phone,
            address: restaurant.address
              ? `${restaurant.address.street}, ${restaurant.address.city}, ${restaurant.address.state}`
              : "Address not provided",
            status: restaurant.approvalStatus || "pending",
            kycStatus: restaurant.kycStatus || "pending",
            kycRejectionReason: restaurant.kycRejectionReason || "",
            foodType: restaurant.foodType || "Not specified",
            kycDocuments: restaurant.kycDocuments || {},
            minOrderAmount: restaurant.minOrderAmount || 0,
            openingHours: formattedOpeningHours, // Now properly structured array
            paymentMethods: restaurant.paymentMethods
              ? Array.isArray(restaurant.paymentMethods)
                ? restaurant.paymentMethods.join(", ")
                : restaurant.paymentMethods
              : "Not specified",
            rating: restaurant.rating || "No ratings",
            createdAt: restaurant.createdAt
              ? new Date(restaurant.createdAt).toLocaleDateString()
              : "Unknown",
            active: restaurant.active ? "Yes" : "No",
            images: Array.isArray(restaurant.images) ? restaurant.images : [],
            banners: Array.isArray(restaurant.banners)
              ? restaurant.banners
              : [],
          };
        });
        console.log(formatted);
        setRestaurants(formatted);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch merchants:", err);
        toast.error("Failed to load restaurant applications");
        setLoading(false);
      }
    };

    fetchMerchants();
  }, []);



  const downloadImage = async (url, filename) => {
  const response = await fetch(url, { mode: "cors" });
  const blob = await response.blob();
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await apiClient.post(
        `/admin/restaurant-application/${id}/update`,
        { action: "approved" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response.data);

      setRestaurants(
        restaurants.map((r) => (r.id === id ? { ...r, status: "Approved" } : r))
      );

      toast.success("Restaurant approved successfully");
    } catch (err) {
      console.error("Failed to approve:", err);
      toast.error(err.response.data.message);
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      await apiClient.post(
        `/admin/restaurant-application/${id}/update`,
        {
          action: "rejected",
          reason: "Documents incomplete",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setRestaurants(
        restaurants.map((r) => (r.id === id ? { ...r, status: "Rejected" } : r))
      );

      toast.success("Restaurant rejected");
    } catch (err) {
      console.error("Failed to reject:", err);
      toast.error("Failed to reject restaurant");
    }
  };

  const sendMessage = async () => {
    if (!selectedRestaurant || !message) return;

    try {
      console.log(
        `Sending ${contactMethod} to ${selectedRestaurant.email}: ${message}`
      );
      toast.success(`Message sent via ${contactMethod}`);
      setContactMethod(null);
      setMessage("");
      setShowDetailsModal(false);
    } catch (err) {
      toast.error("Failed to send message");
      console.error(err);
    }
  };

  const viewDetails = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowDetailsModal(true);
  };

  // Filter and sort restaurants
  const filtered = restaurants
    .filter((r) => {
      const matchesSearch =
        search === "" ||
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.merchantSearchName.toLowerCase().includes(search.toLowerCase()) ||
        r.email.toLowerCase().includes(search.toLowerCase());

      const matchesLocation =
        locationFilter === "" ||
        r.location.toLowerCase().includes(locationFilter.toLowerCase());

      const matchesStatus =
        statusFilter === "" ||
        r.status.toLowerCase().includes(statusFilter.toLowerCase());

      return matchesSearch && matchesLocation && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "latest")
        return new Date(b.submittedAt) - new Date(a.submittedAt);
      if (sortBy === "az") return a.name.localeCompare(b.name);
      return 0;
    });
  const statusBadge = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800",
      Approved: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header with Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("approvals")}
            className={`${
              activeTab === "approvals"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Approval Requests
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`${
              activeTab === "analytics"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Analytics Dashboard
          </button>
        </nav>
      </div>

      {activeTab === "approvals" ? (
        <>
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Restaurant Approvals
              </h1>
              <p className="text-gray-600 mt-2">
                {filtered.length}{" "}
                {filtered.length === 1 ? "application" : "applications"} found
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <FiFilter className="mr-2" />
                Filters
                <FiChevronDown
                  className={`ml-2 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name or owner"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">All Locations</option>
                  {[...new Set(restaurants.map((r) => r.location))].map(
                    (loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    )
                  )}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="latest">
                    <span className="flex items-center">
                      <FiClock className="mr-2" /> Latest
                    </span>
                  </option>
                  <option value="az">
                    <span className="flex items-center">
                      <FiAlignLeft className="mr-2" /> A - Z
                    </span>
                  </option>
                </select>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
            {loading ? (
              <LoadingForAdmins />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Restaurant
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Contact
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Address
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Created
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filtered.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {r.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {r.merchantSearchName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{r.phone}</div>
                          <div className="text-sm text-gray-500">{r.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {r.address.slice(0, 10)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {statusBadge(r.status)}
                          {r.kycStatus === "rejected" && (
                            <div className="text-xs text-red-500 mt-1">
                              {r.kycRejectionReason}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {r.createdAt}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => viewDetails(r)}
                              className="text-orange-600 hover:text-orange-900 p-1 rounded-full hover:bg-orange-50"
                              title="View details"
                            >
                              <FiEye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleApprove(r.id)}
                              disabled={r.status === "Approved"}
                              className={`p-1 rounded-full ${
                                r.status === "Approved"
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-green-600 hover:text-green-900 hover:bg-green-50"
                              }`}
                              title="Approve"
                            >
                              <FiCheck className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleReject(r.id)}
                              disabled={r.status === "Rejected"}
                              className={`p-1 rounded-full ${
                                r.status === "Rejected"
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-red-600 hover:text-red-900 hover:bg-red-50"
                              }`}
                              title="Reject"
                            >
                              <FiX className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            Media Galler
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Application Analytics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <FiBarChart2 className="mr-2" /> Applications by Status
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <FiTrendingUp className="mr-2" /> Applications by Location
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={locationData.slice(0, 5)}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#EA4424" name="Applications" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h3 className="text-sm font-medium text-green-800">Approved</h3>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {restaurants.filter((r) => r.status === "Approved").length}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {restaurants.length > 0
                  ? `${Math.round(
                      (restaurants.filter((r) => r.status === "Approved")
                        .length /
                        restaurants.length) *
                        100
                    )}% of total`
                  : "No data"}
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <h3 className="text-sm font-medium text-yellow-800">Pending</h3>
              <p className="text-2xl font-bold text-yellow-600 mt-2">
                {restaurants.filter((r) => r.status === "Pending").length}
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                {restaurants.length > 0
                  ? `${Math.round(
                      (restaurants.filter((r) => r.status === "Pending")
                        .length /
                        restaurants.length) *
                        100
                    )}% of total`
                  : "No data"}
              </p>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <h3 className="text-sm font-medium text-red-800">Rejected</h3>
              <p className="text-2xl font-bold text-red-600 mt-2">
                {restaurants.filter((r) => r.status === "Rejected").length}
              </p>
              <p className="text-xs text-red-600 mt-1">
                {restaurants.length > 0
                  ? `${Math.round(
                      (restaurants.filter((r) => r.status === "Rejected")
                        .length /
                        restaurants.length) *
                        100
                    )}% of total`
                  : "No data"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRestaurant && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full border border-gray-200">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-6 py-5 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {selectedRestaurant.name}
                    </h3>
                    <p className="text-base text-gray-600 font-medium">
                      {selectedRestaurant.merchantSearchName}
                    </p>
                    <div className="flex items-center mt-2 space-x-4">
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-1">★</span>
                        <span className="text-sm font-semibold text-gray-700">
                          {selectedRestaurant.rating}/5
                        </span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          selectedRestaurant.active === "Yes"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedRestaurant.active === "Yes"
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-colors"
                    onClick={() => {
                      setShowDetailsModal(false);
                      setContactMethod(null);
                    }}
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="bg-white px-6 py-6">
                {!contactMethod ? (
                  <>
                    {/* Status Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">
                            Approval Status
                          </span>
                          {statusBadge(selectedRestaurant.status)}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">
                            KYC Status
                          </span>
                          {statusBadge(selectedRestaurant.kycStatus)}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">
                            Min Order
                          </span>
                          <span className="text-lg font-bold text-orange-600">
                            ₹{selectedRestaurant.minOrderAmount}
                          </span>
                        </div>
                      </div>
                    </div>

                    {selectedRestaurant.kycRejectionReason && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <FiAlertCircle className="h-5 w-5 text-red-400" />
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-red-800">
                              KYC Rejection Reason
                            </h4>
                            <p className="text-sm text-red-700 mt-1">
                              {selectedRestaurant.kycRejectionReason}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left Column */}
                      <div className="space-y-6">
                        {/* Restaurant Details Card */}
                        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <FiInfo className="mr-2 text-orange-500" />
                            Restaurant Details
                          </h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-gray-500">
                                Food Type:
                              </span>
                              <span className="text-sm text-gray-900 font-medium">
                                {selectedRestaurant.foodType}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-gray-500">
                                Payment Methods:
                              </span>
                              <span className="text-sm text-gray-900">
                                {selectedRestaurant.paymentMethods}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-sm font-medium text-gray-500">
                                Opening Hours:
                              </span>
                              {selectedRestaurant.openingHours &&
                              Array.isArray(selectedRestaurant.openingHours) ? (
                                selectedRestaurant.openingHours.map((item) => (
                                  <div
                                    key={item.day}
                                    className="flex justify-between text-sm text-gray-900"
                                  >
                                    <span className="capitalize">
                                      {item.day}
                                    </span>
                                    <span>
                                      {item.isClosed ? (
                                        <span className="text-red-500">
                                          Closed
                                        </span>
                                      ) : (
                                        `${item.openingTime} - ${item.closingTime}`
                                      )}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <span className="text-sm text-gray-400">
                                  Not specified
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Contact Information Card */}
                        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <FiPhone className="mr-2 text-orange-500" />
                            Contact Information
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <FiPhone className="h-4 w-4 text-gray-400 mr-3" />
                              <span className="text-sm text-gray-900">
                                {selectedRestaurant.phone}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <FiMail className="h-4 w-4 text-gray-400 mr-3" />
                              <span className="text-sm text-gray-900">
                                {selectedRestaurant.email}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <FiUser className="h-4 w-4 text-gray-400 mr-3" />
                              <span className="text-sm text-gray-500">
                                Owner ID:{" "}
                              </span>
                              <span className="text-sm text-gray-900 ml-1">
                                {selectedRestaurant.ownerId}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-6">
                        {/* Address Card */}
                        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <FiMapPin className="mr-2 text-orange-500" />
                            Address
                          </h4>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {selectedRestaurant.address}
                          </p>
                        </div>

                        {/* Media Section */}
                        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <FiImage className="mr-2 text-orange-500" />
                            Media Gallery
                          </h4>
                          {console.log(
                            selectedRestaurant.kycDocuments.aadharDocUrl
                          )}

                          {selectedRestaurant && (
                            <div className="mb-4">
                              <h5 className="text-sm font-medium text-gray-600 mb-2">
                                Restaurant Images
                              </h5>
                              <div className="grid grid-cols-3 gap-2">
                                {selectedRestaurant.images.map((image, i) => {
                                  console.log(selectedRestaurant.images); // Optional debug
                                  return (
                                    <img
                                      src={image}
                                      key={i}
                                      alt=""
                                      className="h-16 w-full object-cover rounded-md border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                                    />
                                  );
                                })}
                              </div>
                              {selectedRestaurant.images.length > 6 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  +{selectedRestaurant.images.length - 6} more
                                  images
                                </p>
                              )}
                            </div>
                          )}

                        {selectedRestaurant && (
  <div className="mb-4">
    <h5 className="text-sm font-medium text-gray-600 mb-2">KYC Images</h5>
    <div className="grid grid-cols-3 gap-2">
      {[
        { label: "FSSAI", url: selectedRestaurant.kycDocuments.fssaiDocUrl },
        { label: "Aadhar", url: selectedRestaurant.kycDocuments.aadharDocUrl },
        { label: "GST", url: selectedRestaurant.kycDocuments.gstDocUrl },
      ].map(({ label, url }, index) => (
        <div key={index} className="relative group">
          <img
            src={url}
            alt={label}
            className="h-16 w-full object-cover rounded-md border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          />
          <button
            type="button"
            onClick={() => downloadImage(url, `${label}.jpg`)}
            className="absolute top-1 right-1 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded hidden group-hover:block"
            title={`Download ${label}`}
          >
            ⬇
          </button>
        </div>
      ))}
    </div>
  </div>
)}

                          {selectedRestaurant.banners.length > 0 && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-600 mb-2">
                                Promotional Banners
                              </h5>
                              <div className="grid grid-cols-2 gap-2">
                                {selectedRestaurant.banners
                                  .slice(0, 4)
                                  .map((banner, index) => (
                                    <img
                                      key={index}
                                      src={banner}
                                      alt={`Banner ${index + 1}`}
                                      className="h-20 w-full object-cover rounded-md border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                                    />
                                  ))}
                              </div>
                              {selectedRestaurant.banners.length > 4 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  +{selectedRestaurant.banners.length - 4} more
                                  banners
                                </p>
                              )}
                            </div>
                          )}

                          {selectedRestaurant.images.length === 0 &&
                            selectedRestaurant.banners.length === 0 && (
                              <div className="text-center py-8 text-gray-400">
                                <FiImage className="mx-auto h-12 w-12 mb-2" />
                                <p className="text-sm">No media available</p>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Contact Section */}
                    {selectedRestaurant && (
                      <div className="mt-8 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <FiMessageSquare className="mr-2 text-orange-500" />
                          Quick Contact Options
                        </h4>
                        <div className="flex flex-wrap gap-5">
                          <a
                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${selectedRestaurant.email}&su=Welcome&body=Hello%20,%20welcome%20to%20Orado!`}
                          >
                            <FaEnvelope size={20} />
                          </a>
                          <a href={`tel:${selectedRestaurant.phone}`}>
                            <FaPhoneAlt size={20} />
                          </a>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-6">
                      <h4 className="text-xl font-semibold text-gray-900 mb-2 capitalize">
                        Send {contactMethod} to {selectedRestaurant.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Compose your message below and it will be sent via{" "}
                        {contactMethod}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message Content
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                        rows="6"
                        placeholder={`Type your ${contactMethod} message here...`}
                      />
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">
                          {message.length}/1000 characters
                        </span>
                        <span className="text-xs text-gray-500">
                          To:{" "}
                          {contactMethod === "email"
                            ? selectedRestaurant.email
                            : selectedRestaurant.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                {contactMethod ? (
                  <>
                    <button
                      type="button"
                      className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                      onClick={() => setContactMethod(null)}
                    >
                      <FiArrowLeft className="mr-2 h-4 w-4" />
                      Back to Details
                    </button>
                    <button
                      type="button"
                      className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-sm bg-orange-600 text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-50"
                      onClick={sendMessage}
                      disabled={!message.trim()}
                    >
                      <FiSend className="mr-2 h-4 w-4" />
                      Send{" "}
                      {contactMethod.charAt(0).toUpperCase() +
                        contactMethod.slice(1)}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-red-300 rounded-lg shadow-sm bg-white text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => {
                        handleReject(selectedRestaurant.id);
                        setShowDetailsModal(false);
                      }}
                      disabled={selectedRestaurant.status === "Rejected"}
                    >
                      <FiX className="mr-2 h-4 w-4" />
                      {selectedRestaurant.status === "Rejected"
                        ? "Already Rejected"
                        : "Reject Application"}
                    </button>
                    <button
                      type="button"
                      className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-sm bg-green-600 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => {
                        handleApprove(selectedRestaurant.id);
                        setShowDetailsModal(false);
                      }}
                      disabled={selectedRestaurant.status === "Approved"}
                    >
                      <FiCheck className="mr-2 h-4 w-4" />
                      {selectedRestaurant.status === "Approved"
                        ? "Already Approved"
                        : "Approve Application"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantApprovalsPage;
