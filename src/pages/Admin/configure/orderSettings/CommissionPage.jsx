  import React, { useState, useEffect } from "react";
  import {
    Edit,
    Trash2,
    Plus,
    Receipt,
    CalendarIcon,
    Download,
    Eye,
    CreditCard,
    Filter,
    Search,
    Settings,
    TrendingUp,
    DollarSign,
    Users,
    BarChart3,
    Sparkles,
    X,
    AlertCircle,
  } from "lucide-react";
  import {
    deleteCommissionSetting,
    getCommissionDetails,
    getCommissionSettings,
    saveCommissionSettings,
  } from "../../../../apis/adminApis/commisionApi";
  import { fetchRestaurantsDropdown } from "../../../../apis/adminApis/adminFuntionsApi";
  import { toast } from "react-toastify";
  import apiClient from "../../../../apis/apiClient/apiClient";
  import { set } from "date-fns";

  const CombinedCommissionPanel = () => {
    const [activeTab, setActiveTab] = useState("settings");
    const [viewMode, setViewMode] = useState("all");
    const [showForm, setShowForm] = useState(false);
    const [showDefaultForm, SetshowDefaultForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
      restaurantId: "",
      storeType: "",
      commissionType: "percentage",
      commissionValue: "",
      commissionBase: "subtotal",
      isDefault: false,
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingItem, setDeletingItem] = useState(null);
    const [errors, setErrors] = useState({});
    // Commission Details State
    const [selectedMerchant, setSelectedMerchant] = useState("All Merchants");
    const [dateFrom, setDateFrom] = useState();
    const [dateTo, setDateTo] = useState();
    const [searchTerm, setSearchTerm] = useState("");

    // Commission Settings State
    const [defaultSetting, setDefaultSetting] = useState({
      type: "Percentage",
      value: "15%",
      base: "Subtotal",
      appliesTo: "All Stores",
    });

    const [storeSettings, setStoreSettings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [restaurants, setRestaurants] = useState([]);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [commissionData, setCommissionData] = useState([]);
    const [commissionSummary, setCommissionSummary] = useState({
      totalCommission: 0,
      totalEarnings: 0,
      totalOrders: 0,
    });

    const [exportLoading, setExportLoading] = useState(false);

    useEffect(() => {
      loadCommissionSettings();
      loadRestaurants();
    }, []);



    // Load commission settings from API
    // const loadCommissionSettings = async () => {
    //   setLoading(true);
    //   setError(null);
    //   try {
    //     const response = await getCommissionSettings();
    //     console.log('Commission settings response:', response);

    //     if (response && response.data) {
    //       const defaultSettings = response.data.filter(s => s.isDefault);
    //       const storeSpecificSettings = response.data.filter(s => !s.isDefault);

    //       // Process default setting
    //       if (defaultSettings.length > 0) {
    //         const defaultSetting = defaultSettings[0];
    //         setDefaultSetting({
    //           type: defaultSetting.commissionType === 'percentage' ? 'Percentage' : 'Fixed',
    //           value: defaultSetting.commissionType === 'percentage'
    //             ? `${defaultSetting.commissionValue}%`
    //             : `₹${defaultSetting.commissionValue}`,
    //           base: defaultSetting.commissionBase.charAt(0).toUpperCase() + defaultSetting.commissionBase.slice(1),
    //           appliesTo: "All Stores",
    //         });
    //       }

    //       // Process store-specific settings
    //       setStoreSettings(storeSpecificSettings.map(setting => {
    //         const restaurantName = setting.restaurantId
    //           ? setting.restaurantId.name
    //           : 'Unknown Restaurant';

    //         return {
    //           id: setting._id,
    //           restaurant: restaurantName,
    //           storeType: setting.storeType ? setting.storeType.charAt(0).toUpperCase() + setting.storeType.slice(1) : 'Restaurant',
    //           type: setting.commissionType,
    //           value: setting.commissionType === 'percentage'
    //             ? `${setting.commissionValue}%`
    //             : `₹${setting.commissionValue}`,
    //           base: setting.commissionBase.charAt(0).toUpperCase() + setting.commissionBase.slice(1),
    //           isDefault: setting.isDefault,
    //           originalData: setting
    //         };
    //       }));
    //     }
    //   } catch (error) {
    //     console.error('Error loading commission settings:', error);
    //     setError('Failed to load commission settings');
    //   } finally {
    //     setLoading(false);
    //   }
    // };

  const loadCommissionSettings = async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await getCommissionSettings();
    console.log("Commission settings response:", response);

    if (response && response.data) {
      const defaultSettings = response.data.filter((s) => s.isDefault);
      const storeSpecificSettings = response.data.filter((s) => !s.isDefault);

      // Process default setting - set to null if no default exists
      if (defaultSettings.length > 0) {
        setDefaultSetting(defaultSettings[0]);
      } else {
        setDefaultSetting(null); // ← This is the key fix
      }

      // Process store-specific settings
      setStoreSettings(
        storeSpecificSettings.map((setting) => ({
          ...setting,
          restaurantName: setting.restaurantId
            ? setting.restaurantId.name
            : "Unknown Restaurant",
        }))
      );
    }
  } catch (error) {
    console.error("Error loading commission settings:", error);
    setError("Failed to load commission settings");
  } finally {
    setLoading(false);
  }
};
    const handleExportExcel = async () => {
      setExportLoading(true);
      try {
        const params = {};

        if (selectedMerchant !== "All Merchants") {
          const restaurant = restaurants.find((r) => r.name === selectedMerchant);
          if (restaurant) {
            params.restaurantId = restaurant._id;
          }
        }

        if (dateFrom) {
          params.startDate = dateFrom.toISOString().split("T")[0];
        }
        if (dateTo) {
          params.endDate = dateTo.toISOString().split("T")[0];
        }

        const queryString = new URLSearchParams(params).toString();

        const response = await apiClient.get(
          `commission/summary/export-excel?${queryString}`,
          { responseType: "blob" }
        );

        // ✅ Correct filename extraction
        let filename = "commissions.xlsx";
        const contentDisposition = response.headers["content-disposition"];
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(
            /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
          );
          console.log("Filename match:", filenameMatch);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, "");
          }
        }

        // Trigger download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.remove();

        toast.success("Export completed successfully!");
      } catch (error) {
        console.error("Download failed:", error);
        toast.error("Failed to export commissions");
      } finally {
        setExportLoading(false);
      }
    };

    // Load restaurants from API
    const loadRestaurants = async () => {
      try {
        const response = await fetchRestaurantsDropdown();
        setRestaurants(response.data);
      } catch (error) {
        console.error("Error loading restaurants:", error);
      }
    };

    useEffect(() => {
      loadCommissionSettings();
      loadRestaurants();
      if (activeTab === "details") {
        loadCommissionDetails();
      }
    }, [activeTab]);

    // Load commission details when tab changes
    useEffect(() => {
      if (activeTab === "details") {
        loadCommissionDetails();
      }
    }, [activeTab, selectedMerchant, dateFrom, dateTo]);

    // Add debounced search effect
    useEffect(() => {
      if (activeTab === "details") {
        const timeoutId = setTimeout(() => {
          loadCommissionDetails();
        }, 500); // Debounce search by 500ms

        return () => clearTimeout(timeoutId);
      }
    }, [searchTerm]);

    // Handle clearing all filters
    const handleClearFilters = () => {
      setSelectedMerchant("All Merchants");
      setDateFrom(null);
      setDateTo(null);
      setSearchTerm("");
    };

    // Handle search input change
    const handleSearchChange = (e) => {
      setSearchTerm(e.target.value);
    };

    // Handle merchant selection change
    const handleMerchantChange = (e) => {
      setSelectedMerchant(e.target.value);
    };

    // Handle date changes
    const handleDateFromChange = (e) => {
      const date = e.target.value ? new Date(e.target.value) : null;
      setDateFrom(date);
    };

    const handleDateToChange = (e) => {
      const date = e.target.value ? new Date(e.target.value) : null;
      setDateTo(date);
    };

    const handleConfirmDelete = async () => {
      try {
        await deleteCommissionSetting(deletingItem._id);
        console.log(deletingItem);
        toast.success("Commission deleted successfully!");

        await loadCommissionSettings();
        setShowDeleteModal(false);
      } catch (error) {
        console.error("Error deleting commission:", error);
        toast.error("Failed to delete commission");
      }
    };

    // Load commission details from API
    const loadCommissionDetails = async () => {
      setDetailsLoading(true);
      try {
        const params = {
          merchant:
            selectedMerchant === "All Merchants" ? null : selectedMerchant,
          dateFrom: dateFrom ? dateFrom.toISOString() : null,
          dateTo: dateTo ? dateTo.toISOString() : null,
          searchTerm: searchTerm || null,
          page: 1, // You can add pagination state if needed
          limit: 50, // Increase limit to show more data
        };

        const response = await getCommissionDetails(params);
        console.log("Commission details response:", response);

        if (response && response.success && response.data) {
          // Map the API response to match the expected table structure
          const mappedData = response.data.map((item) => ({
            orderId: item.orderId || item._id,
            restaurantId: item.restaurantId,
            storeName: item.restaurantId?.name || "Unknown",
            merchantName: item.restaurantId?.name || "Unknown",
            totalAmount: item.totalOrderAmount || item.totalAmount,
            payableToMerchant: item.restaurantNetEarning,
            payableToAdmin: item.commissionAmount,
            status: item.payoutStatus || "pending",
            cartTotal: item.cartTotal || item.totalOrderAmount,
            totalOrderAmount: item.totalOrderAmount,
            restaurantNetEarning: item.restaurantNetEarning,
            commissionAmount: item.commissionAmount,
            payoutStatus: item.payoutStatus,
            date: item.date || item.createdAt,
            // These fields aren't in the API response but are required by the table
            paymentMode: "Online", // Default value
            commissionTransfer: "Online", // Default value
            stripeAccountStatus: "Active", // Default value
          }));
          setCommissionData(mappedData);

          // Update summary from backend response
          if (response.summary) {
            setCommissionSummary({
              totalCommission: response.summary.totalCommission || 0,
              totalEarnings: response.summary.totalEarnings || 0,
              totalOrders: response.summary.totalOrders || 0,
            });
          }
        }
      } catch (error) {
        console.error("Error loading commission details:", error);
        toast.error("Failed to load commission details");
      } finally {
        setDetailsLoading(false);
      }
    };




  const validateForm = () => {
    const newErrors = {};

    if (!formData.commissionType) {
      newErrors.commissionType = "Commission type is required";
    }

    // Commission value is only required if commission type is not 'costPrice'
    if (formData.commissionType !== "costPrice" && (!formData.commissionValue || parseFloat(formData.commissionValue) <= 0)) {
      newErrors.commissionValue = "Valid commission value is required";
    }

    if (!formData.commissionBase) {
      newErrors.commissionBase = "Commission base is required";
    }

    if (!formData.isDefault && !formData.restaurantId) {
      newErrors.restaurantId = "Restaurant selection is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };






    
    // Handle editing a commission setting
    const handleEdit = (item) => {
      setEditingItem(item);
      setFormData({
        restaurantId: item.restaurantId?._id || item.restaurantId || "",
        storeType: item.storeType || "",
        commissionType: item.commissionType || "percentage",
        commissionValue: item.commissionValue?.toString() || "",
        commissionBase: item.commissionBase || "subtotal",
        isDefault: item.isDefault || false,
      });
      setShowForm(true);
    };

    // Handle deleting a commission setting
    const handleDelete = async (id) => {
      if (
        window.confirm("Are you sure you want to delete this commission setting?")
      ) {
        try {
          await deleteCommissionSetting(id);
          toast.success("Commission setting deleted successfully!");
          await loadCommissionSettings();
        } catch (error) {
          console.error("Error deleting commission setting:", error);
          setError("Failed to delete commission setting");
        }
      }
    };

    // Handle saving a commission setting
  const handleSave = async () => {
    // Validate form before saving
    if (!validateForm()) {
      return;
    }

    try {
      const settingsData = {
        restaurantId: formData.restaurantId || null,
        storeType: formData.storeType || null,
        commissionType: formData.commissionType,
        // Only include commissionValue if commissionType is not 'costPrice'
        ...(formData.commissionType !== "costPrice" && {
          commissionValue: parseFloat(formData.commissionValue)
        }),
        commissionBase: formData.commissionBase,
        isDefault: formData.isDefault
      };

      await saveCommissionSettings(settingsData);
      toast.success('Commission setting saved successfully!');
      await loadCommissionSettings();
      handleCancel();
    } catch (error) {
      console.error('Error saving commission setting:', error);
      setError('Failed to save commission setting');
    }
  };

    // Handle canceling the form
    const handleCancel = () => {
      setFormData({
        restaurantId: "",
        storeType: "",
        commissionType: "percentage",
        commissionValue: "",
        commissionBase: "subtotal",
        isDefault: false,
      });
      SetshowDefaultForm(false);
      setShowForm(false);
      setEditingItem(null);
    };

    const handleDefaultFormHandle = () => {
      setFormData({
        restaurantId: "",
        storeType: "",
        commissionType: "percentage",
        commissionValue: "",
        commissionBase: "subtotal",
        isDefault: false,
      });
      SetshowDefaultForm(false);
      setEditingItem(null);
    };
    // Helper functions for commission details tab
    const getStatusBadge = (status) => {
      switch (status) {
        case "paid":
          return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Paid
            </span>
          );
        case "pending":
          return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              Pending
            </span>
          );
        default:
          return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
              {status}
            </span>
          );
      }
    };

    const getPaymentModeBadge = (mode) => {
      return mode === "Online" ? (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          Online
        </span>
      ) : (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
          Offline
        </span>
      );
    };

    const formatCurrency = (amount) => {
      return `₹${amount?.toFixed(2) || "0.00"}`;
    };

    const formatDate = (date) => {
      if (!date) return "Select date";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    const filteredData = commissionData?.filter((item) => {
      // Filter by selected merchant
      const matchesMerchant =
        selectedMerchant === "All Merchants" ||
        item.restaurantId?.name === selectedMerchant ||
        item.merchantName === selectedMerchant;

      // Filter by search term
      const matchesSearch =
        !searchTerm ||
        item.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.restaurantId?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        item.merchantName?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesMerchant && matchesSearch;
    });

    const totalPayableToMerchants = filteredData.reduce(
      (sum, item) => sum + (item.payableToMerchant || 0),
      0
    );
    const totalPayableToAdmin = filteredData.reduce(
      (sum, item) => sum + (item.payableToAdmin || 0),
      0
    );
    const totalAmount = filteredData.reduce(
      (sum, item) => sum + (item.totalAmount || 0),
      0
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-8 py-8">
                <div className="flex items-center justify-center">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Receipt className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl lg:text-4xl font-bold text-white">
                        🧾 Admin Panel – Merchant Commission Settings
                      </h1>
                      <p className="text-violet-100 text-lg">
                        Manage commission settings and track payment details
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`flex items-center gap-3 px-8 py-4 text-sm font-semibold border-b-2 transition-all duration-300 ${
                    activeTab === "settings"
                      ? "border-purple-500 text-purple-600 bg-white"
                      : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-white/50"
                  }`}
                >
                  <Settings className="h-5 w-5" />
                  Commission Settings
                </button>
                <button
                  onClick={() => setActiveTab("details")}
                  className={`flex items-center gap-3 px-8 py-4 text-sm font-semibold border-b-2 transition-all duration-300 ${
                    activeTab === "details"
                      ? "border-purple-500 text-purple-600 bg-white"
                      : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-white/50"
                  }`}
                >
                  <CreditCard className="h-5 w-5" />
                  Commission Details
                </button>
              </div>
            </div>

            {/* Commission Settings Tab */}
            {activeTab === "settings" && (
              <div className="p-8 space-y-8">
                {/* View Mode Selection */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
                  <div className="space-y-4">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      🔘 View Mode:
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="radio"
                          value="all"
                          checked={viewMode === "all"}
                          onChange={(e) => setViewMode(e.target.value)}
                          className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                        />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                          All
                        </span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="radio"
                          value="defaults"
                          checked={viewMode === "defaults"}
                          onChange={(e) => setViewMode(e.target.value)}
                          className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                        />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                          {" "}
                          Default Only
                        </span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="radio"
                          value="store-specific"
                          checked={viewMode === "store-specific"}
                          onChange={(e) => setViewMode(e.target.value)}
                          className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                        />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                          Store-Specific Only
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Default Commission Setting */}
                {/* Default Commission Setting */}
                  {(viewMode === "all" || viewMode === "defaults") && (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-5 border-b border-amber-200/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-amber-600" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Default Commission Setting
                          </h3>
                        </div>
                      </div>
                      <div className="p-6">
                        {loading ? (
                          <div className="flex items-center justify-center py-12">
                            <div className="flex flex-col items-center gap-4">
                              <div className="animate-spin rounded-full h-10 w-10 border-3 border-purple-200 border-t-purple-600"></div>
                              <span className="text-gray-600 font-medium">
                                Loading commission settings...
                              </span>
                            </div>
                          </div>
                        ) : error ? (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <div className="text-red-600 mb-4 font-semibold">
                              {error}
                            </div>
                            <button
                              onClick={loadCommissionSettings}
                              className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-semibold transition-colors shadow-lg"
                            >
                              Retry Loading
                            </button>
                          </div>
                        ) :  defaultSetting ? (
                          <>
                            <div className="overflow-hidden rounded-xl border border-gray-200">
                              <table className="w-full">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                  <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                      Type
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                      Value
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                      Base
                                    </th>
                                    {/* <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Applies To</th> */}
                                  </tr>
                                </thead>
                                <tbody className="bg-white">
                                  <tr className="border-t border-gray-100">
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                      {defaultSetting.commissionType}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                      {defaultSetting.commissionType === "percentage"
                                        ? `${defaultSetting.commissionValue}%`
                                        : defaultSetting.commissionType === "fixed"
                                        ? `₹${defaultSetting.commissionValue}`
                                        : "Cost Price"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                      {defaultSetting.commissionBase}
                                    </td>
                                    {/* <td className="px-6 py-4 text-sm text-gray-900">{defaultSetting.appliesTo}</td> */}
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            <div className="mt-6">
                              <button
                                onClick={() => {
                                  setEditingItem({ isDefault: true });
                                  setFormData({
                                    restaurantId: "",
                                    storeType: "",
                                    commissionType: defaultSetting.commissionType,
                                    commissionValue: defaultSetting.commissionValue,
                                    commissionBase: defaultSetting.commissionBase,
                                    isDefault: true,
                                  });
                                  SetshowDefaultForm(true);
                                }}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 shadow-sm text-sm font-semibold rounded-xl text-gray-700 hover:bg-gray-50 hover:border-purple-300 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                              >
                                <Edit className="h-4 w-4" />
                                Edit Default Setting
                              </button>
                            </div>
                          </>
                        ) : (  <div className="text-center py-8">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-amber-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              No Default Commission Set
            </h4>
            <p className="text-gray-600 mb-6">
              Add a default commission setting that will apply to all stores without specific overrides.
            </p>
            <button
              onClick={() => {
                setEditingItem(null);
                setFormData({
                  restaurantId: "",
                  storeType: "",
                  commissionType: "percentage",
                  commissionValue: "",
                  commissionBase: "subtotal",
                  isDefault: true,
                });
          SetshowDefaultForm(true)
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              Add Default Commission
            </button>
          </div>)  }
                      </div>
                    </div>
                  )}

                {/* Add New Commission Setting Button */}
                {/* {!showForm && (
                  <div className="flex justify-center">

              
                    <button
                      onClick={() =>{ 
                          setEditingItem({ isDefault: true });
                                setFormData({
                                  restaurantId: "",
                                  storeType: "",
                                  commissionType:    "Percentage",
                                  commissionValue: "25",
                                  commissionBase: "subtotal",
                                  isDefault: true,
                                });
                        
                        SetshowDefaultForm(true)}}
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <Plus className="h-5 w-5 mr-3" />
                      Add New Commission Setting
                    </button>
                  </div>
                )} */}

                {showDeleteModal && (
                  <div className="fixed inset-0 bgOp flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full mx-4">
                      <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-red-200">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          ⚠️ Delete Confirmation
                        </h3>
                      </div>
                      <div className="p-6 space-y-4">
                        <p className="text-gray-700">
                          Are you sure you want to delete this commission setting
                          for{" "}
                          {/* <span className="font-semibold">{deletingItem?.restaurantId?.name || 'this store'}</span>? */}
                          This action cannot be undone.
                        </p>

                        <div className="flex gap-4 pt-4">
                          <button
                            onClick={handleConfirmDelete}
                            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-all duration-200"
                          >
                            🗑️ Yes, Delete
                          </button>
                          <button
                            onClick={() => setShowDeleteModal(false)}
                            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-all duration-200"
                          >
                            ❌ Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add/Edit Commission Setting Form */}
                {showForm && (
                  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-2xl w-full mx-4 overflow-hidden">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-purple-200">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          🪟 {editingItem ? "Edit" : "Add"}{" "}
                          {formData.isDefault ? "Default" : "Restaurant"}{" "}
                          Commission
                        </h3>
                      </div>

                      {/* Body */}
                      <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Restaurant Selector (hidden if Default) */}
                          {!formData.isDefault && (
                            <div className="space-y-3">
                              <label className="block text-sm font-semibold text-gray-700">
                                Restaurant *
                              </label>
                              <select
                                value={formData.restaurantId}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    restaurantId: e.target.value,
                                  }))
                                }
                                className={
                                  "w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 border-gray-200 focus:border-purple-500 focus:ring-purple-100"
                                }
                              >
                                <option value="">🔍 Select Restaurant</option>
                                {restaurants.map((restaurant) => (
                                  <option
                                    key={restaurant._id}
                                    value={restaurant._id}
                                  >
                                    {restaurant.name}
                                  </option>
                                ))}
                              </select>
                              {errors.restaurantId && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    ⚠️ {errors.restaurantId}
                  </p>
                )}
                            </div>
                          )}

                          {/* Commission Type */}
                          <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-700">
                              Commission Type *
                            </label>
                            <div className="flex gap-6">
                              {["percentage", "fixed", "costPrice"].map((type) => (
                                <label
                                  key={type}
                                  className="flex items-center space-x-3 cursor-pointer group"
                                >
                                  <input
                                    type="radio"
                                    value={type}
                                    checked={formData.commissionType === type}
                                    onChange={(e) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        commissionType: e.target.value,
                                        // Clear commission value when switching to costPrice
                                        commissionValue: e.target.value === "costPrice" ? "" : prev.commissionValue,
                                      }))
                                    }
                                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                                  />
                                  <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                                    {type === "percentage"
                                      ? "Percentage"
                                      : type === "fixed"
                                      ? "Fixed"
                                      : "Cost Price"}
                                  </span>
                                </label>
                              ))}
                            </div>
                            {errors.commissionType && (
                              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                ⚠️ {errors.commissionType}
                              </p>
                            )}
                          </div>

                          {/* Commission Value */}
                          <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-700">
                              Commission Value {formData.commissionType !== "costPrice" && "*"}
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.commissionValue}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  commissionValue: e.target.value,
                                }))
                              }
                              disabled={formData.commissionType === "costPrice"}
                              placeholder={
                                formData.commissionType === "percentage"
                                  ? "e.g., 10"
                                  : formData.commissionType === "fixed"
                                  ? "e.g., 25"
                                  : "Not required for Cost Price"
                              }
                              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                                formData.commissionType === "costPrice"
                                  ? "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                                  : "border-gray-200 focus:border-purple-500 focus:ring-purple-100"
                              }`}
                            />
                            {formData.commissionType === "costPrice" && (
                              <p className="text-blue-600 text-sm mt-1 flex items-center gap-1">
                                ℹ️ Cost Price commission doesn't require a value
                              </p>
                            )}
                            {errors.commissionValue && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  ⚠️ {errors.commissionValue}
                </p>
              )}
                          </div>

                          {/* Commission Base */}
                          <div className="space-y-3 md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700">
                              Commission Base *
                            </label>
                            <div className="space-y-2">
                              {[
                                { value: "subtotal", label: "Subtotal" },
                                {
                                  value: "subtotal+tax",
                                  label: "Subtotal + Tax",
                                },
                                { value: "finalAmount", label: "Final Amount" },
                              ].map((opt) => (
                                <label
                                  key={opt.value}
                                  className="flex items-center space-x-3 cursor-pointer"
                                >
                                  <input
                                    type="radio"
                                    value={opt.value}
                                    checked={
                                      formData.commissionBase === opt.value
                                    }
                                    onChange={(e) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        commissionBase: e.target.value,
                                      }))
                                    }
                                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                                  />
                                  <span className="text-sm font-medium text-gray-700">
                                    {opt.label}
                                  </span>
                                </label>
                              ))}
                            </div>
                            {errors.commissionBase && (
                              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                ⚠️ {errors.commissionBase}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex gap-4 pt-6 border-t border-gray-200">
                          <button
                            onClick={handleSave}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                          >
                            💾{" "}
                            {editingItem
                              ? "Save Changes"
                              : formData.isDefault
                              ? "Save Default"
                              : "Save Setting"}
                          </button>
                          <button
                            onClick={handleCancel}
                            className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all duration-200"
                          >
                            ❌ Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {showDefaultForm && (
                  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-xl w-full mx-4 overflow-hidden">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-purple-200">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          ⚙️ {editingItem ? "Edit" : "Add"} Default Commission
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Configure the platform-wide default commission rules.
                        </p>
                      </div>

                      {/* Body */}
                      <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Commission Type */}
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                              Commission Type *
                            </label>
                            <div className="flex gap-6">
                              <label className="flex items-center space-x-2 cursor-pointer group">
                                <input
                                  type="radio"
                                  value="percentage"
                                  checked={
                                    formData.commissionType === "percentage"
                                  }
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      commissionType: e.target.value,
                                    }))
                                  }
                                  className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                                />
                                <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                                  % Percentage
                                </span>
                              </label>
                              <label className="flex items-center space-x-2 cursor-pointer group">
                                <input
                                  type="radio"
                                  value="fixed"
                                  checked={formData.commissionType === "fixed"}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      commissionType: e.target.value,
                                    }))
                                  }
                                  className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                                />
                                <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                                  💵 Fixed
                                </span>
                              </label>
                              <label className="flex items-center space-x-2 cursor-pointer group">
                                <input
                                  type="radio"
                                  value="costPrice"
                                  checked={formData.commissionType === "costPrice"}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      commissionType: e.target.value,
                                      // Clear commission value when switching to costPrice
                                      commissionValue: e.target.value === "costPrice" ? "" : prev.commissionValue,
                                    }))
                                  }
                                  className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                                />
                                <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                                  💰 Cost Price
                                </span>
                              </label>
                            </div>
                          </div>

                          {/* Commission Value */}
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                              Commission Value {formData.commissionType !== "costPrice" && "*"}
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.commissionValue}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  commissionValue: e.target.value,
                                }))
                              }
                              disabled={formData.commissionType === "costPrice"}
                              placeholder={
                                formData.commissionType === "percentage"
                                  ? "e.g., 10 (%)"
                                  : formData.commissionType === "fixed"
                                  ? "e.g., 25 ($)"
                                  : "Not required for Cost Price"
                              }
                              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                                formData.commissionType === "costPrice"
                                  ? "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                                  : "border-gray-200 focus:ring-purple-100 focus:border-purple-500"
                              }`}
                            />
                            {formData.commissionType === "costPrice" && (
                              <p className="text-blue-600 text-sm mt-1 flex items-center gap-1">
                                ℹ️ Cost Price commission doesn't require a value
                              </p>
                            )}
                          </div>

                          {/* Commission Base */}
                          <div className="space-y-2 md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700">
                              Commission Base *
                            </label>
                            <div className="flex flex-col gap-2">
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="radio"
                                  value="subtotal"
                                  checked={formData.commissionBase === "subtotal"}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      commissionBase: e.target.value,
                                    }))
                                  }
                                  className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                  🧾 Subtotal
                                </span>
                              </label>
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="radio"
                                  value="subtotal+tax"
                                  checked={
                                    formData.commissionBase === "subtotal+tax"
                                  }
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      commissionBase: e.target.value,
                                    }))
                                  }
                                  className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                  🧾 Subtotal + Tax
                                </span>
                              </label>
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="radio"
                                  value="finalAmount"
                                  checked={
                                    formData.commissionBase === "finalAmount"
                                  }
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      commissionBase: e.target.value,
                                    }))
                                  }
                                  className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                  ✅ Final Amount
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-6 border-t border-gray-200">
                          <button
                            onClick={handleSave}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                          >
                            💾 {editingItem ? "Save Setting" : "Save Default"}
                          </button>
                          <button
                            onClick={handleDefaultFormHandle}
                            className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all duration-200"
                          >
                            ❌ Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Store-Specific Commission Overrides */}
                {(viewMode === "all" || viewMode === "store-specific") && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-200">
                      <h3 className="flex items-center gap-3 text-lg font-bold text-gray-900">
                        <BarChart3 className="w-5 h-5 text-green-600" />
                        📄 Store-Specific Commission Overrides
                      </h3>
                    </div>
                    <div className="p-6">
                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                          <span className="ml-3 text-gray-600">
                            Loading store settings...
                          </span>
                        </div>
                      ) : error ? (
                        <div className="text-center py-8">
                          <div className="text-red-600 mb-2">⚠️ {error}</div>
                          <button
                            onClick={loadCommissionSettings}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            Retry
                          </button>
                        </div>
                      ) : storeSettings.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="text-gray-500 mb-4">
                            No store-specific settings found
                          </div>
                          <button
                            onClick={() => setShowForm(true)}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            ➕ Add Store-Specific Setting
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="overflow-x-auto">
                            <table className="w-full border-2 border-gray-300">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border border-gray-300">
                                    Restaurant
                                  </th>
                                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border border-gray-300">
                                    Store Type
                                  </th>
                                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border border-gray-300">
                                    Type
                                  </th>
                                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border border-gray-300">
                                    Value
                                  </th>
                                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border border-gray-300">
                                    Base
                                  </th>
                                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border border-gray-300">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white">
                                {storeSettings.map((setting) => {
                                  // Format values for display (but keep original data intact)
                                  const displayValue =
                                    setting.commissionType === "percentage"
                                      ? `${setting.commissionValue}%`
                                      : setting.commissionType === "fixed"
                                      ? `₹${setting.commissionValue}`
                                      : "Cost Price";

                                  const displayBase =
                                    setting.commissionBase
                                      .charAt(0)
                                      .toUpperCase() +
                                    setting.commissionBase.slice(1);

                                  const restaurantName = setting.restaurantId
                                    ? setting.restaurantId.name
                                    : "Unknown Restaurant";

                                  const storeType = setting.storeType
                                    ? setting.storeType.charAt(0).toUpperCase() +
                                      setting.storeType.slice(1)
                                    : "Restaurant";

                                  return (
                                    <tr key={setting._id}>
                                      <td className="px-6 py-4 text-sm text-gray-900 border border-gray-300">
                                        {restaurantName}
                                      </td>
                                      <td className="px-6 py-4 text-sm text-gray-900 border border-gray-300">
                                        {storeType}
                                      </td>
                                      <td className="px-6 py-4 text-sm text-gray-900 capitalize border border-gray-300">
                                        {setting.commissionType}
                                      </td>
                                      <td className="px-6 py-4 text-sm text-gray-900 border border-gray-300">
                                        {displayValue}
                                      </td>
                                      <td className="px-6 py-4 text-sm text-gray-900 border border-gray-300">
                                        {displayBase}
                                      </td>
                                      <td className="px-6 py-4 text-sm text-gray-900 border border-gray-300">
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => handleEdit(setting)}
                                            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
                                          >
                                            ✏️ Edit
                                          </button>
                                          <button
                                            onClick={() => {
                                              setDeletingItem(setting);
                                              setShowDeleteModal(true);
                                            }}
                                            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-lg text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                                          >
                                            🗑️ Delete
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          <div className="mt-6">
                            <button
                              onClick={() => setShowForm(true)}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
                            >
                              ➕ Add Store-Specific Setting
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Commission Details Tab */}
            {activeTab === "details" && (
              <div className="p-8 space-y-8">
                {/* Setup Details & Filters */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-200">
                    <h3 className="text-lg font-bold text-gray-900">
                      Setup Details
                    </h3>
                  </div>
                  <div className="p-6">
                    {/* Selected Merchant Indicator */}
                    {selectedMerchant !== "All Merchants" && (
                      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-semibold text-blue-700">
                              📊 Showing details for:{" "}
                              <span className="text-blue-900 font-bold">
                                {selectedMerchant}
                              </span>
                            </span>
                          </div>
                          <div className="text-sm text-blue-600">
                            {filteredData?.length || 0} records found
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                      {/* Merchant Filter */}
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">
                          Merchant
                        </label>
                        <select
                          value={selectedMerchant}
                          onChange={handleMerchantChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                        >
                          <option value="All Merchants">All Merchants</option>
                          {restaurants.map((restaurant) => (
                            <option key={restaurant._id} value={restaurant.name}>
                              {restaurant.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Date From */}
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">
                          Date From
                        </label>
                        <input
                          type="date"
                          value={
                            dateFrom ? dateFrom.toISOString().split("T")[0] : ""
                          }
                          onChange={handleDateFromChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                        />
                      </div>

                      {/* Date To */}
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">
                          Date To
                        </label>
                        <input
                          type="date"
                          value={dateTo ? dateTo.toISOString().split("T")[0] : ""}
                          onChange={handleDateToChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                        />
                      </div>

                      {/* Search */}
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">
                          Search
                        </label>
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Order ID, Store, Merchant..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
                        <Filter className="h-4 w-4 mr-2" />
                        Apply Filters
                      </button>
                      {(selectedMerchant !== "All Merchants" ||
                        dateFrom ||
                        dateTo ||
                        searchTerm) && (
                        <button
                          onClick={handleClearFilters}
                          className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-xl text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Clear Filters
                        </button>
                      )}
                      <button
                        onClick={handleExportExcel}
                        disabled={exportLoading}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {exportLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            Exporting...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Export Excel
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-green-600">
                          {formatCurrency(totalPayableToMerchants)}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {selectedMerchant === "All Merchants"
                            ? "Total Payable amount to Merchant"
                            : `${selectedMerchant} Payable amount to Merchant`}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-blue-600">
                          {formatCurrency(totalPayableToAdmin)}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {selectedMerchant === "All Merchants"
                            ? "Total Payable amount to Admin"
                            : `${selectedMerchant} Payable amount to Admin`}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-purple-600">
                          {filteredData?.length || 0}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {selectedMerchant === "All Merchants"
                            ? "Total Orders"
                            : `${selectedMerchant} Orders`}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Commission Details Table */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-purple-200">
                    <h3 className="text-lg font-bold text-gray-900">
                      Commission Details
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Showing {filteredData.length} of {commissionData.length}{" "}
                      records
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                              Order ID
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                              Restaurant
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                              Cart Total
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                              Total Amount
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                              Payable amount to Merchant
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                              Payable amount to Admin
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {filteredData.map((item) => (
                            <tr
                              key={item.orderId}
                              className="hover:bg-purple-50/50 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                {item.orderId}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.restaurantId?.name ||
                                  item.storeName ||
                                  "Unknown"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(item.cartTotal)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                                {formatCurrency(item.totalOrderAmount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right font-semibold">
                                {formatCurrency(item.payableToMerchant)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 text-right font-semibold">
                                {formatCurrency(item.payableToAdmin)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(item.payoutStatus)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(item.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
                                  <Eye className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  export default CombinedCommissionPanel;
