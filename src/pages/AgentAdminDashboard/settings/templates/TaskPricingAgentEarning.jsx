import React, { useState } from 'react';

const TaskPricingAgentEarningModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    decimal_places: 2,
    basicearningState: 1, // 1 for Agent earning, 2 for Task Pricing
    applyState1: false,
    fleet_traversed_path: true,
    disable_pickup_calculation: false,
    googleTravelModes: 1,
    max_amount: '',
    surge: {
      dynamic_surge: false,
      selectedRuleName: ''
    },
    rangeBased: {
      val: false
    },
    base: {
      fare: '',
      surge: ''
    },
    duration: {
      charge: '',
      base_duration_fee: ''
    },
    distance: {
      fare: '',
      base_distance_fee: ''
    },
    waiting_time_data: {
      waiting_fare: '',
      base_waiting_time: ''
    },
    commission: {
      charge: ''
    },
    task_failed: {
      value: false
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
        <div className="p-6">
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b">
            <h3 className="text-xl font-bold text-gray-800">Task Pricing & Agent earning</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Modal Body */}
          <div className="mt-4">
            <form onSubmit={handleSubmit}>
              {/* Rule Name */}
              <div className="mb-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Rule Name*"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Set Decimal Places (Enter 2 for 99.99 or 3 for 99.999)
                  </label>
                  <input
                    type="number"
                    name="decimal_places"
                    value={formData.decimal_places}
                    onChange={handleChange}
                    min="0"
                    max="4"
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              {/* Apply To */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Apply To</label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="1"
                      checked={formData.basicearningState === 1}
                      onChange={() => handleNestedChange('', 'basicearningState', 1)}
                      name="basicearningState"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Agent earning</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="2"
                      checked={formData.basicearningState === 2}
                      onChange={() => handleNestedChange('', 'basicearningState', 2)}
                      name="basicearningState"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Task Pricing</span>
                  </label>
                </div>
              </div>
              
              {/* Task Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Apply To</label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value={false}
                      checked={!formData.applyState1}
                      onChange={() => handleNestedChange('', 'applyState1', false)}
                      name="applyState1"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">All Tasks</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value={true}
                      checked={formData.applyState1}
                      onChange={() => handleNestedChange('', 'applyState1', true)}
                      name="applyState1"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Selected Tasks</span>
                  </label>
                </div>
              </div>
              
              {/* Range Based Toggle */}
              <div className="flex items-center mb-6">
                <label className="block text-sm font-medium text-gray-700 mr-2">
                  Enable Rules for Distance Ranges
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.rangeBased.val}
                    onChange={(e) => handleNestedChange('rangeBased', 'val', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              {/* Additions Section */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-1">Additions</h4>
                <p className="text-sm text-gray-500 mb-4">Fare earned by the Agent for each task</p>
                
                {!formData.rangeBased.val && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      {/* Base Fare */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Base Fare
                          <span className="ml-1 text-gray-500" title="A flat fare charged at the beginning of every task">
                            <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.base.fare}
                            onChange={(e) => handleNestedChange('base', 'fare', e.target.value)}
                            className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                          <span className="absolute right-3 top-2 text-gray-500">¤</span>
                        </div>
                      </div>
                      
                      {/* Duration Fare */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration Fare
                          <span className="ml-1 text-gray-500" title="Fare charged for each minute after base duration">
                            <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.duration.charge}
                            onChange={(e) => handleNestedChange('duration', 'charge', e.target.value)}
                            className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                          <span className="absolute right-3 top-2 text-gray-500">¤/min</span>
                        </div>
                      </div>
                      
                      {/* Distance Fare */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Distance Fare
                          <span className="ml-1 text-gray-500" title="Fee charged for each km after base distance">
                            <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.distance.fare}
                            onChange={(e) => handleNestedChange('distance', 'fare', e.target.value)}
                            className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                          <span className="absolute right-3 top-2 text-gray-500">¤/km</span>
                        </div>
                      </div>
                      
                      {/* Waiting Fare */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Waiting Fare
                          <span className="ml-1 text-gray-500" title="Fare charged per min of waiting time after base waiting time">
                            <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.waiting_time_data.waiting_fare}
                            onChange={(e) => handleNestedChange('waiting_time_data', 'waiting_fare', e.target.value)}
                            className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                          <span className="absolute right-3 top-2 text-gray-500">¤/min</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      {/* Surge */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Surge
                          <span className="ml-1 text-gray-500" title="The factor to be multiplied to the total fare in case of high demand">
                            <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.base.surge}
                            onChange={(e) => handleNestedChange('base', 'surge', e.target.value)}
                            className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                            disabled={formData.surge.dynamic_surge}
                            required
                          />
                          <span className="absolute right-3 top-2 text-gray-500">X</span>
                        </div>
                      </div>
                      
                      {/* Base Duration */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Base Duration
                          <span className="ml-1 text-gray-500" title="The initial duration which will be covered in base fare and won't be charged extra">
                            <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.duration.base_duration_fee}
                            onChange={(e) => handleNestedChange('duration', 'base_duration_fee', e.target.value)}
                            className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                          <span className="absolute right-3 top-2 text-gray-500">min</span>
                        </div>
                      </div>
                      
                      {/* Base Distance */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Base Distance
                          <span className="ml-1 text-gray-500" title="The initial distance which will be covered in base fare and won't be charged extra">
                            <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.distance.base_distance_fee}
                            onChange={(e) => handleNestedChange('distance', 'base_distance_fee', e.target.value)}
                            className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                          <span className="absolute right-3 top-2 text-gray-500">km</span>
                        </div>
                      </div>
                      
                      {/* Base Waiting time */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Base Waiting time
                          <span className="ml-1 text-gray-500" title="The initial waiting time which will be covered in base fare and won't be charged extra">
                            <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.waiting_time_data.base_waiting_time}
                            onChange={(e) => handleNestedChange('waiting_time_data', 'base_waiting_time', e.target.value)}
                            className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                          <span className="absolute right-3 top-2 text-gray-500">min</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {/* Surge Criteria */}
                {!formData.rangeBased.val && (
                  <div className="flex items-center mb-6">
                    <label className="block text-sm font-medium text-gray-700 mr-2">Surge Criteria:</label>
                    <div className="flex items-center">
                      <label className="inline-flex items-center cursor-pointer mr-2">
                        <input
                          type="checkbox"
                          checked={formData.surge.dynamic_surge}
                          onChange={(e) => handleNestedChange('surge', 'dynamic_surge', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        Dynamic Surge 
                        <span className="ml-1 text-gray-500" title="To schedule Surge timings, enable Dynamic Surge toggle and define rules in Side Menu > Surge Tab.">
                          <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Path Calculation */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Path Calculation:</label>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <label className="inline-flex items-center cursor-pointer mr-2">
                        <input
                          type="checkbox"
                          checked={formData.fleet_traversed_path}
                          onChange={(e) => handleNestedChange('', 'fleet_traversed_path', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        Calculate By Original Distance 
                        <span className="ml-1 text-gray-500" title="If this option is disabled, then pricing/earning calculates based on estimated distance and time between agent start location and task location else it calculates as per actual travelled distance and time by agent.">
                          <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <label className="inline-flex items-center cursor-pointer mr-2">
                        <input
                          type="checkbox"
                          checked={formData.disable_pickup_calculation}
                          onChange={(e) => handleNestedChange('', 'disable_pickup_calculation', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        Calculate By Pickup & Delivery Location 
                        <span className="ml-1 text-gray-500" title="The pricing & earning will calculate as per the estimate distance between the Pickup and Delivery locations and all calculations will show in Delivery Task">
                          <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Deductions Section */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-1">Deductions</h4>
                <p className="text-sm text-gray-500 mb-4">Commission charged to the Agent for each task</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deduction
                      <span className="ml-1 text-gray-500" title="Percentage of total fare deducted from the Agent earning">
                        <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.commission.charge}
                        onChange={(e) => handleNestedChange('commission', 'charge', e.target.value)}
                        className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <span className="absolute right-3 top-2 text-gray-500">%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Task Failure Earning (only for Agent earning) */}
              {formData.basicearningState === 1 && (
                <div className="flex items-center mb-6">
                  <label className="inline-flex items-center cursor-pointer mr-2">
                    <input
                      type="checkbox"
                      checked={formData.task_failed.value}
                      onChange={(e) => handleNestedChange('task_failed', 'value', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <span className="text-sm font-medium text-gray-700">
                    Earning at Task failures
                    <span className="ml-1 text-gray-500" title="Enable this to calculate the Agent's earning for an individual task when the task is marked failed by the Agent.">
                      <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  </span>
                </div>
              )}
              
              {/* Max Limit Section */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-1">Max Limit</h4>
                <p className="text-sm text-gray-500 mb-4">Set max limit for Earning/Pricing</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Limit
                      <span className="ml-1 text-gray-500" title="Maximum Earning/Pricing amount will be calculated according to the max limit irrespective of the Fare settings.e.g: If Earning/Pricing calculated as per Fare setting is $200 and Max Limit is $100 then, the total amount will be $100">
                        <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.max_amount}
                        onChange={(e) => handleNestedChange('', 'max_amount', e.target.value)}
                        className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="absolute right-3 top-2 text-gray-500">¤</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Form Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskPricingAgentEarningModal;