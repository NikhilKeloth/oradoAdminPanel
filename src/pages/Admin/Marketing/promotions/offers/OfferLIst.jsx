import React, { useState, useEffect } from 'react';
import { Edit, ToggleLeft, ToggleRight, Search, Plus, Filter, Trash2,EyeOff,Eye,Loader } from 'lucide-react';
import apiClient from '../../../../../apis/apiClient/apiClient';
import { toast } from 'react-toastify';

const OfferList = ({ onEditOffer }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', or 'inactive'
const [deletingIds, setDeletingIds] = useState(new Set());
  // Fetch offers on component mount
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/offer-and-discount/offers');
        console.log(response)
        setOffers(response.data.offers);
      } catch (err) {
        console.error('Error fetching offers:', err);
        setError('Failed to load offers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

const [togglingIds, setTogglingIds] = useState(new Set());

const toggleOfferStatus = async (id) => {
  try {
    // Start loading state for this specific toggle
    setTogglingIds(prev => new Set(prev).add(id));
    
    // Optimistic UI update
    setOffers(prev => prev.map(offer => 
      offer._id === id 
        ? { ...offer, isActive: !offer.isActive }
        : offer
    ));
    
    // API call to toggle status
    await apiClient.patch(`/offer-and-discount/offers/${id}/toggle`);
    
    // Show success notification
    toast.success(`Offer ${offers.find(o => o._id === id).isActive ? 'deactivated' : 'activated'} successfully`);
  } catch (error) {
    console.error('Error toggling offer status:', error);
    
    // Revert UI on error
    setOffers(prev => prev.map(offer => 
      offer._id === id 
        ? { ...offer, isActive: !offer.isActive }
        : offer
    ));
    
    // Show error notification
    toast.error('Failed to update offer status. Please try again.');
  } finally {
    // End loading state
    setTogglingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }
};
  const deleteOffer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) {
      return;
    }

    try {
      setDeletingIds(prev => new Set(prev).add(id));
      await apiClient.delete(`/offer-and-discount/offers/${id}`);
      
      // Remove the offer from the list
      setOffers(prev => prev.filter(offer => offer._id !== id));
      toast.success('Offer deleted successfully');
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast.error('Failed to delete offer. Please try again.');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };
  const getOfferTypeDisplay = (offer) => {
    if (offer.type) {
      return offer.type.charAt(0).toUpperCase() + offer.type.slice(1);
    }
    return 'Unknown';
  };

  const getAppliesToDisplay = (offer) => {
    if (offer.applicableLevel === 'Restaurant') {
      return `${offer.applicableRestaurants?.length || 0} restaurants`;
    } else {
      return `${offer.applicableProducts?.length || 0} products`;
    }
  };

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (offer.description && offer.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && offer.isActive) ||
                         (statusFilter === 'inactive' && !offer.isActive);
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <div className="text-red-500 mb-2">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Offer List</h2>
          
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search offers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors w-64"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applies To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valid Until
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOffers.map((offer, index) => (
              <tr key={offer._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {index + 1}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{offer.title}</div>
                    {offer.description && (
                      <div className="text-sm text-gray-500">{offer.description}</div>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {getOfferTypeDisplay(offer)}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                    offer.applicableLevel === 'Restaurant'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {offer.applicableLevel}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getAppliesToDisplay(offer)}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    offer.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {offer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(offer.validTill).toLocaleDateString()}
                </td>
                
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onEditOffer(offer)}
            className="text-blue-600 hover:text-blue-900 transition-colors"
            title="Edit Offer"
          >
            <Edit className="w-4 h-4" />
          </button>
        <button
  onClick={() => toggleOfferStatus(offer._id)}
  disabled={togglingIds.has(offer._id)}
  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${
    offer.isActive
      ? 'bg-green-500 focus:ring-green-500'
      : 'bg-gray-300 focus:ring-gray-400'
  } ${togglingIds.has(offer._id) ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
  title={offer.isActive ? 'Deactivate' : 'Activate'}
  aria-label={offer.isActive ? 'Deactivate' : 'Activate'}
  aria-pressed={offer.isActive}
>
  <span
    className={`absolute inline-flex items-center justify-center w-4 h-4 transition-all duration-200 ease-in-out transform rounded-full shadow-sm ${
      offer.isActive
        ? 'translate-x-6 bg-white'
        : 'translate-x-1 bg-white'
    }`}
  >
    {togglingIds.has(offer._id) ? (
      <Loader className="w-3 h-3 animate-spin text-gray-400" />
    ) : offer.isActive ? (
      <Eye className="w-3 h-3 text-green-500" />
    ) : (
      <EyeOff className="w-3 h-3 text-gray-400" />
    )}
  </span>
</button>

          <button
            onClick={() => deleteOffer(offer._id)}
            disabled={deletingIds.has(offer._id)}
            className="text-red-600 hover:text-red-900 transition-colors"
            title="Delete Offer"
          >
            {deletingIds.has(offer._id) ? (
              <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredOffers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No offers found</div>
          <div className="text-gray-400 text-sm">
            {searchTerm ? 'Try adjusting your search criteria' : 'Create your first offer to get started'}
          </div>
        </div>
      )}

      {/* Pagination */}
      {filteredOffers.length > 0 && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to{' '}
              <span className="font-medium">{filteredOffers.length}</span> of{' '}
              <span className="font-medium">{offers.length}</span> results
            </div>
            
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
              </button>
              
              <button className="px-3 py-1 border border-blue-500 text-sm font-medium rounded-md text-blue-600 bg-blue-50">
                1
              </button>
              
              <button className="px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferList;