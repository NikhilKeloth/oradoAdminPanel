import React, { useEffect, useState } from 'react';
import { createOrUpdateGlobalDeliverySettings, getGlobalDeliverySettings } from '../../../../apis/adminApis/deliverySettings';
import { toast } from 'react-toastify';
import { getAllTemplates } from '../../../../apis/adminApis/templateApi';
 
const DeliverySettings = () => {
  const [deliveryModes, setDeliveryModes] = useState({
    virtualMeet: false,
    homeDelivery: true,
    pickAndDrop: false
  });
  const [defaultDeliveryMode, setDefaultDeliveryMode] = useState('homeDelivery');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [deliveryFlow, setDeliveryFlow] = useState('restaurantToCustomer');
  const [distanceWiseDelivery, setDistanceWiseDelivery] = useState(false);
  const [onDemandTemplate, setOnDemandTemplate] = useState('Food Delivery');
  const [scheduledTemplate, setScheduledTemplate] = useState('Order Details');
  const [freeDelivery, setFreeDelivery] = useState(false);
  const [freeDeliveryAmount, setFreeDeliveryAmount] = useState('');

  const [merchantDeliveryManagement, setMerchantDeliveryManagement] = useState(false);
  const [externalDeliveryCharge, setExternalDeliveryCharge] = useState(false);
  const [trackingLinkConfig, setTrackingLinkConfig] = useState(false);
  const [deliveryCharge, setDeliveryCharge] = useState('');
  const [merchantWiseDelivery, setMerchantWiseDelivery] = useState(false);
  const [etaEnabled, setEtaEnabled] = useState(false);
  const [mapprApiKey, setMapprApiKey] = useState('');
  const [staticAddresses, setStaticAddresses] = useState(false);
  const [tipEnabled, setTipEnabled] = useState(false);
  const [minTipPercent, setMinTipPercent] = useState('');
  const [tipType, setTipType] = useState('');
  const [allowManualTip, setAllowManualTip] = useState(false);
  const [tipOptions, setTipOptions] = useState(false);




const [merchants, setMerchants] = useState([
  { id: 1, name: "meatshop", deliveryCharge: 0, status: false, dynamicCharge: false },
  { id: 2, name: "resrt", deliveryCharge: 0, status: false, dynamicCharge: false },
  // Add more merchants as needed
]);

const [selectedMerchant, setSelectedMerchant] = useState(null);
const [showMerchantModal, setShowMerchantModal] = useState(false);
const [actionType, setActionType] = useState('');


const [templateOptions, setTemplateOptions] = useState([]);
const [onDemandTemplateId, setOnDemandTemplateId] = useState("");
const [scheduledTemplateId, setScheduledTemplateId] = useState("");







  const handleDeliveryModeChange = (mode) => {
    setDeliveryModes({
      ...deliveryModes,
      [mode]: !deliveryModes[mode]
    });
  };

  const deliveryModeOptions = [
    { value: 'virtualMeet', label: 'Virtual Meet' },
    { value: 'homeDelivery', label: 'Home delivery' },
    { value: 'pickAndDrop', label: 'Pick And Drop' }
  ];



  const tipTypeOptions = [
    { value: 'fixed', label: 'Fixed Amount' },
    { value: 'percentage', label: 'Percentage' }
  ];




  const handleMerchantAction = (merchant, action) => {
  setSelectedMerchant(merchant);
  setActionType(action);
  setShowMerchantModal(true);
};






const handleSaveDeliverySettings = async () => {
  const settingsData = {
    deliveryModes,
    defaultDeliveryMode,
    deliveryTime: Number(deliveryTime),
    deliveryFlow,
    distanceWiseDelivery,
    onDemandTemplate,
    scheduledTemplate,
    freeDelivery,
    freeDeliveryAmount: Number(freeDeliveryAmount),
    merchantDeliveryManagement,
    externalDeliveryCharge,
    trackingLinkConfig,
    deliveryCharge: Number(deliveryCharge),
    merchantWiseDelivery,
    etaEnabled,
    mapprApiKey,
    staticAddresses,
    tipSettings: {
      tipEnabled,
      minTipPercent: Number(minTipPercent),
      tipType,
      allowManualTip,
      tipOptions
    }
  };

  try {
    const result = await createOrUpdateGlobalDeliverySettings(settingsData);
  
    toast.success("Settings saved successfully ⚙️");
    console.log(result);
  } catch (error) {
    console.error("Failed to save settings", error);
    alert("Failed to save delivery settings ❌");
  }
};



useEffect(() => {
  const fetchSettings = async () => {
    try {
      const result = await getGlobalDeliverySettings();
      const settings = result.data;

      // Populate all state values with fetched settings
      if (settings) {
        setDeliveryModes(settings.deliveryModes);
        setDefaultDeliveryMode(settings.defaultDeliveryMode);
        setDeliveryTime(settings.deliveryTime);
        setDeliveryFlow(settings.deliveryFlow);
        setDistanceWiseDelivery(settings.distanceWiseDelivery);
        setOnDemandTemplate(settings.onDemandTemplate);
        setScheduledTemplate(settings.scheduledTemplate);
        setFreeDelivery(settings.freeDelivery);
        setFreeDeliveryAmount(settings.freeDeliveryAmount);
        setMerchantDeliveryManagement(settings.merchantDeliveryManagement);
        setExternalDeliveryCharge(settings.externalDeliveryCharge);
        setTrackingLinkConfig(settings.trackingLinkConfig);
        setDeliveryCharge(settings.deliveryCharge);
        setMerchantWiseDelivery(settings.merchantWiseDelivery);
        setEtaEnabled(settings.etaEnabled);
        setMapprApiKey(settings.mapprApiKey);
        setStaticAddresses(settings.staticAddresses);

        setTipEnabled(settings.tipSettings.tipEnabled);
        setMinTipPercent(settings.tipSettings.minTipPercent);
        setTipType(settings.tipSettings.tipType);
        setAllowManualTip(settings.tipSettings.allowManualTip);
        setTipOptions(settings.tipSettings.tipOptions);
      }

    } catch (error) {
      console.error("Failed to fetch delivery settings", error);
    }
  };



  const fetchTemplates = async () => {
  try {
    const result = await getAllTemplates();
    setTemplateOptions(result.templates); // or result.data if your API response is like { data: [...] }
  } catch (error) {
    console.error("Failed to fetch templates", error);
  }
};

fetchTemplates();

  fetchSettings();
}, []);








  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Header Section */}
        <div className="flex items-center p-6 border-b border-gray-200">
          <div className="mr-4 bg-blue-50 p-3 rounded-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex-grow">
            <h1 className="text-2xl font-bold text-gray-800">Delivery Settings</h1>
            <p className="text-gray-500 mt-1">Configure delivery options for your platform</p>
          </div>
        </div>

        {/* Delivery Modes Section */}
        <section className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-gray-800">Delivery Modes</h3>
              <p className="text-gray-500 text-sm mt-1">
                Select the Delivery modes that will be available on your platform.
              </p>
            </div>
            <div className="md:w-2/3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {deliveryModeOptions.map((option) => (
                  <div key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      id={option.value}
                      checked={deliveryModes[option.value]}
                      onChange={() => handleDeliveryModeChange(option.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={option.value} className="ml-2 text-gray-700">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Delivery Mode:</label>
                <select
                  value={defaultDeliveryMode}
                  onChange={(e) => setDefaultDeliveryMode(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {deliveryModeOptions.filter(opt => deliveryModes[opt.value]).map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end gap-3">
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Save
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Delivery Time Section */}
        <section className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-gray-800">Delivery Time</h3>
              <p className="text-gray-500 text-sm mt-1">
                Enter the default time taken for delivery of an order.
              </p>
            </div>
            <div className="md:w-2/3">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Time (In Minutes)
                  <span className="text-blue-500 ml-1 cursor-pointer" title="Info">
                    <i className="fas fa-info-circle"></i>
                  </span>
                </label>
                <input
                  type="number"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  placeholder="Enter delivery time"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" disabled>
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" disabled>
                  Save
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Delivery Flow Section */}
        <section className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-gray-800">Delivery flow by TOOKAN</h3>
              <p className="text-gray-500 text-sm mt-1">
                Select how the delivery flow will work in TOOKAN.
              </p>
            </div>
            <div className="md:w-2/3">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-700">Restaurants to Customer</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deliveryFlow === 'customerToRestaurant'}
                    onChange={() => setDeliveryFlow(
                      deliveryFlow === 'restaurantToCustomer' 
                        ? 'customerToRestaurant' 
                        : 'restaurantToCustomer'
                    )}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <span className="text-gray-700">Customer to Restaurants</span>
              </div>
            </div>
          </div>
        </section>

        {/* Distance Wise Delivery Section */}
        <section className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-gray-800">Distance Wise Delivery</h3>
            </div>
            <div className="md:w-2/3">
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-600">
                  Delivery charges will be calculated based on the parameters defined in the 'Order Details' template on TOOKAN.
                </p>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={distanceWiseDelivery}
                    onChange={() => setDistanceWiseDelivery(!distanceWiseDelivery)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              {distanceWiseDelivery && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">On Demand Orders</label>
                    <select
                      value={onDemandTemplate}
                      onChange={(e) => setOnDemandTemplate(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      {templateOptions.map(option => (
                        <option key={option._id} value={option._id}>{option.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Orders</label>
                    <select
                      value={scheduledTemplate}
                      onChange={(e) => setScheduledTemplate(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                       {templateOptions.map(option => (
                        <option key={option._id} value={option._id}>{option.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex justify-end">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Update
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>



        <section className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-gray-800">Free Delivery</h3>
              <p className="text-gray-500 text-sm mt-1">
                Enable free delivery options for your platform.
              </p>
            </div>
            <div className="md:w-2/3">
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-600">
                  Enable this toggle to activate the option to waive off Delivery charges where delivery is by admin.
                  <br />
                  (Make sure your apps are updated)
                </p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={freeDelivery}
                    onChange={() => setFreeDelivery(!freeDelivery)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              {freeDelivery && (
                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cart subtotal amount for free Delivery.
                      <span className="text-blue-500 ml-1 cursor-pointer" title="Info">
                        <i className="fas fa-info-circle"></i>
                      </span>
                    </label>
                    <input
                      type="number"
                      value={freeDeliveryAmount}
                      onChange={(e) => setFreeDeliveryAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                      Cancel
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>


        {/* Toggle Sections */}
        {[
         
          {
            title: "Merchant Delivery Management by TOOKAN",
            description: "Turn on the toggle, to allow the stores manage their Delivery operations by tracking vehicles, optimizing routes and automating dispatch.",
            checked: merchantDeliveryManagement,
            onChange: setMerchantDeliveryManagement
          },
          {
            title: "External Delivery charge",
            description: "By enabling this you can integrate a 3rd party API to calculate your Delivery charge based on a variety of factors.",
            checked: externalDeliveryCharge,
            onChange: setExternalDeliveryCharge
          },
          {
            title: "Tracking Link Configuration",
            description: "Enable this to show tracking link only after the Orders Pickup is done.",
            checked: trackingLinkConfig,
            onChange: setTrackingLinkConfig
          },
          {
            title: "Estimate Time of Arrival",
            description: "Enable this toggle to inform your customers about the expected time of arrival of their order.",
            checked: etaEnabled,
            onChange: setEtaEnabled,
            extraContent: etaEnabled && (
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mappr API Key</label>
                  <input
                    type="text"
                    value={mapprApiKey}
                    onChange={(e) => setMapprApiKey(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" disabled>
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" disabled>
                    Save
                  </button>
                </div>
              </div>
            )
          },
          {
            title: "Static Addresses",
            description: "Enable this if you are delivering to only particular locations.",
            checked: staticAddresses,
            onChange: setStaticAddresses
          }
        ].map((section, index) => (
          <section key={index} className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 mb-4 md:mb-0">
                <h3 className="text-lg font-semibold text-gray-800">{section.title}</h3>
              </div>
              <div className="md:w-2/3">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600 flex-grow mr-4">{section.description}</p>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={section.checked}
                      onChange={() => section.onChange(!section.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                {section.extraContent}
              </div>
            </div>
          </section>
        ))}





   

        {/* Delivery Charge Section */}
        <section className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-gray-800">Delivery charge</h3>
              <p className="text-gray-500 text-sm mt-1">
                Enter the default Delivery charge for any order.
              </p>
            </div>
            <div className="md:w-2/3">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery charge</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input
                    type="number"
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(e.target.value)}
                    placeholder="Enter delivery charges"
                    className="w-full p-2.5 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" disabled>
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" disabled>
                  Save
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Merchant Wise Delivery Section */}
        <section className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-gray-800">Merchant wise Delivery charge</h3>
            </div>
            <div className="md:w-2/3">
              <div className="flex justify-between items-center">
                <p className="text-gray-600">
                  Enable this to define Delivery charge at Restaurants level.
                </p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={merchantWiseDelivery}
                    onChange={() => setMerchantWiseDelivery(!merchantWiseDelivery)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
             {merchantWiseDelivery && (
  <div className="mt-6">
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Table header with search */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>
      
      {/* Merchant table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Store Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Delivery charge
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dynamic delivery charge
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {merchants.map((merchant) => (
              <tr key={merchant.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                  <a href={`/merchants/merchant-details/${merchant.id}`} target="_blank" rel="noopener noreferrer">
                    {merchant.name}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {merchant.deliveryCharge}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={merchant.status}
                      onChange={() => {
                        const updated = merchants.map(m => 
                          m.id === merchant.id ? {...m, status: !m.status} : m
                        );
                        setMerchants(updated);
                      }}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={merchant.dynamicCharge}
                      onChange={() => {
                        const updated = merchants.map(m => 
                          m.id === merchant.id ? {...m, dynamicCharge: !m.dynamicCharge} : m
                        );
                        setMerchants(updated);
                      }}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="relative inline-block text-left">
                    <div>
                      <button 
                        type="button" 
                        className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={() => setShowMerchantModal(true)}
                      >
                        Actions
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{merchants.length}</span> of <span className="font-medium">{merchants.length}</span> entries
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50" disabled>
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                1
              </button>
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50" disabled>
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
    
    {/* Merchant Action Modal */}
    {showMerchantModal && (
      <div className="fixed z-10 inset-0 overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                {actionType === 'deliveryTemplate' && 'Set Delivery Template'}
                {actionType === 'earningTemplate' && 'Set Earning Template'}
                {actionType === 'editCharge' && 'Edit Delivery Charge'}
              </h3>
              {/* Add form fields based on actionType */}
              <div className="mt-2">
                {actionType === 'editCharge' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Delivery Charge</label>
                    <input
                      type="number"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={selectedMerchant?.deliveryCharge || ''}
                      onChange={(e) => {
                        const updated = merchants.map(m => 
                          m.id === selectedMerchant.id 
                            ? {...m, deliveryCharge: e.target.value} 
                            : m
                        );
                        setMerchants(updated);
                      }}
                    />
                  </div>
                )}
                {(actionType === 'deliveryTemplate' || actionType === 'earningTemplate') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Template</label>
                    <select
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      {templateOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => setShowMerchantModal(false)}
              >
                Save
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => setShowMerchantModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
)}
            </div>
          </div>
        </section>

        {/* Tip Section */}
        <section className="p-6">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-gray-800">Tip</h3>
              <p className="text-gray-500 text-sm mt-1">
                Configure the minimum tip amount on delivery across all your merchants.
              </p>
            </div>
            <div className="md:w-2/3">
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-600">
                  You can configure the minimum tip amount on delivery across all your merchants on the platform.
                </p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tipEnabled}
                    onChange={() => setTipEnabled(!tipEnabled)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              {tipEnabled && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Tip Percent <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={minTipPercent}
                      onChange={(e) => setMinTipPercent(e.target.value)}
                      placeholder="Minimum Tip Percent"
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Tip Type</label>
                    <select
                      value={tipType}
                      onChange={(e) => setTipType(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="">Select Tip Type</option>
                      {tipTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        Allow Customer to enter Tip manually
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allowManualTip}
                          onChange={() => setAllowManualTip(!allowManualTip)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">(Always in fixed amount)</p>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        Give Tip Options
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tipOptions}
                          onChange={() => setTipOptions(!tipOptions)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" disabled>
                      Cancel
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" disabled>
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>


        <div className="p-6 border-t flex justify-end">
  <button
    onClick={handleSaveDeliverySettings}
    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
  >
    Save Settings
  </button>
</div>
      </div>
    </div>
  );
};

export default DeliverySettings;