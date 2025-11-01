import { useEffect, useState } from 'react';
import AddTaxModal from './AddTaxModal';
import { fetchRestaurantsDropdown } from '../../../../../apis/adminApis/adminFuntionsApi';
import { createTax, getTaxes } from '../../../../../apis/adminApis/taxAndChargeApi';
import { getCities } from '../../../../../apis/adminApis/cityApi';

export default function TaxesFeesCharges() {
  const [selectedStore, setSelectedStore] = useState("");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const [allowMerchantTaxes, setAllowMerchantTaxes] = useState(false);
  const [showAddTaxModal, setShowAddTaxModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [allTaxes, setAllTaxes] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtered taxes based on type and restaurant
  const marketplaceTaxes = allTaxes.filter(tax => tax.taxType === 'Marketplace');
  const additionalCharges = allTaxes.filter(tax => tax.taxType === 'AdditionalCharge');
  const subscriptionTaxes = allTaxes.filter(tax => tax.taxType === 'Subscription');
  
  // Merchant taxes filtered by selected restaurant
  const merchantTaxes = allTaxes.filter(tax => 
    tax.taxType === 'Restaurant' && 
    (tax.restaurant === selectedRestaurantId || 
     tax.restaurants?.some(r => r._id === selectedRestaurantId))
  );

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [restaurantData, citiesData, taxesData] = await Promise.all([
          fetchRestaurantsDropdown(),
          getCities(),
          getTaxes()
        ]);
        
        setRestaurants(restaurantData.data);
        setCities(citiesData.data);
        setAllTaxes(taxesData.data);
        
        if (restaurantData.data.length > 0) {
          setSelectedStore(restaurantData.data[0].name);
          setSelectedRestaurantId(restaurantData.data[0]._id);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleRestaurantChange = (e) => {
    const selectedName = e.target.value;
    const selectedRestaurant = restaurants.find(r => r.name === selectedName);
    
    if (selectedRestaurant) {
      setSelectedStore(selectedName);
      setSelectedRestaurantId(selectedRestaurant._id);
    }
  };

  const handleSaveTax = async (taxData) => {
    try {
      const backendTaxData = {
        name: taxData.name,
        amount: parseFloat(taxData.amount),
        type: taxData.type === 'percentage' ? 'Percentage' : 'Fixed',
        appliedOn: taxData.applicableOn || (modalType === 'subscription' ? 'subscription' : undefined),
        taxType: mapTaxType(modalType),
        status: true,
      };

      if (modalType === 'merchant' && selectedRestaurantId) {
        backendTaxData.restaurant = selectedRestaurantId;
      }

      await createTax(backendTaxData);
      // Refresh the taxes list
      const res = await getTaxes();
      setAllTaxes(res.data);
      setShowAddTaxModal(false);
    } catch (error) {
      console.error('Failed to save tax:', error);
    }
  };

  const mapTaxType = (modalType) => {
    switch(modalType) {
      case "marketplace": return "Marketplace";
      case "merchant": return "Restaurant";
      case "additional": return "AdditionalCharge";
      case "subscription": return "Subscription";
      default: return "Marketplace";
    }
  };

  const handleAddTax = (type) => {
    setModalType(type);
    setShowAddTaxModal(true);
  };

  const handleCloseModal = () => {
    setShowAddTaxModal(false);
    setModalType("");
  };

  const toggleTaxStatus = async (taxId, currentStatus) => {
    try {
      // Here you would call an API to update the tax status
      // For now, we'll just update the local state
      setAllTaxes(allTaxes.map(tax => 
        tax._id === taxId ? {...tax, status: !currentStatus} : tax
      ));
    } catch (error) {
      console.error("Failed to update tax status:", error);
    }
  };

  const renderTaxRows = (taxes) => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan="7" className="py-8 text-center">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </td>
        </tr>
      );
    }

    if (taxes.length === 0) {
      return (
        <tr>
          <td colSpan="7" className="py-6 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-2 text-sm font-medium">No taxes found</p>
          </td>
        </tr>
      );
    }

    return taxes.map((tax) => (
      <tr key={tax._id} className="border-b hover:bg-gray-50 transition-colors">
        <td className="py-4 px-4 text-sm text-gray-700 font-mono">{tax._id.slice(-6)}</td>
        <td className="py-4 px-4 font-medium">{tax.name}</td>
        <td className="py-4 px-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            tax.type === 'Percentage' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
          }`}>
            {tax.amount}{tax.type === 'Percentage' ? '%' : ''}
          </span>
        </td>
        <td className="py-4 px-4 text-gray-600">{tax.type}</td>
        <td className="py-4 px-4 capitalize text-gray-600">{tax.appliedOn || '-'}</td>
        <td className="py-4 px-4">
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={tax.status} 
              onChange={() => toggleTaxStatus(tax._id, tax.status)} 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </td>
        <td className="py-4 px-4">
          <button className="text-gray-500 hover:text-gray-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </button>
        </td>
      </tr>
    ));
  };

  return (
    <div className="dashboard-content-container" style={{ marginTop: "70px" }}>
      <div className="content-container col-span-12 flex flex-col">
        <div className="col-span-12 p-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold ml-3">Taxes, Fees & Charges</h2>
            </div>
            
            <div className="text-sm bg-blue-50 p-3 rounded-lg max-w-md">
              <p className="text-blue-800">💡 Make sure taxes aren't duplicated under the same name on the platform</p>
              <p className="text-red-500 font-medium mt-1">⚠️ Two taxes under the same name cannot coexist</p>
            </div>
          </div>

          {/* Marketplace Level Taxes */}
          <section className="mb-10 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-4 border-b bg-gray-50">
              <div className="mb-3 md:mb-0">
                <h3 className="text-lg font-semibold text-gray-800">Marketplace Level Taxes</h3>
                <p className="text-sm text-gray-500">Taxes applied at the marketplace level</p>
              </div>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
                onClick={() => handleAddTax("marketplace")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Tax
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {renderTaxRows(marketplaceTaxes)}
                </tbody>
              </table>
            </div>
          </section>

          {/* Merchant Level Taxes */}
          <section className="mb-10 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-4 border-b bg-gray-50">
              <div className="mb-3 md:mb-0">
                <h3 className="text-lg font-semibold text-gray-800">Merchant Level Taxes</h3>
                <p className="text-sm text-gray-500">Taxes specific to individual merchants</p>
              </div>
              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                <select 
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedStore}
                  onChange={handleRestaurantChange}
                >
                  {restaurants.map(restaurant => (
                    <option key={restaurant._id} value={restaurant.name}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
                  onClick={() => handleAddTax("merchant")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Tax
                </button>
              </div>
            </div>

            <div className="px-6 py-3 border-b bg-blue-50 flex items-center">
              <label className="text-sm text-gray-700 mr-3">
                Allow merchants to set their own taxes?
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={allowMerchantTaxes}
                  onChange={() => setAllowMerchantTaxes(!allowMerchantTaxes)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {renderTaxRows(merchantTaxes)}
                </tbody>
              </table>
            </div>
          </section>

          {/* Additional Charge */}
          <section className="mb-10 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-4 border-b bg-gray-50">
              <div className="mb-3 md:mb-0">
                <h3 className="text-lg font-semibold text-gray-800">Additional Charges</h3>
                <p className="text-sm text-gray-500">Extra fees applied to orders</p>
              </div>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
                onClick={() => handleAddTax("additional")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Charge
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {renderTaxRows(additionalCharges)}
                </tbody>
              </table>
            </div>
          </section>

          {/* Subscription Taxes */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-4 border-b bg-gray-50">
              <div className="mb-3 md:mb-0">
                <h3 className="text-lg font-semibold text-gray-800">Subscription Taxes</h3>
                <p className="text-sm text-gray-500">Taxes applied to subscription plans</p>
              </div>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
                onClick={() => handleAddTax("subscription")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Tax
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {renderTaxRows(subscriptionTaxes)}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {/* Add Tax Modal */}
      {showAddTaxModal && (
        <AddTaxModal 
          type={modalType}
          restaurantId={selectedRestaurantId}
          onClose={handleCloseModal}
          onSave={handleSaveTax}
          cities={cities}
          restaurants={restaurants}
        />
      )}
    </div>
  );
}