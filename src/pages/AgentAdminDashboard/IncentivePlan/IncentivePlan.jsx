import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Edit3,
  Trash2,
  Plus,
  Filter
} from 'lucide-react';
import IncentivePlanModal from '../../../components/AgentAdminDashboard/IncentivePlan/IncentivePlanModal';
import {
  createIncentivePlan,
  getIncentivePlans,
  deleteIncentivePlan
} from '../../../apis/adminApis/incentiveApi';

function IncentivePlan() {
  const [activeTab, setActiveTab] = useState('Daily');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [incentivePlans, setIncentivePlans] = useState([]);

  const [filters, setFilters] = useState({
    effectiveFrom: '2024-01-01',
    effectiveTo: '',
    zone: 'Mumbai'
  });

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await fetchIncentivePlans();
      console.log(data)
      setIncentivePlans(data);
    } catch (error) {
      console.error('Failed to load incentive plans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const filteredPlans = incentivePlans.filter(plan =>
    plan.planType === activeTab.toLowerCase() 
  );

  const addNewPlan = async (formData) => {
    try {
      const payload = {
        ...formData,
        effectiveTo: formData.effectiveTo || null,
        createdBy: 'Admin User'
      };
      await createIncentivePlan(payload);
      await fetchPlans(); // refresh after adding
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create incentive plan:', error);
    }
  };

const handleDeletePlan = async (plan) => {
  if (!await confirmDeletePlan(plan)) return;
  
  const { success, error } = await deleteIncentivePlan(plan._id);
  
  if (success) {
    alert('Plan deleted successfully!');
    refreshPlansList();
  } else {
    alert(`Deletion failed: ${error.message}`);
  }
};

  const tabs = ['Daily', 'Weekly', 'Monthly'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Incentive Plans Management</h1>
              <p className="text-gray-600 mt-1">Manage delivery agent incentive plans and rewards</p>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                    activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={20} className="text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Effective From
                </label>
                <input
                  type="date"
                  value={filters.effectiveFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, effectiveFrom: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Effective To
                </label>
                <input
                  type="date"
                  value={filters.effectiveTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, effectiveTo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ongoing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={16} className="inline mr-1" />
                  Zone/City
                </label>
                <select
                  value={filters.zone}
                  onChange={(e) => setFilters(prev => ({ ...prev, zone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Zones</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Pune">Pune</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{activeTab} Incentive Plans</h2>
              <p className="text-gray-600 mt-1">
                {filteredPlans.length} rule(s) found for {filters.zone || 'all zones'}
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus size={18} />
              Add New Plan
            </button>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading incentive plans...</div>
            ) : filteredPlans.length === 0 ? (
              <div className="text-center py-12">
                <Plus size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No incentive plans found</h3>
                <p className="text-gray-600 mb-4">
                  Get started by creating your first {activeTab.toLowerCase()} incentive plan.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus size={18} />
                  Add New Plan
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">#</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Condition</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Incentive Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Zone</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPlans.map((plan, index) => (
                    <tr key={plan._id}>
                      <td className="px-6 py-4 text-sm">{index + 1}</td>
                      <td className="px-6 py-4 text-sm">
                        {plan.targetType.replace('_', ' ')} {plan.condition} ₹{plan.thresholdAmount}
                      </td>
                      <td className="px-6 py-4 text-sm text-green-600 font-medium">
                        ₹{plan.incentiveAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {plan.cities.includes('All') ? 'All Cities' : plan.cities.join(', ')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          plan.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {plan.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button className="text-gray-600 hover:text-blue-600">
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeletePlan(plan._id)}
                            className="text-gray-600 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <IncentivePlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addNewPlan}
      />
    </div>
  );
}

export default IncentivePlan;
