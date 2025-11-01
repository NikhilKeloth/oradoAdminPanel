import { useState, useEffect } from 'react';
import { PlusCircle, Search, Filter, X } from 'lucide-react';
import PromoCodeModal from '../../../../../components/admin/Marketing/Promotions/Promocodes/PromoCodeModal';
import PromoCodeListTable from '../../../../../components/admin/Marketing/Promotions/Promocodes/PromoCodeListTable';
// Import updatePromoCode from your API file
import { getPromoCodes, createPromoCode, deletePromoCode, togglePromoCodeStatus, updatePromoCode } from '../../../../../apis/adminApis/promocodeApi';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { fetchRestaurantsDropdown } from '../../../../../apis/adminApis/adminFuntionsApi';
import { fetchCustomersList } from '../../../../../apis/adminApis/customerApi';
import EditPromoCodeModal from '../../../../../components/admin/Marketing/Promotions/Promocodes/EditPromocdoemodel';

const PromoCodesPage = () => {
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // For creation modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // For edit modal
  const [selectedPromo, setSelectedPromo] = useState(null); // The promo code selected for editing or creating

  const [isCreating, setIsCreating] = useState(false); // Flag to differentiate create/edit

  const [merchants, setMerchants] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    merchantSpecific: '',
    customerSpecific: '',
    searchQuery: '',
    validFrom: null,
    validTill: null
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPromoCodes();
    fetchCustomerAndMerchants();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      setLoading(true);
      const data = await getPromoCodes();
      setPromoCodes(data.data);
    } catch (error) {
      toast.error('Failed to fetch promo codes');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerAndMerchants = async () => {
    try {
      const resMerch = await fetchRestaurantsDropdown();
      const resCustomer = await fetchCustomersList();

      setCustomers(resCustomer.data.customers);
      setMerchants(resMerch.data);
    } catch (error) {
      toast.error('Failed to fetch merchant or customer data');
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setSelectedPromo(null); // Clear any previously selected promo for creation
    setIsModalOpen(true); // Open the creation modal
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this promo code?')) {
      try {
        await deletePromoCode(id);
        setPromoCodes(promoCodes.filter(promo => promo._id !== id));
        toast.success('Promo code deleted successfully');
      } catch (error) {
        toast.error('Failed to delete promo code');
      }
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    try {

      console.log(id)
      const updatedPromo = await togglePromoCodeStatus(id);
      setPromoCodes(promoCodes.map(promo =>
        promo._id === id ? { ...promo, isActive: updatedPromo.isActive } : promo
      ));
      toast.success(`Promo code ${updatedPromo.isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error('Failed to update promo code status');
    }
  };

  const handleUpdatePromoCode = async (promoData) => {
    try {
      if (!selectedPromo?._id) {
          throw new Error("Promo ID not found for update operation.");
      }

      const payload = {
        ...promoData,
        discountValue: Number(promoData.discountValue),
        minOrderValue: Number(promoData.minOrderValue),
        maxUsagePerCustomer: Number(promoData.maxUsagePerCustomer)
      };

      const updatedPromoResult = await updatePromoCode(selectedPromo._id, payload);
      // Assuming updatedPromoResult is the directly updated promo object from the API
      // If your API wraps the updated object in a 'data' property, use updatedPromoResult.data
      const updatedPromo = updatedPromoResult; // Or updatedPromoResult.data if your API response is { data: promoObject }

      setPromoCodes(promoCodes.map(promo =>
        promo._id === updatedPromo._id ? updatedPromo : promo // Correctly update the specific promo in the list
      ));
      // Crucially, update selectedPromo to ensure the modal shows fresh data on re-open
      setSelectedPromo(updatedPromo);

      toast.success('Promo code updated successfully');
      setIsEditModalOpen(false); // Close the edit modal
    } catch (error) {
      console.error("Error updating promo code:", error);
      toast.error(error.message || 'Failed to update promo code');
    }
  };

  const handleSubmit = async (promoData) => {
    try {
      const payload = {
        ...promoData,
        discountValue: Number(promoData.discountValue),
        minOrderValue: Number(promoData.minOrderValue),
        maxUsagePerCustomer: Number(promoData.maxUsagePerCustomer)
      };

      const newPromo = await createPromoCode(payload);
      setPromoCodes([...promoCodes, newPromo.data]);
      toast.success('Promo code created successfully');
      setIsModalOpen(false); // Close the creation modal
    } catch (error) {
      console.error("Error creating promo code:", error);
      toast.error(error.message || 'Failed to create promo code');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleDateChange = (date, field) => {
    setFilters({ ...filters, [field]: date });
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      merchantSpecific: '',
      customerSpecific: '',
      searchQuery: '',
      validFrom: null,
      validTill: null
    });
  };

  const filteredPromoCodes = promoCodes.filter(promo => {
    // Status filter
    if (filters.status && promo.isActive !== (filters.status === 'active')) {
      return false;
    }

    // Merchant specific filter
    if (filters.merchantSpecific &&
        (filters.merchantSpecific === 'yes') !== promo.isMerchantSpecific) {
      return false;
    }

    // Customer specific filter
    if (filters.customerSpecific &&
        (filters.customerSpecific === 'yes') !== promo.isCustomerSpecific) {
      return false;
    }

    // Search query filter
    if (filters.searchQuery &&
        !promo.code.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
      return false;
    }

    // Date range filters
    if (filters.validFrom && new Date(promo.validTill) < filters.validFrom) {
      return false;
    }

    if (filters.validTill && new Date(promo.validFrom) > filters.validTill) {
      return false;
    }

    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Promo Code Management</h1>
        <button
          onClick={handleCreate}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <PlusCircle className="mr-2" size={18} />
          Create New Promo Code
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by promo code..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.searchQuery}
              onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center ml-4 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Filter className="mr-2" size={18} />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Merchant Specific</label>
                <select
                  name="merchantSpecific"
                  value={filters.merchantSpecific}
                  onChange={handleFilterChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Specific</label>
                <select
                  name="customerSpecific"
                  value={filters.customerSpecific}
                  onChange={handleFilterChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                <DatePicker
                  selected={filters.validFrom}
                  onChange={(date) => handleDateChange(date, 'validFrom')}
                  selectsStart
                  startDate={filters.validFrom}
                  endDate={filters.validTill}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholderText="Select start date"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valid Till</label>
                <DatePicker
                  selected={filters.validTill}
                  onChange={(date) => handleDateChange(date, 'validTill')}
                  selectsEnd
                  startDate={filters.validFrom}
                  endDate={filters.validTill}
                  minDate={filters.validFrom}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholderText="Select end date"
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={clearFilters}
                className="flex items-center mr-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                <X className="mr-2" size={18} />
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      <PromoCodeListTable
        promoCodes={filteredPromoCodes}
        loading={loading}
        onEdit={(promo) => {
          setSelectedPromo(promo); // Set the promo to be edited
          setIsCreating(false); // Make sure to set isCreating to false
          setIsEditModalOpen(true); // Open the specific EditPromoCodeModal
        }}
        onDelete={handleDelete}
        onStatusToggle={handleStatusToggle}
      />

    {/* Modal for creating a new promo code */}
    <PromoCodeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit} // This will handle new promo creation
        promo={null} // No promo data for creation
        isCreating={true} // Explicitly set for this modal
        merchants={merchants}
        customers={customers}
      />

    {/* Modal for editing an existing promo code */}
    <EditPromoCodeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdatePromoCode} // This will handle promo updates
        promo={selectedPromo} // Pass the selected promo data for pre-filling
        merchants={merchants}
        customers={customers}
      />
    </div>
  );
};

export default PromoCodesPage;
