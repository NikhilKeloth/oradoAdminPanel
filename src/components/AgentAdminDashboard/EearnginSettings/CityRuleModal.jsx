import { useState, useEffect } from "react";
import { X, DollarSign, Edit } from "lucide-react";

export default function CityRuleModal({ isOpen, onClose, onSave, initialData, mode = "create" }) {
  const [formData, setFormData] = useState({
    city: "",
    baseFee: 30,
    baseDistance: 3,
    perKmFee: 4,
    peakHourBonus: 15,
    rainBonus: 10,
    zoneBonus: 8
  });

  const cities = [
    "Mumbai",
    "Delhi", 
    "Bangalore",
    "Chennai",
    "Hyderabad",
    "Kolkata",
    "Pune",
    "Ahmedabad",
    "Jaipur",
    "Surat"
  ];

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Reset form if no initial data (create mode)
      setFormData({
        city: "",
        baseFee: 30,
        baseDistance: 3,
        perKmFee: 4,
        peakHourBonus: 15,
        rainBonus: 10,
        zoneBonus: 8
      });
    }
  }, [initialData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 shadow-lg">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                  {mode === "edit" ? <Edit className="w-5 h-5 text-white" /> : <DollarSign className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {mode === "edit" ? "Edit City Rule" : "Add New City Rule"}
                  </h2>
                  <p className="text-orange-100 text-sm">
                    {mode === "edit" ? "Update delivery fees and bonuses" : "Configure delivery fees and bonuses"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancel}
                className="text-orange-100 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-4">
          {/* City Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select City:
            </label>
            <select
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              disabled={mode === "edit"} // Disable editing city name in edit mode
            >
              <option value="">Choose a city...</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t pt-4">
            {/* Base Delivery Fee */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Delivery Fee (₹):
                </label>
                <input
                  type="number"
                  value={formData.baseFee}
                  onChange={(e) => handleInputChange('baseFee', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Distance (km):
                </label>
                <input
                  type="number"
                  value={formData.baseDistance}
                  onChange={(e) => handleInputChange('baseDistance', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Per km Fee */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Per km Fee beyond base dist: ₹
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={formData.perKmFee}
                  onChange={(e) => handleInputChange('perKmFee', Number(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <span className="text-sm text-gray-600">/km</span>
              </div>
            </div>
          </div>

          {/* Bonuses Section */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Bonuses:</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700">Peak Hour Bonus (₹):</label>
                <input
                  type="number"
                  value={formData.peakHourBonus}
                  onChange={(e) => handleInputChange('peakHourBonus', Number(e.target.value))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700">Rain Bonus (₹):</label>
                <input
                  type="number"
                  value={formData.rainBonus}
                  onChange={(e) => handleInputChange('rainBonus', Number(e.target.value))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700">Zone Bonus (₹):</label>
                <input
                  type="number"
                  value={formData.zoneBonus}
                  onChange={(e) => handleInputChange('zoneBonus', Number(e.target.value))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.city}
            className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            {mode === "edit" ? "Update Settings" : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}