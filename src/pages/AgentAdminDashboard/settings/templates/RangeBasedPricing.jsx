import React, { useState } from 'react';
import { FaAngleDown, FaTrash, FaInfoCircle } from 'react-icons/fa';

const RangeBasedPricing = ({ 
  ranges = [], 
  setRanges, 
  currencySymbol = '¤',
  minDistance = 1,
  maxDistance = 100000,
  surgeRules = []
}) => {
  const [activeKey, setActiveKey] = useState('0');
  
  const handleAddRange = () => {
    const newRange = {
      isOpen: false,
      distanceLimit: '',
      base: { fare: '', surge: '' },
      duration: { charge: '', baseDuration: '' },
      distance: { fare: '', baseDistance: '' },
      waitingTime: { fare: '', baseWaiting: '' },
      surge: { dynamic: false, selectedRule: '' }
    };
    setRanges([...ranges.slice(0, -1), newRange, ranges[ranges.length - 1]]);
  };

  const handleDeleteRange = (index) => {
    if (ranges.length <= 2) return; // Keep at least one custom + default
    setRanges([...ranges.slice(0, index), ...ranges.slice(index + 1)]);
  };

  const handleInputChange = (index, field, value) => {
    const newData = [...ranges];
    const fieldParts = field.split('.');
    
    if (fieldParts.length === 2) {
      newData[index][fieldParts[0]][fieldParts[1]] = value;
    } else {
      newData[index][field] = value;
    }
    
    setRanges(newData);
  };

  const toggleAccordion = (index) => {
    setActiveKey(activeKey === String(index) ? '' : String(index));
  };

  return (
    <div className="space-y-4">
      {ranges.map((range, index) => (
        <div key={index} className="border rounded-lg overflow-hidden">
          <button
            type="button"
            className="w-full p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
            onClick={() => toggleAccordion(index)}
          >
            <div className="flex items-center">
              <FaAngleDown className={`mr-2 transition-transform ${activeKey === String(index) ? 'transform rotate-180' : ''}`} />
              {range.isDefault ? (
                <span className="font-medium">Default</span>
              ) : (
                <>
                  <span>Distance less than&nbsp;</span>
                  <input
                    type="number"
                    className="w-24 p-1 border rounded inline-block"
                    value={range.distanceLimit}
                    onChange={(e) => handleInputChange(index, 'distanceLimit', e.target.value)}
                    min={minDistance}
                    max={maxDistance}
                    placeholder="Enter Range"
                  />
                  <span>&nbsp;km</span>
                </>
              )}
            </div>
            {!range.isDefault && (
              <FaTrash 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteRange(index);
                }} 
                className="text-red-500 hover:text-red-700 cursor-pointer"
              />
            )}
          </button>
          
          <div className={`${activeKey === String(index) ? 'block' : 'hidden'} p-4 border-t`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Base Fare */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Base Fare
                  <FaInfoCircle 
                    className="ml-2 text-gray-400" 
                    title="A flat fare charged at the beginning of every task" 
                  />
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    value={range.base.fare}
                    onChange={(e) => handleInputChange(index, 'base.fare', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                  <span className="ml-2">{currencySymbol}</span>
                </div>
              </div>
              
              {/* Duration Fare */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Duration Fare
                  <FaInfoCircle 
                    className="ml-2 text-gray-400" 
                    title="Fare charged for each minute after base duration" 
                  />
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    value={range.duration.charge}
                    onChange={(e) => handleInputChange(index, 'duration.charge', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                  <span className="ml-2">{currencySymbol}/min</span>
                </div>
              </div>
              
              {/* Distance Fare */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Distance Fare
                  <FaInfoCircle 
                    className="ml-2 text-gray-400" 
                    title="Fee charged for each km after base distance" 
                  />
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    value={range.distance.fare}
                    onChange={(e) => handleInputChange(index, 'distance.fare', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                  <span className="ml-2">{currencySymbol}/km</span>
                </div>
              </div>
              
              {/* Waiting Fare */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Waiting Fare
                  <FaInfoCircle 
                    className="ml-2 text-gray-400" 
                    title="Fare charged per min of waiting time after base waiting time" 
                  />
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    value={range.waitingTime.fare}
                    onChange={(e) => handleInputChange(index, 'waitingTime.fare', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                  <span className="ml-2">{currencySymbol}/min</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Surge */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Surge
                  <FaInfoCircle 
                    className="ml-2 text-gray-400" 
                    title="The factor to be multiplied to the total fare in case of high demand" 
                  />
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    value={range.base.surge}
                    onChange={(e) => handleInputChange(index, 'base.surge', e.target.value)}
                    min="1"
                    step="0.1"
                    disabled={range.surge.dynamic}
                  />
                  <span className="ml-2">X</span>
                </div>
              </div>
              
              {/* Base Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Base Duration
                  <FaInfoCircle 
                    className="ml-2 text-gray-400" 
                    title="The initial duration which will be covered in base fare" 
                  />
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    value={range.duration.baseDuration}
                    onChange={(e) => handleInputChange(index, 'duration.baseDuration', e.target.value)}
                    min="0"
                  />
                  <span className="ml-2">min</span>
                </div>
              </div>
              
              {/* Base Distance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Base Distance
                  <FaInfoCircle 
                    className="ml-2 text-gray-400" 
                    title="The initial distance which will be covered in base fare" 
                  />
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    value={range.distance.baseDistance}
                    onChange={(e) => handleInputChange(index, 'distance.baseDistance', e.target.value)}
                    min="0"
                    step="0.1"
                  />
                  <span className="ml-2">km</span>
                </div>
              </div>
              
              {/* Base Waiting time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Base Waiting time
                  <FaInfoCircle 
                    className="ml-2 text-gray-400" 
                    title="The initial waiting time which will be covered in base fare" 
                  />
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    value={range.waitingTime.baseWaiting}
                    onChange={(e) => handleInputChange(index, 'waitingTime.baseWaiting', e.target.value)}
                    min="0"
                  />
                  <span className="ml-2">min</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h5 className="font-medium mb-2">Surge Criteria:</h5>
              <div className="flex items-center">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={range.surge.dynamic}
                    onChange={(e) => handleInputChange(index, 'surge.dynamic', e.target.checked)}
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  <span className="ml-3 font-medium">Dynamic Surge</span>
                </label>
              </div>
              
              {range.surge.dynamic && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Surge Rule</label>
                  <select 
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    value={range.surge.selectedRule}
                    onChange={(e) => handleInputChange(index, 'surge.selectedRule', e.target.value)}
                  >
                    <option value="">Select Rule</option>
                    {surgeRules.map((rule, i) => (
                      <option key={i} value={rule.id || i}>
                        {rule.name || `Rule ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      
      <div className="mt-3">
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          onClick={handleAddRange}
          disabled={ranges.length >= 6} // Example limit
        >
          Add New Range
        </button>
      </div>
    </div>
  );
};

export default RangeBasedPricing;