import { useEffect, useState } from "react";
import {
  createOrUpdateGlobalOrderSettings,
  getGlobalOrderSettings,
} from "../../../../apis/adminApis/orderSetting";

const OrderSettings = () => {
  const [settings, setSettings] = useState({
    acceptRejectOrder: false,
    editOrder: false,
    autoPrint: false,
    orderStatusConfig: false,
    emailTaxLabel: false,
    taskTagging: false,
    ratingsReviews: false,
    acceptanceTime: "",
    scheduleAdjustThreshold: "",
    bufferTime: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGlobalSettings();
  }, []);

  const fetchGlobalSettings = async () => {
    try {
      setLoading(true);
      const res = await getGlobalOrderSettings();
      if (res.success) {
        setSettings(res.data);
        console.log(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch global order settings:", error);
      // alert("Failed to load global order settings");
    } finally {
      setLoading(false);
    }
  };

  // 📌 Save/Update global order settings
  const handleSaveSettings = async () => {
    try {
      const res = await createOrUpdateGlobalOrderSettings(settings);
      if (res.success) {
        alert("Global order settings saved successfully");
      }
    } catch (error) {
      console.error("Failed to save global order settings:", error);
      alert("Failed to save settings");
    }
  };

  const handleToggle = (field) => {
    setSettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
        <div className="bg-blue-50 p-3 rounded-xl">
          <svg
            className="w-6 h-6 text-blue-600"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19.275 16.25L22.75 12.8L21.7 11.75L19.275 14.125L18.3 13.15L17.25 14.225L19.275 16.25ZM8 5H20V3H8V5ZM20 19C18.6167 19 17.4377 18.5123 16.463 17.537C15.4883 16.5617 15.0007 15.3827 15 14C14.9993 12.6173 15.487 11.4383 16.463 10.463C17.439 9.4877 18.618 9 20 9C21.382 9 22.5613 9.4877 23.538 10.463C24.5147 11.4383 25.002 12.6173 25 14C24.998 15.3827 24.5103 16.562 23.537 17.538C22.5637 18.514 21.3847 19.0013 20 19ZM5 18V1C5 0.45 5.196 -0.0206667 5.588 -0.413C5.98 -0.805333 6.45067 -1.00133 7 -1H21C21.55 -1 22.021 -0.804 22.413 -0.412C22.805 -0.02 23.0007 0.450667 23 1V7.675C22.6833 7.525 22.3583 7.4 22.025 7.3C21.6917 7.2 21.35 7.125 21 7.075V1H7V15H13.075C13.1583 15.5167 13.2877 16.0083 13.463 16.475C13.6383 16.9417 13.8673 17.3833 14.15 17.8L14 18L12.5 16.5L11 18L9.5 16.5L8 18L6.5 16.5L5 18ZM8 13H13.075C13.125 12.65 13.2 12.3083 13.3 11.975C13.4 11.6417 13.525 11.3167 13.675 11H8V13ZM8 9H15.1C15.7333 8.38333 16.471 7.89567 17.313 7.537C18.155 7.17833 19.0507 6.99933 20 7H8V9Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Order Settings
          </h2>
          <p className="text-sm text-gray-500">
            Configure how orders are processed in your system
          </p>
        </div>
      </div>

      {/* Accept/Reject Order Section */}
      <section className="py-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
              Accept/Reject Order
              <span
                className="text-gray-400 hover:text-gray-600 cursor-help"
                title="Control manual order acceptance"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Disable to auto-accept all incoming orders
            </p>
          </div>
          <div className="md:w-2/3 space-y-4">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">
                <p>Manually accept each order when enabled</p>
                <button className="text-blue-600 hover:underline mt-1 text-sm flex items-center gap-1">
                  Learn more
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.acceptRejectOrder}
                  onChange={() => handleToggle("acceptRejectOrder")}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {settings.acceptRejectOrder && (
              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                <div className="space-y-3 text-sm text-gray-600 mb-4">
                  <p className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                      1
                    </span>
                    <span>
                      <span className="font-medium">On Demand Order:</span> If
                      not accepted within X minutes of order time, it will be
                      cancelled automatically.
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                      2
                    </span>
                    <span>
                      <span className="font-medium">Scheduled Order:</span> If
                      not accepted within X minutes of scheduled time, it will
                      be cancelled automatically.
                    </span>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <label className="text-sm font-medium text-gray-700">
                    Order Acceptance Time (Minutes)
                  </label>
                  <div className="md:col-span-2">
                    <input
                      type="number"
                      name="acceptanceTime"
                      value={settings.acceptanceTime}
                      onChange={handleInputChange}
                      placeholder="Enter time in minutes"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Schedule Adjustment Section */}
      <section className="py-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <h3 className="text-lg font-medium text-gray-800">
              Schedule Adjustment
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Configure time adjustments
            </p>
          </div>
          <div className="md:w-2/3">
            <div className="bg-gray-50/50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-4 flex items-start gap-2">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                  i
                </span>
                <span>
                  <span className="font-medium">On Demand Order:</span> System
                  will automatically adjust pickup and delivery time by the
                  acceptance delay if order is not accepted within threshold.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <label className="text-sm font-medium text-gray-700">
                  Adjustment Threshold (Minutes)
                </label>
                <div className="md:col-span-2">
                  <input
                    type="number"
                    name="scheduleAdjustThreshold"
                    value={settings.scheduleAdjustThreshold}
                    onChange={handleInputChange}
                    placeholder="Enter time in minutes"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Edit Order Section */}
      <section className="py-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <h3 className="text-lg font-medium text-gray-800">Order Editing</h3>
            <p className="text-sm text-gray-500 mt-1">
              Allow order modifications
            </p>
          </div>
          <div className="md:w-2/3">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">
                <p>
                  Enable Admin to edit orders before acceptance by restaurants
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.editOrder}
                  onChange={() => handleToggle("editOrder")}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Auto Print Section */}
      <section className="py-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
              Auto Printing
              <span
                className="text-gray-400 hover:text-gray-600 cursor-help"
                title="Bluetooth printer settings"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Bluetooth printer automation
            </p>
          </div>
          <div className="md:w-2/3">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">
                <p>Enable automated order printing through Bluetooth</p>
                <p className="text-xs text-orange-500 mt-1 flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Ensure merchant apps are updated after April 10th 2024
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.autoPrint}
                  onChange={() => handleToggle("autoPrint")}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Buffer Time Section */}
      <section className="py-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <h3 className="text-lg font-medium text-gray-800">TOOKAN Buffer</h3>
            <p className="text-sm text-gray-500 mt-1">Task reflection delay</p>
          </div>
          <div className="md:w-2/3">
            <div className="bg-gray-50/50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-4">
                Scheduled tasks will reflect immediately on TOOKAN
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <label className="text-sm font-medium text-gray-700">
                  Buffer Time (Minutes)
                </label>
                <div className="md:col-span-2">
                  <input
                    type="number"
                    name="bufferTime"
                    value={settings.bufferTime}
                    onChange={handleInputChange}
                    placeholder="Enter buffer time in minutes"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Order Status Configuration */}
      <section className="py-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <h3 className="text-lg font-medium text-gray-800">
              Status Control
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Order completion settings
            </p>
          </div>
          <div className="md:w-2/3">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">
                <p>
                  Allow merchants to change order status to Completed/Cancelled
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Dashboard only (not available in native apps)
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.orderStatusConfig}
                  onChange={() => handleToggle("orderStatusConfig")}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Email Tax Label */}
      <section className="py-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
              Tax Labels
              <span
                className="text-gray-400 hover:text-gray-600 cursor-help"
                title="Email invoice settings"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </h3>
            <p className="text-sm text-gray-500 mt-1">Invoice customization</p>
          </div>
          <div className="md:w-2/3">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">
                <p>Add tax invoice tags for merchant customization</p>
                <p className="text-xs text-gray-500 mt-1">
                  Remove unused tags from HTML before sending
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.emailTaxLabel}
                  onChange={() => handleToggle("emailTaxLabel")}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Task Tagging */}
      <section className="py-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <h3 className="text-lg font-medium text-gray-800">Task Tags</h3>
            <p className="text-sm text-gray-500 mt-1">
              Agent assignment automation
            </p>
          </div>
          <div className="md:w-2/3">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">
                <p>
                  Define tags to automatically assign agents with matching tags
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Tags must match Tookan configuration
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.taskTagging}
                  onChange={() => handleToggle("taskTagging")}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Ratings & Reviews */}
      <section className="py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <h3 className="text-lg font-medium text-gray-800">Ratings</h3>
            <p className="text-sm text-gray-500 mt-1">
              Customer feedback system
            </p>
          </div>
          <div className="md:w-2/3">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">
                <p>Allow customers to rate merchants on the platform</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.ratingsReviews}
                  onChange={() => handleToggle("ratingsReviews")}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </section>
    </div>
  );
};

export default OrderSettings;
