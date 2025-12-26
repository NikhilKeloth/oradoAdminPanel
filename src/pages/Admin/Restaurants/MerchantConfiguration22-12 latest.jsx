import { useEffect, useState } from "react";
import {
  FiChevronDown,
  FiTrash2,
  FiPlus,
  FiSave,
  FiX,
  FiChevronLeft,
  FiCalendar,
  FiClock,
  FiShoppingBag,
  FiBell,
  FiDollarSign,
  FiPackage,
  FiTag,
  FiFilter,
  FiTruck,
  FiSettings,
  FiAlertCircle,
} from "react-icons/fi";
import { Link, useParams, useLocation } from "react-router-dom";
import { fetchSingleRestaurantDetails } from "../../../apis/adminApis/adminFuntionsApi";
import StoreHours from "./StoreHours";
import { 
  getOpeningHours, 
  updateOpeningHours,
  getBusinessHours,
  updateBusinessHours 
} from "../../../apis/adminApis/restaurantApi";

const MerchantConfiguration = () => {
  const { id } = useParams();
  const location = useLocation();

  // Tab state
  const [activeTab, setActiveTab] = useState("store-hours");

  // Store Hours State - Detailed day-by-day hours
  const [storeHoursData, setStoreHoursData] = useState([]);

  // Business Hours State - High-level availability
  const [businessHours, setBusinessHours] = useState({
    dateAvailability: "everyday",
    specificDays: [],
    specificDates: [],
    timeAvailability: "openAllDay",
    specificTimeSlots: [{ start: "", end: "", maxOrders: "" }],
    dateInput: ""
  });

  // All other configuration states
  const [acceptRejectOrder, setAcceptRejectOrder] = useState(false);
  const [orderAcceptanceTime, setOrderAcceptanceTime] = useState("");
  const [merchantLoyalty, setMerchantLoyalty] = useState(false);
  const [showMerchantTiming, setShowMerchantTiming] = useState(false);
  const [vegNonvegStatus, setVegNonvegStatus] = useState(false);
  const [businessCategories, setBusinessCategories] = useState(false);
  const [preparationTime, setPreparationTime] = useState("");
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [dashboardOnlyOrder, setDashboardOnlyOrder] = useState(false);
  const [multipleProducts, setMultipleProducts] = useState(false);
  const [productMultiselection, setProductMultiselection] = useState(false);
  const [surgeOnDelivery, setSurgeOnDelivery] = useState(false);
  const [merchantReminder, setMerchantReminder] = useState("");
  const [customerReminder, setCustomerReminder] = useState("");
  const [taxInclusivePricing, setTaxInclusivePricing] = useState(false);
  const [applyBuffer, setApplyBuffer] = useState(false);
  const [bufferTime, setBufferTime] = useState("");
  const [timeRangeForScheduled, setTimeRangeForScheduled] = useState(false);
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [maxOrderPerSlot, setMaxOrderPerSlot] = useState("");
  const [tookanTasks, setTookanTasks] = useState("pickupDelivery");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [criticalAlerts, setCriticalAlerts] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");
  const [deliveryManager, setDeliveryManager] = useState("default");
  const [businessModel, setBusinessModel] = useState("product");
  const [loadingBusinessHours, setLoadingBusinessHours] = useState(false);
  const [savingBusinessHours, setSavingBusinessHours] = useState(false);
  const [businessHoursError, setBusinessHoursError] = useState(null);

  // Checkout Template state
  const [checkoutFields, setCheckoutFields] = useState([
    { fieldName: "", fieldType: "", value: "", mandatory: false },
  ]);

  const addCheckoutField = () => {
    setCheckoutFields([...checkoutFields, { fieldName: "", fieldType: "", value: "", mandatory: false }]);
  };

  const updateCheckoutField = (index, key, value) => {
    const updated = [...checkoutFields];
    updated[index][key] = value;
    setCheckoutFields(updated);
  };

  const removeCheckoutField = (index) => {
    if (checkoutFields.length > 1) {
      setCheckoutFields(checkoutFields.filter((_, i) => i !== index));
    }
  };

  // Days of week for selection
  const daysOfWeek = [
    { id: 'monday', label: 'Monday', short: 'Mon', code: 'mon' },
    { id: 'tuesday', label: 'Tuesday', short: 'Tue', code: 'tue' },
    { id: 'wednesday', label: 'Wednesday', short: 'Wed', code: 'wed' },
    { id: 'thursday', label: 'Thursday', short: 'Thu', code: 'thu' },
    { id: 'friday', label: 'Friday', short: 'Fri', code: 'fri' },
    { id: 'saturday', label: 'Saturday', short: 'Sat', code: 'sat' },
    { id: 'sunday', label: 'Sunday', short: 'Sun', code: 'sun' }
  ];

  // Handle business hours updates
  const handleDateAvailabilityChange = (value) => {
    setBusinessHours(prev => ({
      ...prev,
      dateAvailability: value,
      specificDays: value === "specificDays" ? prev.specificDays : [],
      specificDates: value === "specificDates" ? prev.specificDates : []
    }));
  };

  const handleDaySelection = (dayId) => {
    setBusinessHours(prev => {
      const newSpecificDays = prev.specificDays.includes(dayId)
        ? prev.specificDays.filter(d => d !== dayId)
        : [...prev.specificDays, dayId];
      
      return { ...prev, specificDays: newSpecificDays };
    });
  };

  const handleTimeAvailabilityChange = (value) => {
    setBusinessHours(prev => ({
      ...prev,
      timeAvailability: value,
      specificTimeSlots: value === "specificTime" ? prev.specificTimeSlots : [{ start: "", end: "", maxOrders: "" }]
    }));
  };

  const handleAddTimeSlot = () => {
    setBusinessHours(prev => ({
      ...prev,
      specificTimeSlots: [...prev.specificTimeSlots, { start: "", end: "", maxOrders: "" }]
    }));
  };

  const handleRemoveTimeSlot = (index) => {
    setBusinessHours(prev => ({
      ...prev,
      specificTimeSlots: prev.specificTimeSlots.filter((_, i) => i !== index)
    }));
  };

  const handleTimeSlotChange = (index, field, value) => {
    setBusinessHours(prev => {
      const newSlots = [...prev.specificTimeSlots];
      newSlots[index][field] = value;
      return { ...prev, specificTimeSlots: newSlots };
    });
  };

  const handleDateInputChange = (value) => {
    setBusinessHours(prev => ({ ...prev, dateInput: value }));
  };

  const handleAddDate = () => {
    if (businessHours.dateInput && !businessHours.specificDates.includes(businessHours.dateInput)) {
      setBusinessHours(prev => ({
        ...prev,
        specificDates: [...prev.specificDates, prev.dateInput],
        dateInput: ""
      }));
    }
  };

  const handleRemoveDate = (dateToRemove) => {
    setBusinessHours(prev => ({
      ...prev,
      specificDates: prev.specificDates.filter(date => date !== dateToRemove)
    }));
  };

  // Format business hours for API
  // const formatBusinessHoursForAPI = () => {
  //   const { dateAvailability, timeAvailability, specificDays, specificDates, specificTimeSlots } = businessHours;
    
  //   let formattedData = {
  //     dateAvailability,
  //     timeAvailability,
  //     specificDays: dateAvailability === "specificDays" ? specificDays : [],
  //     specificDates: dateAvailability === "specificDates" ? specificDates : [],
  //     specificTimeSlots: timeAvailability === "specificTime" ? specificTimeSlots : []
  //   };

  //   // Convert to day-based format for validation
  //   const dayBasedHours = {};
    
  //   if (dateAvailability === "everyday" || dateAvailability === "specificDays") {
  //     const daysToApply = dateAvailability === "everyday" 
  //       ? daysOfWeek.map(day => day.code)
  //       : specificDays.map(dayId => {
  //           const day = daysOfWeek.find(d => d.id === dayId);
  //           return day?.code;
  //         }).filter(Boolean);

  //     daysToApply.forEach(dayCode => {
  //       if (timeAvailability === "openAllDay") {
  //         dayBasedHours[dayCode] = "00:00-23:59";
  //       } else if (timeAvailability === "closedAllDay") {
  //         dayBasedHours[dayCode] = "closed";
  //       } else if (timeAvailability === "specificTime") {
  //         // Combine all time slots
  //         const timeRanges = specificTimeSlots
  //           .filter(slot => slot.start && slot.end)
  //           .map(slot => `${slot.start}-${slot.end}`)
  //           .join(',');
          
  //         if (timeRanges) {
  //           dayBasedHours[dayCode] = timeRanges;
  //         }
  //       }
  //     });
  //   }

  //   // For specific dates, we need a different structure
  //   if (dateAvailability === "specificDates" && specificDates.length > 0) {
  //     formattedData.dateBasedHours = {};
  //     specificDates.forEach(date => {
  //       if (timeAvailability === "openAllDay") {
  //         formattedData.dateBasedHours[date] = "00:00-23:59";
  //       } else if (timeAvailability === "closedAllDay") {
  //         formattedData.dateBasedHours[date] = "closed";
  //       } else if (timeAvailability === "specificTime") {
  //         const timeRanges = specificTimeSlots
  //           .filter(slot => slot.start && slot.end)
  //           .map(slot => `${slot.start}-${slot.end}`)
  //           .join(',');
          
  //         if (timeRanges) {
  //           formattedData.dateBasedHours[date] = timeRanges;
  //         }
  //       }
  //     });
  //   }

  //   return {
  //     ...formattedData,
  //     dayBasedHours: Object.keys(dayBasedHours).length > 0 ? dayBasedHours : undefined
  //   };
  // };

  // Format business hours for API
const formatBusinessHoursForAPI = () => {
  const { dateAvailability, timeAvailability, specificDays, specificDates, specificTimeSlots } = businessHours;
  
  let formattedData = {
    dateAvailability,
    timeAvailability,
    specificDays: dateAvailability === "specificDays" ? specificDays : [],
    specificDates: dateAvailability === "specificDates" ? specificDates : [],
    specificTimeSlots: [] // Will fill this properly below
  };

  // Filter valid time slots (must have start and end)
  const validTimeSlots = specificTimeSlots.filter(slot => slot.start && slot.end);

  // Always include the full structured slots if there are any valid ones
  if (validTimeSlots.length > 0) {
    formattedData.specificTimeSlots = validTimeSlots.map(slot => ({
      start: slot.start,
      end: slot.end,
      maxOrders: slot.maxOrders ? parseInt(slot.maxOrders) || null : null // Send as number or null
    }));
  }

  // Convert to day-based format for backward compatibility / string-based validation
  const dayBasedHours = {};
  
  if (dateAvailability === "everyday" || dateAvailability === "specificDays") {
    const daysToApply = dateAvailability === "everyday" 
      ? daysOfWeek.map(day => day.code)
      : specificDays.map(dayId => {
          const day = daysOfWeek.find(d => d.id === dayId);
          return day?.code;
        }).filter(Boolean);

    daysToApply.forEach(dayCode => {
      if (timeAvailability === "openAllDay") {
        dayBasedHours[dayCode] = "00:00-23:59";
      } else if (timeAvailability === "closedAllDay") {
        dayBasedHours[dayCode] = "closed";
      } else if (timeAvailability === "specificTime") {
        if (validTimeSlots.length > 0) {
          // Format: 09:00-12:00:50,14:00-18:00:30
          const timeRangesWithMax = validTimeSlots
            .map(slot => {
              const max = slot.maxOrders ? `:${slot.maxOrders}` : "";
              return `${slot.start}-${slot.end}${max}`;
            })
            .join(',');
          
          dayBasedHours[dayCode] = timeRangesWithMax;
        }
      }
    });
  }

  // For specific dates
  if (dateAvailability === "specificDates" && specificDates.length > 0) {
    formattedData.dateBasedHours = {};
    specificDates.forEach(date => {
      if (timeAvailability === "openAllDay") {
        formattedData.dateBasedHours[date] = "00:00-23:59";
      } else if (timeAvailability === "closedAllDay") {
        formattedData.dateBasedHours[date] = "closed";
      } else if (timeAvailability === "specificTime") {
        if (validTimeSlots.length > 0) {
          const timeRangesWithMax = validTimeSlots
            .map(slot => {
              const max = slot.maxOrders ? `:${slot.maxOrders}` : "";
              return `${slot.start}-${slot.end}${max}`;
            })
            .join(',');
          
          formattedData.dateBasedHours[date] = timeRangesWithMax;
        }
      }
    });
  }

  return {
    ...formattedData,
    dayBasedHours: Object.keys(dayBasedHours).length > 0 ? dayBasedHours : undefined
  };
};

  // Parse business hours from API response
  // const parseBusinessHoursFromAPI = (apiData) => {
  //   if (!apiData || !apiData.businessHours) {
  //     return businessHours; // Return default
  //   }

  //   const bh = apiData.businessHours;
  //   const parsed = {
  //     dateAvailability: bh.dateAvailability || "everyday",
  //     specificDays: bh.specificDays || [],
  //     specificDates: bh.specificDates || [],
  //     timeAvailability: bh.timeAvailability || "openAllDay",
  //     specificTimeSlots: bh.specificTimeSlots?.length > 0 
  //       ? bh.specificTimeSlots 
  //       : [{ start: "", end: "", maxOrders: "" }],
  //     dateInput: ""
  //   };

  //   // If we have dayBasedHours, convert to our format
  //   if (bh.dayBasedHours && Object.keys(bh.dayBasedHours).length > 0) {
  //     const dayCodes = Object.keys(bh.dayBasedHours);
  //     const firstTimeSlot = bh.dayBasedHours[dayCodes[0]];
      
  //     if (firstTimeSlot === "00:00-23:59") {
  //       parsed.timeAvailability = "openAllDay";
  //     } else if (firstTimeSlot === "closed") {
  //       parsed.timeAvailability = "closedAllDay";
  //     } else {
  //       parsed.timeAvailability = "specificTime";
  //       // Parse time slots
  //       const timeRanges = firstTimeSlot.split(',');
  //       parsed.specificTimeSlots = timeRanges.map(range => {
  //         const [start, end] = range.split('-');
  //         return { start, end, maxOrders: "" };
  //       });
  //     }
  //   }

  //   return parsed;
  // };

  // Parse business hours from API response - FIXED
const parseBusinessHoursFromAPI = (apiData) => {
  if (!apiData || !apiData.businessHours) {
    return {
      dateAvailability: "everyday",
      specificDays: [],
      specificDates: [],
      timeAvailability: "openAllDay",
      specificTimeSlots: [{ start: "", end: "", maxOrders: "" }],
      dateInput: ""
    };
  }

  const bh = apiData.businessHours;

  const parsed = {
    dateAvailability: bh.dateAvailability || "everyday",
    specificDays: bh.specificDays || [],
    specificDates: bh.specificDates || [],
    timeAvailability: bh.timeAvailability || "openAllDay",
    specificTimeSlots: [{ start: "", end: "", maxOrders: "" }],
    dateInput: ""
  };

  // PRIORITY 1: Use structured specificTimeSlots if available
  if (bh.specificTimeSlots && Array.isArray(bh.specificTimeSlots) && bh.specificTimeSlots.length > 0) {
    parsed.timeAvailability = "specificTime";
    parsed.specificTimeSlots = bh.specificTimeSlots.map(slot => ({
      start: slot.start || "",
      end: slot.end || "",
      maxOrders: slot.maxOrders != null ? String(slot.maxOrders) : ""
    }));
    return parsed;
  }

  // PRIORITY 2: Fallback to parsing dayBasedHours string format
  if (bh.dayBasedHours && Object.keys(bh.dayBasedHours).length > 0) {
    const firstDayValue = Object.values(bh.dayBasedHours)[0];

    if (firstDayValue === "00:00-23:59") {
      parsed.timeAvailability = "openAllDay";
    } else if (firstDayValue === "closed") {
      parsed.timeAvailability = "closedAllDay";
    } else if (typeof firstDayValue === "string" && firstDayValue.includes("-")) {
      parsed.timeAvailability = "specificTime";
      const timeRanges = firstDayValue.split(',');
      parsed.specificTimeSlots = timeRanges.map(range => {
        const parts = range.trim().split(':');
        const [start, end] = parts[0].split('-');
        const maxOrders = parts[1] || "";
        return { start, end, maxOrders };
      });
    }
  }

  // If nothing matched, ensure at least one empty slot for "specificTime"
  if (parsed.timeAvailability === "specificTime" && parsed.specificTimeSlots.every(s => !s.start && !s.end)) {
    parsed.specificTimeSlots = [{ start: "", end: "", maxOrders: "" }];
  }

  return parsed;
};

  // Get current availability status text
  const getAvailabilityStatus = () => {
    const { dateAvailability, timeAvailability, specificDays } = businessHours;
    
    if (dateAvailability === "everyday") {
      if (timeAvailability === "openAllDay") return "Open 24/7 every day";
      if (timeAvailability === "closedAllDay") return "Closed every day";
      return "Open at specific times every day";
    }
    
    if (dateAvailability === "specificDays") {
      if (specificDays.length === 0) return "No days selected";
      
      const dayNames = specificDays.map(d => daysOfWeek.find(day => day.id === d)?.short).join(", ");
      
      if (timeAvailability === "openAllDay") return `Open 24/7 on ${dayNames}`;
      if (timeAvailability === "closedAllDay") return `Closed on ${dayNames}`;
      return `Open at specific times on ${dayNames}`;
    }
    
    if (dateAvailability === "specificDates") {
      if (businessHours.specificDates.length === 0) return "No dates selected";
      
      if (timeAvailability === "openAllDay") return `Open 24/7 on selected dates`;
      if (timeAvailability === "closedAllDay") return `Closed on selected dates`;
      return `Open at specific times on selected dates`;
    }
    
    return "Not configured";
  };

  // Save business hours to API
  const handleSaveBusinessHours = async () => {
    try {
      setSavingBusinessHours(true);
      setBusinessHoursError(null);
      
      const formattedData = formatBusinessHoursForAPI();
      
      const response = await updateBusinessHours(id, formattedData);
      
      if (response.success) {
        alert('Business hours saved successfully!');
        // Refresh business hours data
        fetchBusinessHoursData();
      } else {
        setBusinessHoursError(response.message || "Failed to save business hours");
      }
    } catch (error) {
      console.error('Error saving business hours:', error);
      
      // Check if it's a validation error from the API
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.join('\n');
        setBusinessHoursError(errorMessages);
      } else {
        setBusinessHoursError(error.message || 'Failed to save business hours. Please try again.');
      }
    } finally {
      setSavingBusinessHours(false);
    }
  };

  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch opening hours
  useEffect(() => {
    const fetchOpeningHours = async () => {
      try {
        const response = await getOpeningHours(id);
        setStoreHoursData(response.data.data);
      } catch (error) {
        console.error("Error fetching opening hours:", error);
      }
    };
    fetchOpeningHours();
  }, [id]);

  // Fetch business hours
  const fetchBusinessHoursData = async () => {
    try {
      setLoadingBusinessHours(true);
      const response = await getBusinessHours(id);
      
      if (response.success) {
        const parsedHours = parseBusinessHoursFromAPI(response.data);
        setBusinessHours(parsedHours);
      }
    } catch (error) {
      console.error("Error fetching business hours:", error);
    } finally {
      setLoadingBusinessHours(false);
    }
  };

  useEffect(() => {
    if (activeTab === "business-hours") {
      fetchBusinessHoursData();
    }
  }, [activeTab, id]);

  const handleSaveStoreHours = async (updatedHours) => {
    try {
      const response = await updateOpeningHours(id, updatedHours);
      setStoreHoursData(updatedHours);
      alert('Store hours saved successfully!');
      
      // If business hours tab is active, refresh business hours too
      if (activeTab === "business-hours") {
        fetchBusinessHoursData();
      }
    } catch (error) {
      alert('Failed to save store hours');
    }
  };

  // Fetch merchant details
  useEffect(() => {
    const getMerchantDetails = async () => {
      try {
        const data = await fetchSingleRestaurantDetails(id);
        setMerchant(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch merchant details.");
        setLoading(false);
      }
    };
    if (id) {
      getMerchantDetails();
    }
  }, [id]);

  // Reusable Components with pink theme
  // const Section = ({ title, children, collapsible = true, defaultOpen = true }) => {
  //   const [isOpen, setIsOpen] = useState(defaultOpen);

  //   return (
  //     <div className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden border border-pink-100">
  //       <div
  //         className={`flex justify-between items-center px-4 py-3 ${collapsible ? "cursor-pointer hover:bg-pink-50" : ""} border-b bg-pink-50`}
  //         onClick={() => collapsible && setIsOpen(!isOpen)}
  //       >
  //         <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
  //         {collapsible && (
  //           <FiChevronDown className={`h-4 w-4 text-pink-600 ${isOpen ? "rotate-180" : ""}`} />
  //         )}
  //       </div>
  //       {isOpen && (
  //         <div className="p-4 bg-white">
  //           {children}
  //         </div>
  //       )}
  //     </div>
  //   );
  // };
//   const Section = ({ title, children, collapsible = true, defaultOpen = true }) => {
//   const [isOpen, setIsOpen] = useState(defaultOpen);

//   const handleToggle = (e) => {
//     // Only toggle when clicking directly on the header (not children)
//     e.stopPropagation();
//     if (collapsible) setIsOpen(!isOpen);
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden border border-pink-100">
//       <div
//         className={`flex justify-between items-center px-4 py-3 ${collapsible ? "cursor-pointer hover:bg-pink-50" : ""} border-b bg-pink-50`}
//         onClick={handleToggle} // Only header toggles
//       >
//         <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
//         {collapsible && (
//           <FiChevronDown className={`h-4 w-4 text-pink-600 transition-transform ${isOpen ? "rotate-180" : ""}`} />
//         )}
//       </div>
//       {isOpen && (
//         <div className="p-4 bg-white">
//           {children}
//         </div>
//       )}
//     </div>
//   );
// };

const Section = ({ title, children, collapsible = true, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleHeaderClick = (e) => {
    e.stopPropagation();
    if (collapsible) setIsOpen(prev => !prev);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden border border-pink-100">
      <div
        className={`flex justify-between items-center px-4 py-3 select-none ${
          collapsible ? "cursor-pointer hover:bg-pink-50" : ""
        } border-b bg-pink-50`}
        onClick={handleHeaderClick}
      >
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {collapsible && (
          <FiChevronDown
            className={`h-4 w-4 text-pink-600 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </div>
      {isOpen && (
        <div
          className="p-4 bg-white"
          onClick={(e) => e.stopPropagation()} // Critical: stops bubbling from inputs
        >
          {children}
        </div>
      )}
    </div>
  );
};
  const Toggle = ({ checked, onChange, label, description, inline = false }) => (
    <div className={`mb-3 ${inline ? "flex items-center justify-between" : ""}`}>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-9 h-5 bg-pink-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-600"></div>
      </label>
    </div>
  );

  const InputField = ({ label, value, onChange, type = "text", placeholder, description, suffix, prefix }) => (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      {description && <p className="text-xs text-gray-500 mb-2">{description}</p>}
      <div className="relative">
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            <span className="text-gray-500 text-sm">{prefix}</span>
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          className={`block w-full ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''} text-sm border-pink-200 rounded focus:border-pink-500 focus:ring-pink-500`}
          placeholder={placeholder}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
            <span className="text-gray-500 text-sm">{suffix}</span>
          </div>
        )}
      </div>
    </div>
  );

  const RadioGroup = ({ label, options, selected, onChange }) => (
    <div className="mb-3">
      {label && <label className="block text-xs font-medium text-gray-700 mb-2">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option.value} className="inline-flex items-center mr-3">
            <input
              type="radio"
              name={option.name}
              value={option.value}
              checked={selected === option.value}
              onChange={() => onChange(option.value)}
              className="h-3 w-3 text-pink-600 focus:ring-pink-500 border-gray-300"
            />
            <span className="ml-1 text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  // Tabs
  const tabs = [
    { id: "store-hours", label: "Store Hours", icon: FiClock },
    { id: "business-hours", label: "Business Hours", icon: FiCalendar },
    { id: "orders", label: "Order Settings", icon: FiShoppingBag },
    { id: "catalogue", label: "Catalogue", icon: FiPackage },
    { id: "delivery", label: "Delivery", icon: FiTruck },
    { id: "notifications", label: "Notifications", icon: FiBell },
    { id: "advanced", label: "Advanced", icon: FiSettings }
  ];

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;
  if (error) return <div className="container mx-auto px-4 py-8 text-red-500">Error: {error}</div>;
  if (!merchant) return <div className="container mx-auto px-4 py-8">No merchant data found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 p-3">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-pink-100 mb-6 overflow-hidden">
        <div className="container mx-auto px-4">
          <ul className="flex space-x-8">
            <li>
              <Link
                to={`/admin/dashboard/merchants/merchant-config/${id}`}
                className={`px-4 py-3 block ${
                  location.pathname === `/admin/dashboard/merchants/merchant-config/${id}`
                    ? "border-b-2 border-orange-500 text-orange-500 font-medium"
                    : "text-gray-500"
                }`}
              >
                Configurations
              </Link>
            </li>
            <li>
              <Link
                to={`/admin/dashboard/merchants/merchant-catelogue/${id}`}
                className={`px-4 py-3 block ${
                  location.pathname === `/admin/dashboard/merchants/merchant-catelogue/${id}`
                    ? "border-b-2 border-orange-500 text-orange-500 font-medium"
                    : "text-gray-500"
                }`}
              >
                Catalogue
              </Link>
            </li>
            <li>
              <Link
                to={`/admin/dashboard/merchants/merchant-details/${id}`}
                className={`px-4 py-3 block ${
                  location.pathname === `/admin/dashboard/merchants/merchant-details/${id}`
                    ? "border-b-2 border-orange-500 text-orange-500 font-medium"
                    : "text-gray-500"
                }`}
              >
                Merchant
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Title */}
      <div className="flex items-center mb-6">
        <button className="text-blue-600 hover:text-blue-800 mr-4">
          <FiChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Merchant Details</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{merchant?.name || ""}</h2>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-pink-600 text-white shadow-lg"
                  : "text-gray-700 bg-white border border-pink-100 hover:bg-pink-50 hover:text-pink-700"
              }`}
            >
              <tab.icon className={`h-4 w-4 mr-2 ${activeTab === tab.id ? 'text-white' : 'text-pink-500'}`} />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Store Hours Tab */}
        {activeTab === "store-hours" && (
          <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Store Hours Configuration</h3>
              <p className="text-sm text-gray-600">Set detailed opening and closing times for each day</p>
            </div>
            <StoreHours initialHours={storeHoursData} onSave={handleSaveStoreHours} />
          </div>
        )}

        {/* Business Hours Tab */}
        {activeTab === "business-hours" && (
          <div className="space-y-4">
            {/* Error Message */}
            {businessHoursError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <FiAlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-red-800">Validation Error</h4>
                    <p className="text-xs text-red-700 mt-1 whitespace-pre-line">{businessHoursError}</p>
                  </div>
                  <button
                    onClick={() => setBusinessHoursError(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Current Status */}
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Current Availability</h4>
                  <p className="text-xs text-pink-700 mt-1">{getAvailabilityStatus()}</p>
                  {loadingBusinessHours && (
                    <p className="text-xs text-gray-500 mt-1">Loading...</p>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {businessHours.dateAvailability === "everyday" && "Affects all days"}
                  {businessHours.dateAvailability === "specificDays" && `Affects ${businessHours.specificDays.length} days`}
                  {businessHours.dateAvailability === "specificDates" && `Affects ${businessHours.specificDates.length} dates`}
                </div>
              </div>
            </div>

            <Section title="Date Availability" defaultOpen={true}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">When should your business be available?</label>
                <RadioGroup
                  options={[
                    { value: "everyday", label: "Every day", name: "dateAvailability" },
                    { value: "specificDays", label: "Specific days of the week", name: "dateAvailability" },
                    { value: "specificDates", label: "Specific calendar dates", name: "dateAvailability" },
                  ]}
                  selected={businessHours.dateAvailability}
                  onChange={handleDateAvailabilityChange}
                />
              </div>

              {/* Specific Days Selection */}
              {businessHours.dateAvailability === "specificDays" && (
                <div className="mt-4 p-4 bg-pink-50 rounded-lg border border-pink-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Select which days:</h4>
                  <div className="grid grid-cols-7 gap-2">
                    {daysOfWeek.map((day) => (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => handleDaySelection(day.id)}
                        className={`p-2 rounded-lg border text-center transition-all duration-200 ${
                          businessHours.specificDays.includes(day.id)
                            ? 'border-pink-500 bg-pink-100 text-pink-700'
                            : 'border-pink-100 hover:border-pink-300 hover:bg-pink-50'
                        }`}
                      >
                        <div className="text-xs font-medium">{day.short}</div>
                        <div className="text-xs text-gray-600 mt-1">{day.label}</div>
                      </button>
                    ))}
                  </div>
                  {businessHours.specificDays.length > 0 && (
                    <div className="mt-3 p-2 bg-pink-100 rounded border border-pink-200">
                      <p className="text-xs text-pink-800">
                        <span className="font-medium">Selected Days:</span>{' '}
                        {businessHours.specificDays.map(d => daysOfWeek.find(day => day.id === d)?.label).join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Specific Dates Selection */}
              {businessHours.dateAvailability === "specificDates" && (
                <div className="mt-4 p-4 bg-pink-50 rounded-lg border border-pink-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Select specific dates:</h4>
                  <div className="flex items-center space-x-2 mb-3">
                    <input
                      type="date"
                      value={businessHours.dateInput}
                      onChange={(e) => handleDateInputChange(e.target.value)}
                      className="block w-40 text-sm border-pink-200 rounded focus:border-pink-500 focus:ring-pink-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddDate}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-pink-600 hover:bg-pink-700"
                    >
                      <FiPlus className="h-4 w-4 mr-1" />
                      Add Date
                    </button>
                  </div>
                  
                  {businessHours.specificDates.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Selected Dates:</p>
                      <div className="flex flex-wrap gap-2">
                        {businessHours.specificDates.map((date, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-lg text-xs bg-pink-100 text-pink-800 border border-pink-200"
                          >
                            {new Date(date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                            <button
                              type="button"
                              onClick={() => handleRemoveDate(date)}
                              className="ml-2 text-pink-600 hover:text-pink-800"
                            >
                              <FiX className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Section>

            {/* Time Availability */}
            <Section title="Time Availability" defaultOpen={true}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {businessHours.dateAvailability === "everyday" 
                    ? "What are your operating hours every day?"
                    : businessHours.dateAvailability === "specificDays"
                    ? "What are your operating hours on selected days?"
                    : "What are your operating hours on selected dates?"}
                </label>
                <RadioGroup
                  options={[
                    { value: "openAllDay", label: "Open All Day (24/7)", name: "timeAvailability" },
                    { value: "closedAllDay", label: "Closed All Day", name: "timeAvailability" },
                    { value: "specificTime", label: "Specific Time Slots", name: "timeAvailability" },
                  ]}
                  selected={businessHours.timeAvailability}
                  onChange={handleTimeAvailabilityChange}
                />
              </div>

              {businessHours.timeAvailability === "specificTime" && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Configure Time Slots:</h4>
                  <div className="space-y-3">
                    {businessHours.specificTimeSlots.map((slot, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg border border-pink-200">
                        <div className="flex-1 grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Start Time</label>
                            <input
                              type="time"
                              value={slot.start}
                              onChange={(e) => handleTimeSlotChange(index, 'start', e.target.value)}
                              className="w-full text-sm border-pink-200 rounded focus:border-pink-500 focus:ring-pink-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">End Time</label>
                            <input
                              type="time"
                              value={slot.end}
                              onChange={(e) => handleTimeSlotChange(index, 'end', e.target.value)}
                              className="w-full text-sm border-pink-200 rounded focus:border-pink-500 focus:ring-pink-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Max Orders</label>
                            <input
                              type="number"
                              value={slot.maxOrders}
                              onChange={(e) => handleTimeSlotChange(index, 'maxOrders', e.target.value)}
                              placeholder="No limit"
                              className="w-full text-sm border-pink-200 rounded focus:border-pink-500 focus:ring-pink-500"
                            />
                          </div>
                        </div>
                        {businessHours.specificTimeSlots.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTimeSlot(index)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTimeSlot}
                    className="mt-3 inline-flex items-center px-3 py-2 border border-dashed border-pink-300 rounded-lg text-sm font-medium text-pink-700 bg-white hover:bg-pink-50"
                  >
                    <FiPlus className="h-4 w-4 mr-2" />
                    Add Time Slot
                  </button>
                </div>
              )}
            </Section>

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveBusinessHours}
                disabled={savingBusinessHours}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  savingBusinessHours 
                    ? 'bg-pink-400 cursor-not-allowed' 
                    : 'bg-pink-600 hover:bg-pink-700'
                }`}
              >
                {savingBusinessHours ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2 h-4 w-4" />
                    Save Business Hours
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Order Settings Tab */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <Section title="Accept/Reject Order" defaultOpen={true}>
              <Toggle
                checked={acceptRejectOrder}
                onChange={() => setAcceptRejectOrder(!acceptRejectOrder)}
                label="Manual Order Acceptance"
                description="Merchant must manually accept each order"
              />
              {acceptRejectOrder && (
                <div className="mt-3 p-3 bg-pink-50 rounded-lg border border-pink-200">
                  <p className="text-xs text-gray-600 mb-2">
                    On Demand Order: If not accepted within X minutes, order will be cancelled.
                  </p>
                  <InputField
                    label="Order Acceptance Time (Minutes)"
                    type="number"
                    value={orderAcceptanceTime}
                    onChange={(e) => setOrderAcceptanceTime(e.target.value)}
                    placeholder="Enter minutes"
                  />
                </div>
              )}
            </Section>

            <Section title="Workflow" defaultOpen={true}>
              <Toggle
                checked={dashboardOnlyOrder}
                onChange={() => setDashboardOnlyOrder(!dashboardOnlyOrder)}
                label="Dashboard-Only Order Placement"
                description="Orders can only be placed through admin dashboard"
              />
              <Toggle
                checked={multipleProducts}
                onChange={() => setMultipleProducts(!multipleProducts)}
                label="Multiple products/services in single cart"
                description="Allow customers to add multiple products/services"
              />
              <Toggle
                checked={productMultiselection}
                onChange={() => setProductMultiselection(!productMultiselection)}
                label="Product Multiselection"
                description="Allow multiple quantity of same product/service"
              />
            </Section>

            <Section title="Preparation Time" defaultOpen={true}>
              <InputField
                label="Preparation Time (minutes)"
                type="number"
                value={preparationTime}
                onChange={(e) => setPreparationTime(e.target.value)}
                placeholder="Enter preparation time"
              />
              <p className="text-xs text-gray-500 mt-1">
                Note: Default preparation time for orders
              </p>
            </Section>
          </div>
        )}

        {/* Catalogue Tab */}
        {activeTab === "catalogue" && (
          <div className="space-y-4">
            <Section title="Merchants level Loyalty Earning" defaultOpen={true}>
              <Toggle
                checked={merchantLoyalty}
                onChange={() => setMerchantLoyalty(!merchantLoyalty)}
                label="Enable Loyalty Point Earning"
                description="Enable loyalty point earning and usage on merchants level"
              />
            </Section>

            <Section title="Show Merchants Timing" defaultOpen={true}>
              <Toggle
                checked={showMerchantTiming}
                onChange={() => setShowMerchantTiming(!showMerchantTiming)}
                label="Show Timing on Merchants Listing"
                description="Enable to show timing on merchants listing"
              />
            </Section>

            <Section title="Veg/Nonveg Status" defaultOpen={true}>
              <Toggle
                checked={vegNonvegStatus}
                onChange={() => setVegNonvegStatus(!vegNonvegStatus)}
                label="Show Veg Only Toggle"
                description="Enable to show veg only toggle for your merchants"
              />
            </Section>

            <Section title="Enable Tax Inclusive Product Pricing" defaultOpen={true}>
              <Toggle
                checked={taxInclusivePricing}
                onChange={() => setTaxInclusivePricing(!taxInclusivePricing)}
                label="Display Tax Inclusive Amount"
                description="Enable to display product tax inclusive amount"
              />
            </Section>

            <Section title="Business Categories" defaultOpen={true}>
              <Toggle
                checked={businessCategories}
                onChange={() => setBusinessCategories(!businessCategories)}
                label="Enable Business Categories"
                description="Allow catalogue mapping to business categories"
              />
            </Section>

            <Section title="Catalogue" defaultOpen={true}>
              <Toggle
                checked={showOutOfStock}
                onChange={() => setShowOutOfStock(!showOutOfStock)}
                label="Show Out of Stock Items"
                description="Show out of stock items to customer"
              />
            </Section>
          </div>
        )}

        {/* Delivery Tab */}
        {activeTab === "delivery" && (
          <div className="space-y-4">
            <Section title="Surge On Delivery" defaultOpen={true}>
              <div className="flex justify-between items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Enable Surge Pricing</label>
                  <p className="text-xs text-gray-500">Enable surge pricing during delivery</p>
                </div>
                <Toggle checked={surgeOnDelivery} onChange={() => setSurgeOnDelivery(!surgeOnDelivery)} inline />
              </div>
            </Section>

            <Section title="Delivery Manager" defaultOpen={true}>
              <RadioGroup
                label="Select Management Settings"
                options={[
                  { value: "default", label: "Default", name: "deliveryManager" },
                  { value: "byAdmin", label: "By Admin", name: "deliveryManager" },
                  { value: "byMerchant", label: "By Merchant", name: "deliveryManager" },
                ]}
                selected={deliveryManager}
                onChange={setDeliveryManager}
              />
            </Section>

            <Section title="Minimum Order Amount" defaultOpen={true}>
              <InputField
                label="Minimum Order Amount"
                type="number"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                placeholder="Enter amount"
                prefix="₹"
              />
            </Section>

            <Section title="Maximum Order Per Slot" defaultOpen={true}>
              <InputField
                label="Maximum Order Per Slot"
                type="number"
                value={maxOrderPerSlot}
                onChange={(e) => setMaxOrderPerSlot(e.target.value)}
                placeholder="Don't set any value for no limit"
              />
            </Section>

            <Section title="TOOKAN Tasks" defaultOpen={true}>
              <RadioGroup
                label="Choose task type"
                options={[
                  { value: "pickupDelivery", label: "Pickup & Delivery", name: "tookanTasks" },
                  { value: "delivery", label: "Delivery Only", name: "tookanTasks" },
                ]}
                selected={tookanTasks}
                onChange={setTookanTasks}
              />
            </Section>

            <Section title="Special Instructions" defaultOpen={true}>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Special instructions for agent for every order"
                className="w-full text-sm border-pink-200 rounded focus:border-pink-500 focus:ring-pink-500"
                rows="3"
              />
            </Section>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="space-y-4">
            <Section title="Display Critical Alerts on the Checkout Page" defaultOpen={true}>
              <Toggle
                checked={criticalAlerts}
                onChange={() => setCriticalAlerts(!criticalAlerts)}
                label="Show Critical Alerts"
                description="Automatically inform customers during checkout with prominent messages"
              />
            </Section>

            <Section title="Reminder for Scheduled Orders" defaultOpen={true}>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Reminder for Merchants</h4>
                <p className="text-xs text-gray-500 mb-2">
                  Time (in mins) before notification appears to Merchant
                </p>
                <InputField
                  type="number"
                  value={merchantReminder}
                  onChange={(e) => setMerchantReminder(e.target.value)}
                  placeholder="Enter minutes"
                  suffix="minutes"
                />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Reminder for Customer</h4>
                <p className="text-xs text-gray-500 mb-2">
                  Time (in mins) before notification appears to Customer
                </p>
                <InputField
                  type="number"
                  value={customerReminder}
                  onChange={(e) => setCustomerReminder(e.target.value)}
                  placeholder="Enter minutes"
                  suffix="minutes"
                />
              </div>
            </Section>
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === "advanced" && (
          <div className="space-y-4">
            <Section title="Apply buffer for Everyday" defaultOpen={true}>
              <Toggle
                checked={applyBuffer}
                onChange={() => setApplyBuffer(!applyBuffer)}
                label="Enable Buffer Time"
                description="Add buffer for first slot on next days"
              />
              {applyBuffer && (
                <div className="mt-3">
                  <InputField
                    label="Buffer before first slot (minutes)"
                    type="number"
                    value={bufferTime}
                    onChange={(e) => setBufferTime(e.target.value)}
                    placeholder="Enter minutes"
                    suffix="minutes"
                  />
                </div>
              )}
            </Section>

            <Section title="Time Range For Scheduled Orders" defaultOpen={true}>
              <Toggle
                checked={timeRangeForScheduled}
                onChange={() => setTimeRangeForScheduled(!timeRangeForScheduled)}
                label="Define Delivery Time Range"
                description="Define a delivery time range for scheduled orders"
              />
            </Section>

            <Section title="Redirect URL" defaultOpen={true}>
              <InputField
                label="Redirect URL"
                type="url"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                placeholder="https://example.com"
                description="URL for redirection from merchants listing page"
              />
            </Section>

            <Section title="Business Model" defaultOpen={true}>
              <RadioGroup
                label="Select Business Model"
                options={[
                  { value: "product", label: "PRODUCT MARKETPLACE", name: "businessModel" },
                  { value: "service", label: "SERVICE MARKETPLACE", name: "businessModel" },
                ]}
                selected={businessModel}
                onChange={setBusinessModel}
              />
              {businessModel === "service" && (
                <p className="text-xs text-gray-500 mt-2">
                  In service marketplace, merchants can add pricing according to their business needs (fixed/per minutes/hour/weekly/monthly) including working hours of business. Customers can only select a single service/product at the same time.
                </p>
              )}
            </Section>
          </div>
        )}

        {/* Global Save Button */}
        <div className="mt-8 flex justify-end space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
            <FiX className="mr-2 h-4 w-4" />
            Cancel
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
            <FiSave className="mr-2 h-4 w-4" />
            Save All Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default MerchantConfiguration;