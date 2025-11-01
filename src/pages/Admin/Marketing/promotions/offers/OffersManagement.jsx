import React, { useState } from 'react';
import { Gift, List } from 'lucide-react';
import OfferForm from './OfferForm';
import OfferList from './OfferLIst';
import { createOffer, updateOffer } from '../../../../../apis/adminApis/offerAndDiscount'; // Import updateOffer
import { toast } from 'react-toastify';

const OffersManagement = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [editingOffer, setEditingOffer] = useState(null);

  const handleEditOffer = (offer) => {
    setEditingOffer(offer);
    setActiveTab('create');
  };

  const handleCancelEdit = () => {
    setEditingOffer(null);
  };

  const handleSaveSuccess = async (offerData) => {
    try {
      if (editingOffer) {
        // Update existing offer
        await updateOffer(editingOffer._id, offerData);
        toast.success("Offer updated successfully");
      } else {
        // Create new offer
        await createOffer(offerData);
        toast.success("Offer created successfully");
      }
      
      setEditingOffer(null);
      setActiveTab('list');
    } catch (error) {
      console.error('Error saving offer:', error);
      toast.error(error.response?.data?.message || 'Failed to save offer');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Gift className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Offers Management Dashboard</h1>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('create')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'create'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  {editingOffer ? 'Edit Offer' : 'Create Offer'}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('list')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'list'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <List className="w-4 h-4" />
                  Offer List
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'create' ? (
          <OfferForm
            key={editingOffer?._id || 'create'} // Important for resetting form state
            editingOffer={editingOffer}
            onCancel={handleCancelEdit}
            onSave={handleSaveSuccess}
          />
        ) : (
          <OfferList onEditOffer={handleEditOffer} />
        )}
      </div>
    </div>
  );
};

export default OffersManagement;