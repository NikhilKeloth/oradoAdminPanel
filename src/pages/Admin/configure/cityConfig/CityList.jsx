import { useState, useEffect } from "react";
import { FiPlus, FiMoreVertical } from "react-icons/fi";
import CityModal from "./CityModal";
import {
  createCity,
  deleteCity,
  getCities,
  toggleCityStatus,
  updateCity,
} from "../../../../apis/adminApis/cityApi";
import { getGeofences } from "../../../../apis/adminApis/geoFenceApi";
import { toast } from "react-toastify";

const CityList = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddCityModal, setShowAddCityModal] = useState(false);
  const [geofences, setGeofences] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [editingCity, setEditingCity] = useState(null);
  // Fetch cities on component mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const data = await getCities(); 
        setCities(data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch cities");
        setLoading(false);
      }
    };

    const fetchGeofences = async () => {
      try {
        const { data } = await getGeofences();
        setGeofences(data);
      } catch (error) {
        console.error("Failed to fetch geofences", error);
      }
    };

    fetchGeofences();
    fetchCities();
  }, []);

  const handleAddCity = async (newCity) => {
    try {
      // Map the form data to match the backend API structure
      const cityData = {
        name: newCity.name,
        description: newCity.description,
        geofences: newCity.assigningGeofences,
        isNormalOrderActive: newCity.is_normal_order_active,
        normalOrderChargeCalculation: newCity.normal_order_charge_calculation,
        normalOrdersChargeType: newCity.normal_orders_charge_type,
        fixedDeliveryChargesNormalOrders:
          newCity.normal_orders_fixed_charges || 0,
        dynamicChargesTemplateNormalOrders:
          newCity.dynamic_charges_template_normal_orders,
        dynamicChargesTemplateScheduleOrder:
          newCity.dynamic_charges_template_schedule_order,
        earningTemplateNormalOrder: newCity.earning_template_normal_order,
        isCustomOrderActive: newCity.is_custom_order_active,
        customOrderChargeCalculation: newCity.custom_order_charge_calculation,
        cityChargeType: newCity.city_charge_type,
        fixedDeliveryChargesCustomOrders: newCity.fixed_delivery_charges || 0,
        status: newCity.status,
      };

      console.log("Sending city data:", cityData);
      const createdCity = await createCity(cityData);
      setCities([...cities, createdCity.data]);
      setShowAddCityModal(false);
      toast.success("City created successfully!");
    } catch (err) {
      console.error("Failed to create city:", err);
      setError(err.response?.data?.message || "Failed to create city");
      toast.error(err.response?.data?.message || "Failed to create city");
    }
  };

const handleSave = async (formData) => {
  try {
    const cityData = {
      name: formData.name,
      description: formData.description,
      geofences: formData.assigningGeofences,
      isNormalOrderActive: formData.is_normal_order_active,
      normalOrderChargeCalculation: formData.normal_order_charge_calculation,
      normalOrdersChargeType: formData.normal_orders_charge_type,
      fixedDeliveryChargesNormalOrders: formData.normal_orders_fixed_charges || 0,
      dynamicChargesTemplateNormalOrders: formData.dynamic_charges_template_normal_orders,
      dynamicChargesTemplateScheduleOrder: formData.dynamic_charges_template_schedule_order,
      earningTemplateNormalOrder: formData.earning_template_normal_order,
      isCustomOrderActive: formData.is_custom_order_active,
      customOrderChargeCalculation: formData.custom_order_charge_calculation,
      cityChargeType: formData.city_charge_type,
      fixedDeliveryChargesCustomOrders: formData.fixed_delivery_charges || 0,
      status: formData.status
    };

    // Clean empty string ObjectId fields
    ["dynamicChargesTemplateNormalOrders", "dynamicChargesTemplateScheduleOrder", "earningTemplateNormalOrder"].forEach(field => {
      if (cityData[field] === "") cityData[field] = null;
    });

    if (editingCity) {
      const updatedCity = await updateCity(editingCity._id, cityData);
      setCities(cities.map(c => c._id === editingCity._id ? updatedCity.data : c));
    } else {
      console.log(cityData);
      const createdCity = await createCity(cityData);
      setCities([...cities, createdCity.data]);
    }

    setShowAddCityModal(false);
    setEditingCity(null);
    toast.success(`City ${editingCity ? 'updated' : 'created'} successfully!`);
  } catch (err) {
    console.error(`Failed to ${editingCity ? 'update' : 'create'} city:`, err);
    toast.error(err.response?.data?.message || `Failed to ${editingCity ? 'update' : 'create'} city`);
  }
};

  const toggleStatus = async (id) => {
    try {
      // Optimistically update the UI
      setCities(
        cities.map((city) =>
          city._id === id ? { ...city, status: !city.status } : city
        )
      );

      // Make the API call to update status in the backend
      await toggleCityStatus(id);
      toast.success("City status updated successfully!");
    } catch (error) {
      // Revert the UI if the API call fails
      setCities(
        cities.map(
          (city) => (city._id === id ? { ...city, status: !city.status } : city) // Toggle back to previous state
        )
      );

      console.error("Failed to update city status:", error);
      // You might want to show an error notification to the user here
    }
  };
  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const handleEdit = (city) => {
    // TODO: Implement edit functionality
    console.log("Edit city:", city);
    setEditingCity(city)
    setActiveDropdown(null);
    setShowAddCityModal(true);
  };

  const handleDelete = async (cityId) => {
    try {
      // Show confirmation dialog before deleting
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this city?"
      );
      if (!confirmDelete) {
        setActiveDropdown(null);
        return;
      }

      // Optimistically remove the city from UI
      setCities(cities.filter((city) => city._id !== cityId));
      setActiveDropdown(null);

      // Make API call to delete city
      await deleteCity(cityId);

      // Show success notification
      toast.success("City deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      // Revert UI if deletion fails
      setCities(cities); // Reset to original cities list
      console.error("Failed to delete city:", error);

      // Show error notification
      toast.error(error.response?.data?.message || "Failed to delete city", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (activeDropdown) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [activeDropdown]);

  if (loading) {
    return <div className="p-6">Loading cities...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      {/* Header and Description */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="mb-4 md:mb-0 md:w-3/4">
          <p className="text-gray-700">
            A city consists of multiple geofences assigned. You can define
            delivery charges to be applied to custom order placed in this city.
            <br />
            Delivery charges can be of 2 types:
            <br />
            1. Static
            <br />
            2. Dynamic - Defined in the template defined on TOOKAN.
          </p>
        </div>
        <button
          onClick={() => setShowAddCityModal(true)}
          className="bg-[#FC8019] hover:bg-[#e67317] text-white px-4 py-2 rounded-md flex items-center"
        >
          <FiPlus className="mr-2" />
          Add City
        </button>
      </div>

      {/* Cities Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4"
                >
                  Charge Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cities.map((city) => (
                <tr key={city._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {city.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {city.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {city.chargeType}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={city.status}
                        onChange={() => toggleStatus(city._id)}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FC8019]"></div>
                    </label>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDropdown(city._id);
                        }}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                      >
                        <FiMoreVertical />
                      </button>

                      {/* Dropdown menu */}
                      {activeDropdown === city._id && (
                        <div className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(city);
                            }}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(city._id);
                            }}
                            className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add City Modal */}
    {showAddCityModal && (
  <CityModal
    onClose={() => {
      setShowAddCityModal(false);
      setEditingCity(null);
    }}
    onSave={handleSave}
    geofences={geofences}
    mode={editingCity ? 'edit' : 'add'}
    initialData={editingCity}
  />
)}
    </div>
  );
};

export default CityList;
