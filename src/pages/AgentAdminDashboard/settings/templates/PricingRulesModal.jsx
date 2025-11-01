import { useState } from "react";
import { InformationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

// Mock RangeBasedPricing component for demo
const RangeBasedPricing = ({ ranges, setRanges, currencySymbol, surgeRules }) => {
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Configure pricing rules for different distance ranges
      </div>
      {ranges.map((range, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">
              {range.isDefault ? "Default Range" : `Range ${index + 1}`}
            </h4>
            {!range.isDefault && (
              <button 
                onClick={() => {
                  const newRanges = [...ranges];
                  newRanges.splice(index, 1);
                  setRanges(newRanges);
                }}
                className="text-red-500 hover:text-red-700"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Base Fare</label>
              <input
                type="text"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={range.base?.fare || ''}
                onChange={(e) => {
                  const newRanges = [...ranges];
                  newRanges[index].base.fare = e.target.value;
                  setRanges(newRanges);
                }}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Duration Charge</label>
              <input
                type="text"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={range.duration?.charge || ''}
                onChange={(e) => {
                  const newRanges = [...ranges];
                  newRanges[index].duration.charge = e.target.value;
                  setRanges(newRanges);
                }}
              />
            </div>
          </div>
        </div>
      ))}
      <button 
        onClick={() => {
          setRanges([
            ...ranges,
            {
              isOpen: false,
              distanceLimit: '',
              base: { fare: '', surge: '' },
              duration: { charge: '', baseDuration: '' },
              distance: { fare: '', baseDistance: '' },
              waitingTime: { fare: '', baseWaiting: '' },
              surge: { dynamic: false, selectedRule: '' }
            }
          ]);
        }}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-300 hover:text-blue-500 transition-colors"
      >
        + Add Range
      </button>
    </div>
  );
};

const PricingRulesModal = ({ showModal = true, setShowModal = () => {}, onSave = () => {} }) => {
  const [formData, setFormData] = useState({
    name: "",
    decimal_places: "2",
    basicearningState: 1,
    applyToAllTasks: true,
    fleet_traversed_path: true,
    disable_pickup_calculation: false,
    googleTravelModes: 1,
    max_amount: "",
    dynamic_surge: false,
    selectedRuleName: "",
    rangeBased: false,
  });

  const [pricingData, setPricingData] = useState({
    base: { fare: "", surge: "" },
    duration: { charge: "", base_duration_fee: "" },
    distance: { fare: "", base_distance_fee: "" },
    waiting_time_data: { waiting_fare: "", base_waiting_time: "" },
    commission: { charge: "" },
  });

  const [rangeBasedData, setRangeBasedData] = useState([
    {
      isOpen: false,
      distanceLimit: '',
      base: { fare: '', surge: '' },
      duration: { charge: '', baseDuration: '' },
      distance: { fare: '', baseDistance: '' },
      waitingTime: { fare: '', baseWaiting: '' },
      surge: { dynamic: false, selectedRule: '' }
    },
    {
      isOpen: true,
      isDefault: true,
      base: { fare: '', surge: '' },
      duration: { charge: '', baseDuration: '' },
      distance: { fare: '', baseDistance: '' },
      waitingTime: { fare: '', baseWaiting: '' },
      surge: { dynamic: false, selectedRule: '' }
    }
  ]);

  const [surgeRules] = useState([
    { id: "1", surge_rule_name: "Peak Hours Rule" },
    { id: "2", surge_rule_name: "High Demand Rule" },
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePricingChange = (section, field, value) => {
    setPricingData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleRangeBasedChange = (newRangeData) => {
    setRangeBasedData(newRangeData);
  };
 
  const handleToggle = (field) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleRadioChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      formData,
      pricingData: formData.rangeBased ? rangeBasedData : pricingData,
      rangeBasedData: rangeBasedData
    });
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Enhanced backdrop with blur */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
      
      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl transform transition-all">
          {/* Enhanced header with gradient */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Task Pricing & Agent Earning
                </h3>
                <p className="text-blue-100 text-sm mt-1">
                  Configure pricing rules and agent earnings
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-all duration-200"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Basic Information Section */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  Basic Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Rule Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter a descriptive rule name"
                      value={formData.name}
                      onChange={handleInputChange}
                      name="name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Decimal Places
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      value={formData.decimal_places}
                      onChange={handleInputChange}
                      name="decimal_places"
                    >
                      <option value="0">0 (99)</option>
                      <option value="1">1 (99.9)</option>
                      <option value="2">2 (99.99)</option>
                      <option value="3">3 (99.999)</option>
                      <option value="4">4 (99.9999)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Apply To Section */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                  Application Settings
                </h4>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Apply To</label>
                    <div className="flex flex-wrap gap-3">
                      <label className="flex items-center px-4 py-3 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          checked={formData.basicearningState === 1}
                          onChange={() => handleRadioChange("basicearningState", 1)}
                        />
                        <span className="ml-3 text-gray-700 font-medium">Agent Earning</span>
                      </label>
                      <label className="flex items-center px-4 py-3 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          checked={formData.basicearningState === 2}
                          onChange={() => handleRadioChange("basicearningState", 2)}
                        />
                        <span className="ml-3 text-gray-700 font-medium">Task Pricing</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Apply To Tasks</label>
                    <div className="flex flex-wrap gap-3">
                      <label className="flex items-center px-4 py-3 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          checked={formData.applyToAllTasks}
                          onChange={() => handleRadioChange("applyToAllTasks", true)}
                        />
                        <span className="ml-3 text-gray-700 font-medium">All Tasks</span>
                      </label>
                      <label className="flex items-center px-4 py-3 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          checked={!formData.applyToAllTasks}
                          onChange={() => handleRadioChange("applyToAllTasks", false)}
                        />
                        <span className="ml-3 text-gray-700 font-medium">Selected Tasks</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Range Based Toggle */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">Distance Range Rules</h4>
                      <p className="text-sm text-gray-600">Enable different pricing for distance ranges</p>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="rangeBased"
                      className="sr-only"
                      checked={formData.rangeBased}
                      onChange={() => handleToggle("rangeBased")}
                    />
                    <label
                      htmlFor="rangeBased"
                      className={`flex items-center cursor-pointer relative w-16 h-8 rounded-full transition-colors duration-200 ${
                        formData.rangeBased ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                          formData.rangeBased ? 'translate-x-9' : 'translate-x-1'
                        }`}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Pricing Content */}
              {formData.rangeBased ? (
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                    Range-Based Pricing
                  </h4>
                  <RangeBasedPricing
                    ranges={rangeBasedData}
                    setRanges={handleRangeBasedChange}
                    currencySymbol="¤"
                    surgeRules={surgeRules}
                  />
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Enhanced Pricing Section */}
                  <div className="bg-blue-50 rounded-xl border border-blue-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                      <h4 className="text-lg font-medium text-white">Pricing Details</h4>
                      <p className="text-blue-100 text-sm">Configure fare charged to customers</p>
                    </div>
                    
                    <div className="p-6 space-y-6">
                      {/* Primary Pricing Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Base Fare</label>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="0.00"
                              value={pricingData.base.fare}
                              onChange={(e) => handlePricingChange("base", "fare", e.target.value)}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                              <span className="text-gray-500 font-medium">¤</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Duration Fare</label>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-full pl-4 pr-16 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="0.00"
                              value={pricingData.duration.charge}
                              onChange={(e) => handlePricingChange("duration", "charge", e.target.value)}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                              <span className="text-gray-500 font-medium">¤/min</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Distance Fare</label>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-full pl-4 pr-16 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="0.00"
                              value={pricingData.distance.fare}
                              onChange={(e) => handlePricingChange("distance", "fare", e.target.value)}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                              <span className="text-gray-500 font-medium">¤/km</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Waiting Fare</label>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-full pl-4 pr-16 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="0.00"
                              value={pricingData.waiting_time_data.waiting_fare}
                              onChange={(e) => handlePricingChange("waiting_time_data", "waiting_fare", e.target.value)}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                              <span className="text-gray-500 font-medium">¤/min</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Secondary Pricing Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Surge Multiplier</label>
                          <div className="relative">
                            <input
                              type="text"
                              className={`w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                formData.dynamic_surge ? "bg-gray-100 text-gray-500" : ""
                              }`}
                              placeholder="1.0"
                              value={pricingData.base.surge}
                              onChange={(e) => handlePricingChange("base", "surge", e.target.value)}
                              disabled={formData.dynamic_surge}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                              <span className="text-gray-500 font-medium">×</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Base Duration</label>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="0"
                              value={pricingData.duration.base_duration_fee}
                              onChange={(e) => handlePricingChange("duration", "base_duration_fee", e.target.value)}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                              <span className="text-gray-500 font-medium">min</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Base Distance</label>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="0"
                              value={pricingData.distance.base_distance_fee}
                              onChange={(e) => handlePricingChange("distance", "base_distance_fee", e.target.value)}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                              <span className="text-gray-500 font-medium">km</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Base Waiting</label>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="0"
                              value={pricingData.waiting_time_data.base_waiting_time}
                              onChange={(e) => handlePricingChange("waiting_time_data", "base_waiting_time", e.target.value)}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                              <span className="text-gray-500 font-medium">min</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Surge Section */}
                  <div className="bg-yellow-50 rounded-xl border border-yellow-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
                      <h4 className="text-lg font-medium text-white">Surge Pricing</h4>
                      <p className="text-yellow-100 text-sm">Configure dynamic surge pricing</p>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <input
                              type="checkbox"
                              id="dynamicSurge"
                              className="sr-only"
                              checked={formData.dynamic_surge}
                              onChange={() => handleToggle("dynamic_surge")}
                              disabled={surgeRules.length === 0}
                            />
                            <label
                              htmlFor="dynamicSurge"
                              className={`flex items-center cursor-pointer relative w-16 h-8 rounded-full transition-colors duration-200 ${
                                surgeRules.length === 0 
                                  ? 'bg-gray-300 cursor-not-allowed' 
                                  : formData.dynamic_surge 
                                    ? 'bg-yellow-500' 
                                    : 'bg-gray-300'
                              }`}
                            >
                              <div
                                className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                                  formData.dynamic_surge ? 'translate-x-9' : 'translate-x-1'
                                }`}
                              />
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-700">Dynamic Surge</span>
                            <InformationCircleIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>

                        {surgeRules.length > 0 && (
                          <div className="w-full sm:w-64">
                            <select 
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors disabled:bg-gray-100"
                              value={formData.selectedRuleName}
                              onChange={handleInputChange}
                              name="selectedRuleName"
                              disabled={!formData.dynamic_surge}
                            >
                              <option value="">Select Surge Rule</option>
                              {surgeRules.map((rule) => (
                                <option key={rule.id} value={rule.id}>
                                  {rule.surge_rule_name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Path Calculation */}
              <div className="bg-green-50 rounded-xl border border-green-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                  <h4 className="text-lg font-medium text-white">Path Calculation</h4>
                  <p className="text-green-100 text-sm">Configure how distances are calculated</p>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-green-200">
                      <div className="relative mt-1">
                        <input
                          type="checkbox"
                          id="originalDistance"
                          className="sr-only"
                          checked={formData.fleet_traversed_path}
                          onChange={() => handleToggle("fleet_traversed_path")}
                        />
                        <label
                          htmlFor="originalDistance"
                          className={`flex items-center cursor-pointer relative w-12 h-6 rounded-full transition-colors duration-200 ${
                            formData.fleet_traversed_path ? 'bg-green-600' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                              formData.fleet_traversed_path ? 'translate-x-7' : 'translate-x-1'
                            }`}
                          />
                        </label>
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">Calculate By Original Distance</h5>
                        <p className="text-sm text-gray-600">Use the actual distance traveled by the fleet</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-green-200">
                      <div className="relative mt-1">
                        <input
                          type="checkbox"
                          id="pickupDelivery"
                          className="sr-only"
                          checked={formData.disable_pickup_calculation}
                          onChange={() => handleToggle("disable_pickup_calculation")}
                        />
                        <label
                          htmlFor="pickupDelivery"
                          className={`flex items-center cursor-pointer relative w-12 h-6 rounded-full transition-colors duration-200 ${
                            formData.disable_pickup_calculation ? 'bg-green-600' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                              formData.disable_pickup_calculation ? 'translate-x-7' : 'translate-x-1'
                            }`}
                          />
                        </label>
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">Calculate By Pickup & Delivery Location</h5>
                        <p className="text-sm text-gray-600">Use straight-line distance between pickup and delivery points</p>
                      </div>
                    </div>
                  </div>

                  {formData.disable_pickup_calculation && (
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <label className="block text-sm font-medium text-gray-700 mb-4">Travel Mode</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                          { value: 1, label: 'DRIVING', icon: '🚗' },
                          { value: 2, label: 'BICYCLING', icon: '🚴' },
                          { value: 3, label: 'TRANSIT', icon: '🚆' },
                          { value: 4, label: 'WALKING', icon: '🚶' },
                        ].map((mode) => (
                          <label 
                            key={mode.value}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="radio"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                              checked={formData.googleTravelModes === mode.value}
                              onChange={() => handleRadioChange("googleTravelModes", mode.value)}
                            />
                            <span className="ml-2 text-gray-700">
                              <span className="mr-1">{mode.icon}</span>
                              {mode.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Deductions Section */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-red-600 rounded-full mr-3"></div>
                  Deductions
                </h4>
                
                <div className="w-full sm:w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Commission Percentage</label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="0"
                      value={pricingData.commission.charge}
                      onChange={(e) => handlePricingChange("commission", "charge", e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <span className="text-gray-500 font-medium">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Max Limit Section */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  Max Limit
                </h4>
                
                <div className="w-full sm:w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Amount</label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="0.00"
                      value={formData.max_amount}
                      onChange={handleInputChange}
                      name="max_amount"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <span className="text-gray-500 font-medium">¤</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Pricing Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingRulesModal;