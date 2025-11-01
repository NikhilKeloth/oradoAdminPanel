import React, { useState, useEffect } from "react";
import { Gift, Award, Save, X, TrendingUp, Target, Info, Percent, CalendarDays, IndianRupee } from "lucide-react";
import { createLoyaltySettings, getLoyalitySettings } from "../../../../../apis/adminApis/adminFuntionsApi";
import { toast } from "react-toastify";

const CreateLoyaltyPoints = () => {
  const [loyaltyData, setLoyaltyData] = useState({
    earningCriteria: '',
    pointsPerAmount: '10',
    minOrderAmountForEarning: '50',
    maxEarningPoints: '500',
    expiryDurationDays: '365',
    redemptionCriteria: '',
    valuePerPoint: '1',
    minOrderAmountForRedemption: '100',
    minPointsForRedemption: '50',
    maxRedemptionPercent: '20'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await getLoyalitySettings();
      if (response?.data) {
        setLoyaltyData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch loyalty settings", error);
      toast.error("Failed to load loyalty settings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoyaltyData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await createLoyaltySettings(loyaltyData);
      toast.success("Loyalty settings saved successfully!");
      await fetchSettings();
    } catch (err) {
      console.error("Save failed", err);
      toast.error("Failed to save loyalty settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    fetchSettings();
    toast.info("Settings reset to previous values");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <h3 className="text-lg font-medium text-gray-700">Loading loyalty settings</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Loyalty Program Settings</h1>
            <p className="text-sm text-gray-500">Configure how customers earn and redeem points</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Earning Settings */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Points Earning Rules</h2>
                <p className="text-sm text-gray-500">Configure how customers accumulate points</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <InputField 
                label="Points per ₹100 spent" 
                name="pointsPerAmount" 
                value={loyaltyData.pointsPerAmount} 
                onChange={handleChange}
                icon={<Award className="w-4 h-4 text-gray-400" />}
                suffix="pts"
                helpText="Points awarded for every ₹100 spent"
              />
              
              <InputField 
                label="Minimum order value (₹)" 
                name="minOrderAmountForEarning" 
                value={loyaltyData.minOrderAmountForEarning} 
                onChange={handleChange}
                icon={<IndianRupee className="w-4 h-4 text-gray-400" />}
                helpText="Order must be at least this amount to earn points"
              />
              
              <InputField 
                label="Maximum points per order" 
                name="maxEarningPoints" 
                value={loyaltyData.maxEarningPoints} 
                onChange={handleChange}
                icon={<Award className="w-4 h-4 text-gray-400" />}
                suffix="pts"
                helpText="Cap on points earned in a single order"
              />
              
              <InputField 
                label="Points expiry period" 
                name="expiryDurationDays" 
                value={loyaltyData.expiryDurationDays} 
                onChange={handleChange}
                icon={<CalendarDays className="w-4 h-4 text-gray-400" />}
                suffix="days"
                helpText="Number of days before points expire"
              />
            </div>
          </div>

          {/* Redemption Settings */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Points Redemption Rules</h2>
                <p className="text-sm text-gray-500">Configure how customers use their points</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <InputField 
                label="Value per 1 point" 
                name="valuePerPoint" 
                value={loyaltyData.valuePerPoint} 
                onChange={handleChange}
                icon={<IndianRupee className="w-4 h-4 text-gray-400" />}
                prefix="₹"
                helpText="Monetary value of each point"
              />
              
              <InputField 
                label="Minimum points to redeem" 
                name="redemptionCriteria" 
                value={loyaltyData.redemptionCriteria} 
                onChange={handleChange}
                icon={<Award className="w-4 h-4 text-gray-400" />}
                suffix="pts"
                helpText="Minimum balance required for redemption"
              />
              
              <InputField 
                label="Minimum order value (₹)" 
                name="minOrderAmountForRedemption" 
                value={loyaltyData.minOrderAmountForRedemption} 
                onChange={handleChange}
                icon={<IndianRupee className="w-4 h-4 text-gray-400" />}
                helpText="Order must be at least this amount to redeem"
              />
              
              <InputField 
                label="Minimum redemption at once" 
                name="minPointsForRedemption" 
                value={loyaltyData.minPointsForRedemption} 
                onChange={handleChange}
                icon={<Award className="w-4 h-4 text-gray-400" />}
                suffix="pts"
                helpText="Minimum points that can be redeemed"
              />
              
              <InputField 
                label="Maximum redemption %" 
                name="maxRedemptionPercent" 
                value={loyaltyData.maxRedemptionPercent} 
                onChange={handleChange}
                icon={<Percent className="w-4 h-4 text-gray-400" />}
                suffix="%"
                helpText="Max % of order value redeemable"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 sticky bottom-0">
            <div className="flex justify-end space-x-3">
              <button 
                type="button" 
                onClick={handleReset}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Discard
              </button>
              <button 
                type="submit" 
                disabled={isSaving}
                className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-70"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, helpText, prefix, suffix, icon }) => (
  <div className="space-y-1">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="relative rounded-md shadow-sm">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
      )}
      {prefix && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500 text-sm">{prefix}</span>
        </div>
      )}
      <input
        type="number"
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${icon || prefix ? 'pl-10' : 'pl-3'} ${suffix ? 'pr-10' : 'pr-3'} py-2.5`}
      />
      {suffix && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-gray-500 text-sm">{suffix}</span>
        </div>
      )}
    </div>
    {helpText && (
      <p className="mt-1 text-xs text-gray-500 flex items-start">
        <Info className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0 text-gray-400" />
        <span>{helpText}</span>
      </p>
    )}
  </div>
);

export default CreateLoyaltyPoints;