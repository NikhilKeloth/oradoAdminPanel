import { useEffect, useState } from "react";
import {
  FiInfo,
  FiChevronDown,
  FiTrash2,
  FiPlus,
  FiSave,
  FiX,
  FiChevronLeft,
} from "react-icons/fi";
import { Link, useParams } from "react-router-dom";
import { fetchSingleRestaurantDetails } from "../../../apis/adminApis/adminFuntionsApi";
import StoreHours from "./StoreHours";
import { getOpeningHours, updateOpeningHours } from "../../../apis/adminApis/restaurantApi";

const MerchantConfiguration = () => {
      const { id } = useParams();
  // State management for all configuration options
  const [dateAvailability, setDateAvailability] = useState("everyday");
  const [timeAvailability, setTimeAvailability] = useState("fulltime");
  const [surgeOnDelivery, setSurgeOnDelivery] = useState(false);
  const [recurringTasks, setRecurringTasks] = useState(false);
  const [recurringDays, setRecurringDays] = useState({
    sunday: false,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
  });
  const [slotInterval, setSlotInterval] = useState("");
  const [timeSlots, setTimeSlots] = useState([{ start: "", end: "" }]);
  const [acceptRejectOrder, setAcceptRejectOrder] = useState(false);
  const [orderAcceptanceTime, setOrderAcceptanceTime] = useState("");
  const [merchantLoyalty, setMerchantLoyalty] = useState(false);
  const [showMerchantTiming, setShowMerchantTiming] = useState(false);
  const [customOrder, setCustomOrder] = useState(false);
  const [businessCategories, setBusinessCategories] = useState(false);
  const [preparationTime, setPreparationTime] = useState("");
  const [applyBuffer, setApplyBuffer] = useState(false);
  const [bufferTime, setBufferTime] = useState("");
  const [timeRangeForScheduled, setTimeRangeForScheduled] = useState(false);
  const [deliveryModes, setDeliveryModes] = useState({
    selfPickup: false,
    homeDelivery: false,
    pickAndDrop: false,
  });
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [minSelfPickupAmount, setMinSelfPickupAmount] = useState("");
  const [maxOrderPerSlot, setMaxOrderPerSlot] = useState("");
  const [defaultValueNot, setDefaultValueNot] = useState(false);
  const [tookanTasks, setTookanTasks] = useState("pickupDelivery");
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [orderPlacedNotification, setOrderPlacedNotification] = useState(false);
  const [criticalAlerts, setCriticalAlerts] = useState(false);
  const [merchantReminder, setMerchantReminder] = useState("");
  const [customerReminder, setCustomerReminder] = useState("");
  const [businessModel, setBusinessModel] = useState("product");
  const [dashboardOnlyOrder, setDashboardOnlyOrder] = useState(false);
  const [multipleProducts, setMultipleProducts] = useState(false);
  const [productMultiselection, setProductMultiselection] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

 const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



const [storeHours, setStoreHours] = useState([
  { day: 'monday', openingTime: '09:00', closingTime: '17:00', isClosed: false },
  { day: 'tuesday', openingTime: '09:00', closingTime: '17:00', isClosed: false },
  { day: 'wednesday', openingTime: '09:00', closingTime: '17:00', isClosed: false },
  { day: 'thursday', openingTime: '09:00', closingTime: '17:00', isClosed: false },
  { day: 'friday', openingTime: '09:00', closingTime: '17:00', isClosed: false },
  { day: 'saturday', openingTime: '10:00', closingTime: '16:00', isClosed: false },
  { day: 'sunday', openingTime: '--:--', closingTime: '--:--', isClosed: true },

]);

 // Add this helper function at the top of your component (outside the StoreHours function)

useEffect(() => {
  const fetchOpeningHours = async () => {
    try {
      const response = await getOpeningHours(id);
      console.log("Fetched opening hours:", response.data.data);
      setStoreHours(response.data.data); // adjust based on response structure
    } catch (error) {
      console.error("Error fetching opening hours:", error);
    }
  };

  fetchOpeningHours();
}, [id]); 

    const handleSaveHours = async(updatedHours) => {

      try {
        

         console.log('Saving hours:', updatedHours);

         const response = await updateOpeningHours(id, updatedHours);
         console.log(response)
  
    setStoreHours(updatedHours);
    alert('Store hours saved successfully!');
      } catch (error) {
        
      }
   
  };
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












  const handleDeliveryModeChange = (mode) => {
    setDeliveryModes({
      ...deliveryModes,
      [mode]: !deliveryModes[mode],
    });
  };










  const handleRecurringDayChange = (day) => {
    setRecurringDays({
      ...recurringDays,
      [day]: !recurringDays[day],
    });
  };

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { start: "", end: "" }]);
  };

  const removeTimeSlot = (index) => {
    const newSlots = [...timeSlots];
    newSlots.splice(index, 1);
    setTimeSlots(newSlots);
  };

  const handleTimeSlotChange = (index, field, value) => {
    const newSlots = [...timeSlots];
    newSlots[index][field] = value;
    setTimeSlots(newSlots);
  };

  // Section component for better organization
  const Section = ({ title, children, collapsible = false, style }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <div
        className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden"
        style={style}
      >
        <div
          className={`flex justify-between items-center p-4 border-b ${
            collapsible ? "cursor-pointer" : ""
          }`}
          onClick={() => collapsible && setIsOpen(!isOpen)}
        >
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {collapsible && (
            <FiChevronDown
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          )}
        </div>
        {isOpen && <div className="p-4">{children}</div>}
      </div>
    );
  };

  // Toggle switch component
  const Toggle = ({
    checked,
    onChange,
    label,
    description,
    inline = false,
  }) => (
    <div
      className={`mb-4 ${inline ? "flex items-center justify-between" : ""}`}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
      </label>
    </div>
  );

  // Input field component
  const InputField = ({
    label,
    value,
    onChange,
    type = "text",
    placeholder,
    prefix,
    suffix,
    description,
    className = "",
    style,
  }) => (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {description && (
        <p className="text-xs text-gray-500 mb-2">{description}</p>
      )}
      <div className="relative rounded-md shadow-sm" style={style}>
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{prefix}</span>
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          className={`block w-full ${prefix ? "pl-10" : ""} ${
            suffix ? "pr-10" : ""
          } rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${className}`}
          placeholder={placeholder}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{suffix}</span>
          </div>
        )}
      </div>
    </div>
  );

  // Radio group component
  const RadioGroup = ({
    label,
    options,
    selected,
    onChange,
    name,
    description,
    className = "",
  }) => (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {description && (
        <p className="text-xs text-gray-500 mb-2">{description}</p>
      )}
      <div className="flex space-x-4">
        {options.map((option) => (
          <label key={option.value} className="inline-flex items-center">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={selected === option.value}
              onChange={() => onChange(option.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  // Checkbox group component
  const CheckboxGroup = ({
    label,
    options,
    selected,
    onChange,
    description,
    className = "",
    columns = 1,
  }) => (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {description && (
        <p className="text-xs text-gray-500 mb-2">{description}</p>
      )}
      <div className={`grid grid-cols-${columns} gap-2`}>
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              type="checkbox"
              checked={selected[option.value]}
              onChange={() => onChange(option.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">{option.label}</label>
          </div>
        ))}
      </div>
    </div>
  );




    if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="container mx-auto px-4 py-8">
        No merchant data found.
      </div>
    );
  }

  return (
    // <div className="max-w-6xl mx-auto px-4 py-6">

     <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 p-3">
      <div className="bg-white rounded-2xl shadow-lg border border-pink-100 mb-6 overflow-hidden">
        <div className="container mx-auto px-4">
          <ul className="flex space-x-8">
            <li>
              <Link
                to={`/admin/dashboard/merchants/merchant-config/${id}`}
                className={`px-4 py-3 block ${
                  location.pathname ===
                  `/admin/dashboard/merchants/merchant-config/${id}`
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
                  location.pathname ===
                  `/admin/dashboard/merchants/merchant-catelogue/${id}`
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
                  location.pathname ===
                  `/admin/dashboard/merchants/merchant-details/${id}`
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

      {/* Header */}
      <div className="flex items-center mb-6">
        <button className="text-blue-600 hover:text-blue-800 mr-4">
          <FiChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Merchant Details</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold"> {merchant?.name || ""}  </h2>
      </div>

      {/* Main content */}
      <div className="space-y-6">


    <StoreHours 
        initialHours={storeHours}
        onSave={handleSaveHours}
      />




        {/* Availability Section */}
        {/* <Section
          title="Date wise availability"
          style={{ backgroundColor: "#f5f6f7" }}
        >
          <RadioGroup
            label=""
            name="dateAvailability"
            selected={dateAvailability}
            onChange={setDateAvailability}
            options={[
              { value: "everyday", label: "Every day" },
              { value: "specific", label: "Specific days" },
            ]}
            className="flex space-x-6"
          />
        </Section>

        <Section
          title="Time wise availability"
          style={{ backgroundColor: "#f5f6f7" }}
        >
          <RadioGroup
            label=""
            name="timeAvailability"
            selected={timeAvailability}
            onChange={setTimeAvailability}
            options={[
              { value: "fulltime", label: "Full Time" },
              { value: "specific", label: "Specific time" },
            ]}
            className="flex space-x-6"
          />
        </Section> */}

        {/* Surge on Delivery
        <Section>
          <div className="flex justify-between items-center">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700">
                Surge On Delivery
              </label>
            </div>
            <div className="w-1/2 flex justify-end">
              <Toggle
                checked={surgeOnDelivery}
                onChange={() => setSurgeOnDelivery(!surgeOnDelivery)}
                inline
              />
            </div>
          </div>
        </Section> */}

        {/* Recurring Tasks
        <Section title="Recurring Tasks">
          <div className="flex justify-between items-start">
            <div className="w-3/4">
              <p className="text-sm text-gray-600 mb-4">
                Recurring Task is a feature which lets you create task once,
                allowing you to enter the frequency i.e. how often you want the
                task to be repeated.
              </p>

              <CheckboxGroup
                label="Select Days"
                options={[
                  { value: "sunday", label: "Sunday" },
                  { value: "monday", label: "Monday" },
                  { value: "tuesday", label: "Tuesday" },
                  { value: "wednesday", label: "Wednesday" },
                  { value: "thursday", label: "Thursday" },
                  { value: "friday", label: "Friday" },
                  { value: "saturday", label: "Saturday" },
                ]}
                selected={recurringDays}
                onChange={handleRecurringDayChange}
                columns={3}
              />

              <div className="grid grid-cols-2 gap-4 mb-4">
                <InputField
                  label="Slot Interval (In Minutes)"
                  type="number"
                  value={slotInterval}
                  onChange={(e) => setSlotInterval(e.target.value)}
                  placeholder="Enter interval in minutes"
                />
                <div className="flex items-end">
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                    Update
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Slots
                </label>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-sm font-medium text-gray-700 pb-2">
                        Start Time
                      </th>
                      <th className="text-left text-sm font-medium text-gray-700 pb-2">
                        End Time
                      </th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((slot, index) => (
                      <tr key={index}>
                        <td className="py-2">
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) =>
                              handleTimeSlotChange(
                                index,
                                "start",
                                e.target.value
                              )
                            }
                            className="border rounded-md p-2"
                          />
                        </td>
                        <td className="py-2">
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) =>
                              handleTimeSlotChange(index, "end", e.target.value)
                            }
                            className="border rounded-md p-2"
                          />
                        </td>
                        <td className="py-2">
                          {timeSlots.length > 1 && (
                            <button
                              onClick={() => removeTimeSlot(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FiTrash2 />
                            </button>
                          )}
                          {index === timeSlots.length - 1 && (
                            <button
                              onClick={addTimeSlot}
                              className="text-blue-500 hover:text-blue-700 ml-2"
                            >
                              <FiPlus />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-gray-500">
                Note: To Enable Recurring task mark your products for recurring
                Bookings.
              </p>
            </div>
            <div className="w-1/4 flex justify-end">
              <Toggle
                checked={recurringTasks}
                onChange={() => setRecurringTasks(!recurringTasks)}
                inline
              />
            </div>
          </div>
        </Section> */}

        {/* Scheduling */}
        {/* <Section title="Scheduling">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Options
            </label>
            <div className="flex space-x-6">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">On Demand</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Scheduling</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slot Interval (In Minutes)
              <FiInfo className="inline ml-1 text-gray-400" />
            </label>
            <div className="flex space-x-4">
              <input
                type="text"
                className="border rounded-md p-2 flex-grow"
                placeholder="Enter interval in minutes"
              />
              <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                Update
              </button>
            </div>
          </div>
        </Section> */}

        {/* Accept/Reject Order */}
        {/* <Section>
          <div className="flex justify-between items-start">
            <div className="w-3/4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Accept/Reject Order
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Disable it to automatically accept all incoming Orders. If
                enabled, then the merchant will have to manually accept each
                Order.
              </p>

              {acceptRejectOrder && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-600 mb-2">
                    On Demand Order: If the Order is not accepted within X
                    minutes of Order time, it would be cancelled automatically.
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Scheduled Order: If the Order is not accepted within X
                    minutes of scheduled time, it would be cancelled
                    automatically.
                  </p>

                  <InputField
                    label="Order Acceptance Time (In Minutes)"
                    type="number"
                    value={orderAcceptanceTime}
                    onChange={(e) => setOrderAcceptanceTime(e.target.value)}
                    placeholder="Enter the time (in minutes) upto which the order can be accepted"
                    className="mb-4"
                  />

                  <div className="flex space-x-4">
                    <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
                      Cancel
                    </button>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="w-1/4 flex justify-end">
              <Toggle
                checked={acceptRejectOrder}
                onChange={() => setAcceptRejectOrder(!acceptRejectOrder)}
                inline
              />
            </div>
          </div>
        </Section> */}

        {/* Merchant level Loyalty */}
        {/* <Section>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Merchant level Loyalty Earning
              </h3>
              <p className="text-sm text-gray-600">
                Please enable this toggle to enable loyalty point earning and
                usage on Merchant level.
              </p>
            </div>
            <Toggle
              checked={merchantLoyalty}
              onChange={() => setMerchantLoyalty(!merchantLoyalty)}
              inline
            />
          </div>
        </Section> */}

        {/* Show Merchant Timing */}
        {/* <Section>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Show Merchant Timing
              </h3>
              <p className="text-sm text-gray-600">
                Enable this toggle to show timing on Merchant listing
              </p>
            </div>
            <Toggle
              checked={showMerchantTiming}
              onChange={() => setShowMerchantTiming(!showMerchantTiming)}
              inline
            />
          </div>
        </Section> */}

        {/* Custom Order */}
        {/* <Section>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Custom Order
              </h3>
              <p className="text-sm text-gray-600">
                Allow customers to place Custom Order
              </p>
            </div>
            <Toggle
              checked={customOrder}
              onChange={() => setCustomOrder(!customOrder)}
              inline
            />
          </div>
        </Section> */}

        {/* Business Categories */}
        {/* <Section>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Business Categories
              </h3>
              <p className="text-sm text-gray-600">
                Enable this to allow catalogue mapping to business categories
              </p>
            </div>
            <Toggle
              checked={businessCategories}
              onChange={() => setBusinessCategories(!businessCategories)}
              inline
            />
          </div>
        </Section> */}

        {/* Preparation Time */}
        {/* <Section title="Preparation Time (in minutes)">
          <InputField
            type="number"
            value={preparationTime}
            onChange={(e) => setPreparationTime(e.target.value)}
            placeholder="Enter preparation time in minutes"
          />
          <p className="text-xs text-gray-500 mt-2">
            Note: Set preparation time which you'll take to prepare the Order.
            This will be the default preparation time. To change it for a
            particular Order, refer to Order list and change it before accepting
            the Order. Pre-Requisite: Enable accept/reject to edit preparation
            time once the Order is placed.
          </p>
        </Section> */}

        {/* Apply buffer */}
        {/* <Section>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Apply buffer for Everyday
              </h3>
              <p className="text-sm text-gray-600">
                Enable this to add the buffer for first slot on next days
              </p>
            </div>
            <Toggle
              checked={applyBuffer}
              onChange={() => setApplyBuffer(!applyBuffer)}
              inline
            />
          </div>
        </Section> */}

        {/* Buffer time */}
        {/* <Section title="Buffer before the first slot appears (in minutes)">
          <InputField
            type="number"
            value={bufferTime}
            onChange={(e) => setBufferTime(e.target.value)}
            placeholder="Enter buffer time in minutes"
          />
        </Section> */}

        {/* Time Range for Scheduled Orders */}
        {/* <Section>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Time Range For Scheduled Orders
              </h3>
              <p className="text-sm text-gray-600">
                Enable this to define a Delivery time range for your scheduled
                Orders
              </p>
            </div>
            <Toggle
              checked={timeRangeForScheduled}
              onChange={() => setTimeRangeForScheduled(!timeRangeForScheduled)}
              inline
            />
          </div>
        </Section> */}

        {/* Delivery Modes */}
        {/* <Section title="Delivery Modes">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Modes
          </label>
          <div className="flex space-x-6">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={deliveryModes.selfPickup}
                onChange={() => handleDeliveryModeChange("selfPickup")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Self Pickup</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={deliveryModes.homeDelivery}
                onChange={() => handleDeliveryModeChange("homeDelivery")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Home delivery</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={deliveryModes.pickAndDrop}
                onChange={() => handleDeliveryModeChange("pickAndDrop")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Pick And Drop</span>
            </label>
          </div>
        </Section> */}

        {/* Minimum Order Amount */}
        {/* <Section title="Minimum Order Amount">
          <InputField
            label="Minimum Order"
            type="number"
            value={minOrderAmount}
            onChange={(e) => setMinOrderAmount(e.target.value)}
            prefix="$"
            placeholder="0.00"
          />

          <InputField
            label="Minimum Self Pickup Amount"
            type="number"
            value={minSelfPickupAmount}
            onChange={(e) => setMinSelfPickupAmount(e.target.value)}
            prefix="$"
            placeholder="0.00"
          />
        </Section> */}

        {/* Maximum Order Per Slot */}
        {/* <Section title="Maximum Order Per Slot">
          <div className="flex space-x-4 mb-4">
            <input
              type="text"
              className="border rounded-md p-2 flex-grow"
              placeholder="Enter maximum orders per slot"
              disabled={defaultValueNot}
            />
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
              Update
            </button>
          </div>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={defaultValueNot}
              onChange={() => setDefaultValueNot(!defaultValueNot)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Don't set any value.
            </span>
          </label>
        </Section> */}

        {/* TOOKAN Tasks */}
        {/* <Section>
          <div className="flex justify-between items-start">
            <div className="w-3/4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                TOOKAN Tasks
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Choose whether you want to send Pickup & Delivery tasks or only
                Delivery tasks on TOOKAN.
              </p>

              <div className="flex items-center space-x-4">
                <span>Pickup & Delivery</span>
                <Toggle
                  checked={tookanTasks === "delivery"}
                  onChange={() =>
                    setTookanTasks(
                      tookanTasks === "pickupDelivery"
                        ? "delivery"
                        : "pickupDelivery"
                    )
                  }
                  inline
                />
                <span>Delivery</span>
              </div>
            </div>
          </div>
        </Section> */}

        {/* Product Tags */}
        {/* <Section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Product Tags
            </h3>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
              Add Tags
            </button>
          </div>
        </Section> */}

        {/* Special Instructions */}
        {/* <Section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Special Instructions
            </h3>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
              Save
            </button>
          </div>

          <label className="block text-sm text-gray-600 mb-2">
            Special Instructions for agent for every order
          </label>
          <textarea
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            className="w-full border rounded-md p-2 h-32"
            placeholder="Enter instructions"
          />
        </Section> */}

        {/* Catalogue */}
        {/* <Section>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Catalogue</h3>
              <p className="text-sm text-gray-600">
                Show out of stock items to customer
              </p>
            </div>
            <Toggle
              checked={showOutOfStock}
              onChange={() => setShowOutOfStock(!showOutOfStock)}
              inline
            />
          </div>
        </Section> */}

        {/* Email Notifications */}
        {/* <Section title="Email Notifications">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-md font-medium text-gray-700">
                Order Placed
              </h4>
              <p className="text-xs text-gray-500">
                (Your Order has been placed.)
              </p>
            </div>
            <Toggle
              checked={orderPlacedNotification}
              onChange={() =>
                setOrderPlacedNotification(!orderPlacedNotification)
              }
              inline
            />
          </div>
        </Section> */}

        {/* Critical Alerts */}
        {/* <Section>
          <div className="flex justify-between items-center">
            <div className="w-3/4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Display Critical Alerts on the Checkout Page
              </h3>
              <p className="text-sm text-gray-600">
                Enable this feature to automatically inform customers during
                checkout. A prominent banner will appear to display important
                messages or updates.
              </p>
            </div>
            <div className="w-1/4 flex justify-end">
              <Toggle
                checked={criticalAlerts}
                onChange={() => setCriticalAlerts(!criticalAlerts)}
                inline
              />
            </div>
          </div>
        </Section> */}

        {/* Reminder for Scheduled Orders */}
        {/* <Section title="Reminder for Scheduled Orders">
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-700 mb-2">
              Reminder for Merchant
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Please enter the time (in mins) before which the Notification will
              appear to the Merchant. E.g: If the Order is Scheduled at 5:00 PM
              and the time is set as 5 (mins), the notification will appear at
              4:55 PM.
            </p>
            <InputField
              type="number"
              value={merchantReminder}
              onChange={(e) => setMerchantReminder(e.target.value)}
              placeholder="Enter time in minutes"
              min="0"
            />
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-700 mb-2">
              Reminder for Customer
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Please enter the time (in mins) before which the Notification will
              appear to the Customer. E.g: If the Order is Scheduled at 5:00 PM
              and the time is set as 5 (mins), the notification will appear at
              4:55 PM.
            </p>
            <InputField
              type="number"
              value={customerReminder}
              onChange={(e) => setCustomerReminder(e.target.value)}
              placeholder="Enter time in minutes"
              min="0"
            />
          </div>
        </Section> */}

        {/* Workflow */}
        {/* <Section title="Workflow">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-md font-medium text-gray-700">
                Business Model
              </h4>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">
                  PRODUCT MARKETPLACE
                </span>
                <Toggle
                  checked={businessModel === "service"}
                  onChange={() =>
                    setBusinessModel(
                      businessModel === "product" ? "service" : "product"
                    )
                  }
                  inline
                />
                <span className="text-sm text-gray-500 ml-2">
                  SERVICE MARKETPLACE
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Enabling the service marketplace, the merchants can add pricing
              according to their business needs fixed/per
              minutes/hourly/monthly/yearly including working hours of business.
              In this the customer can only select a single service/product at
              the same time.
            </p>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-md font-medium text-gray-700">
                Dashboard-Only Order Placement
              </h4>
              <Toggle
                checked={dashboardOnlyOrder}
                onChange={() => setDashboardOnlyOrder(!dashboardOnlyOrder)}
                inline
              />
            </div>
            <p className="text-sm text-gray-600">
              Activating this option will restrict order to be made exclusively
              through the dashboard.
            </p>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-md font-medium text-gray-700">
                Multiple products/services in single cart
              </h4>
              <Toggle
                checked={multipleProducts}
                onChange={() => setMultipleProducts(!multipleProducts)}
                inline
              />
            </div>
            <p className="text-sm text-gray-600">
              Enabling this will allow customers to add multiple
              products/services to a single cart. Disable this if you want to
              get only one product/service per Order
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-md font-medium text-gray-700">
                Product Multiselection
              </h4>
              <Toggle
                checked={productMultiselection}
                onChange={() =>
                  setProductMultiselection(!productMultiselection)
                }
                inline
              />
            </div>
            <p className="text-sm text-gray-600">
              When you enable the product Multiselection then user can select
              multiple quantity of same product/Service. if disabled, then
              customers are not allowed to select multiple products/Services.
            </p>
          </div>
        </Section> */}

        {/* Redirect URL */}
        {/* <Section title="Enter URL to be used for redirection from Merchant listing page.">
          <InputField
            type="url"
            value={redirectUrl}
            onChange={(e) => setRedirectUrl(e.target.value)}
            placeholder="Enter URL"
          />
        </Section> */}

        {/* Footer with save buttons */}
        <div className="mt-8 flex justify-end space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <FiX className="mr-2 h-4 w-4" />
            Cancel
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <FiSave className="mr-2 h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default MerchantConfiguration;
