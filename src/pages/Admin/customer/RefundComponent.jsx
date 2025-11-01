import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DollarSign, User, Package, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const RefundComponent = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    userId: '',
    orderId: '',
    amount: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Populate form with order data if it exists in location state
  useEffect(() => {
    if (location.state) {
      setFormData({
        userId: location.state.userId || '',
        orderId: location.state.orderId || '',
        amount: location.state.amount ? location.state.amount.toFixed(2) : '',
        description: location.state.description || ''
      });
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear previous results when user starts typing
    if (result || error) {
      setResult(null);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    // Validation
    if (!formData.userId || !formData.orderId || !formData.amount) {
      setError('User ID, Order ID, and Amount are required fields');
      return;
    }

    if (isNaN(formData.amount)) {
      setError('Please enter a valid amount');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('https://orado.work.gd/api/admin/wallet/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          userId: formData.userId,
          orderId: formData.orderId,
          amount: amount,
          description: formData.description
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult({
          message: data.message,
          walletBalance: data.walletBalance,
          transaction: data.transaction
        });
        // Reset form (but keep the order info)
        setFormData(prev => ({
          ...prev,
          amount: '',
          description: ''
        }));
      } else {
        setError(data.error || 'Failed to process refund');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-4 shadow-lg">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Process Refund</h1>
          <p className="text-gray-600">Credit refund amount to user's wallet</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Refund Details
            </h2>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User ID */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <User className="w-4 h-4 mr-2 text-orange-500" />
                  User ID
                </label>
                <input
                  type="text"
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Enter user ID"
                  required
                />
              </div>

              {/* Order ID */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Package className="w-4 h-4 mr-2 text-orange-500" />
                  Order ID
                </label>
                <input
                  type="text"
                  name="orderId"
                  value={formData.orderId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Enter order ID"
                  required
                />
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2 mt-6">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <DollarSign className="w-4 h-4 mr-2 text-orange-500" />
                Refund Amount (₹)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                step="0.01"
                min="0.01"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-lg font-semibold"
                placeholder="0.00"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2 mt-6">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <FileText className="w-4 h-4 mr-2 text-orange-500" />
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                placeholder="Enter refund reason or additional notes..."
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {result && (
              <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center mb-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                  <h3 className="text-lg font-semibold text-green-800">Refund Processed Successfully!</h3>
                </div>
                <div className="space-y-2 text-sm text-green-700">
                  <p><strong>Message:</strong> {result.message}</p>
                  <p><strong>Updated Wallet Balance:</strong> ₹{result.walletBalance?.toFixed(2)}</p>
                  {result.transaction && (
                    <p><strong>Transaction ID:</strong> {result.transaction._id}</p>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing Refund...
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5 mr-2" />
                  Process Refund
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">How it works:</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• The refund amount will be credited to the user's wallet balance</p>
            <p>• A transaction record will be created for audit purposes</p>
            <p>• Admin action will be logged with refund details</p>
            <p>• User will be notified of the wallet credit</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundComponent;