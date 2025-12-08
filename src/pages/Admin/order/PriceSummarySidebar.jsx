import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiRefreshCw } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://orado.online/backend';

const PriceSummarySidebar = ({ isVisible, order, cartId, triggerUpdate }) => {
  const [priceSummary, setPriceSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPriceSummary = async () => {
    if (!cartId || !order) return;
    
    try {
      setLoading(true);
      const requestData = {
        cartId: cartId,
        userId: order.customer?._id,
        tipAmount: 0,
        couponCode: "",
        flatDiscount: 0,
        latitude: order.deliveryLocation?.coordinates[1],
        longitude: order.deliveryLocation?.coordinates[0],
        loyaltyPointsToRedeem: 0,
        useLoyaltyPoints: false,
        useWallet: false,
        walletAmount: 0
      };

      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        `${API_BASE_URL}/order/pricesummary`,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setPriceSummary(response.data.data);
    } catch (error) {
      console.error('Error fetching price summary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible && cartId) {
      fetchPriceSummary();
    }
  }, [isVisible, cartId]);

  useEffect(() => {
    if (isVisible && cartId && triggerUpdate) {
      fetchPriceSummary();
    }
  }, [triggerUpdate]);

  if (!isVisible) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl border-l border-gray-200 z-40 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Price Summary</h3>
          <div className="flex items-center space-x-2">
            <button 
              onClick={fetchPriceSummary}
              disabled={loading}
              className="p-1 text-blue-500 hover:text-blue-700 disabled:opacity-50"
              title="Refresh"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-1">Updates automatically as you edit items</p>
      </div>
      
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Updating prices...</p>
          </div>
        ) : priceSummary ? (
          <div className="space-y-3 text-sm">
            {/* Items Total */}
            <div className="flex justify-between">
              <span className="text-gray-600">Items Total:</span>
              <span className="font-semibold">₹{priceSummary.subtotal?.toFixed(2)}</span>
            </div>
            
            {/* Discount */}
            {priceSummary.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-₹{priceSummary.discount?.toFixed(2)}</span>
              </div>
            )}
            
            {/* Delivery Fee */}
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee:</span>
              <span className="font-semibold">₹{priceSummary.deliveryFee?.toFixed(2)}</span>
            </div>
            
            {/* Packing Charges */}
            {priceSummary.totalPackingCharge > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Packing Charges:</span>
                <span className="font-semibold">₹{priceSummary.totalPackingCharge?.toFixed(2)}</span>
              </div>
            )}
            
            {/* Additional Charges */}
            {priceSummary.totalAdditionalCharges > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Additional Charges:</span>
                <span className="font-semibold">₹{priceSummary.totalAdditionalCharges?.toFixed(2)}</span>
              </div>
            )}
            
            {/* Tax */}
            {priceSummary.totalTaxAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tax:</span>
                <span className="font-semibold">₹{priceSummary.totalTaxAmount?.toFixed(2)}</span>
              </div>
            )}
            
            {/* Surge Fee */}
            {priceSummary.surgeFee > 0 && (
              <div className="flex justify-between text-orange-600">
                <span>Surge Fee:</span>
                <span className="font-semibold">₹{priceSummary.surgeFee?.toFixed(2)}</span>
              </div>
            )}
            
            {/* Tip */}
            {priceSummary.tipAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tip:</span>
                <span className="font-semibold">₹{priceSummary.tipAmount?.toFixed(2)}</span>
              </div>
            )}
            
            {/* Grand Total */}
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-gray-800">Grand Total:</span>
                <span className="text-lg font-bold text-blue-600">₹{priceSummary.finalAmount?.toFixed(2)}</span>
              </div>
            </div>
            
            {/* Distance */}
            <div className="text-xs text-gray-500 text-center mt-2">
              Delivery distance: {priceSummary.distanceKm} km
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Unable to fetch price summary</p>
            <button 
              onClick={fetchPriceSummary}
              className="mt-2 text-blue-500 hover:text-blue-700 text-sm"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceSummarySidebar;