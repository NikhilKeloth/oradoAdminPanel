import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical, Calendar, MapPin, Bell, Gift, Settings, Target, Save, X, Edit, Trash2, ChevronLeft, ChevronRight, Filter, Download, Star, Award, TrendingUp } from 'lucide-react';

// Fixed Responsive Calendar Component (original size)
const ResponsiveCalendar = ({ value, onChange, placeholder, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();
  const selectedDate = value ? new Date(value + 'T00:00:00') : null;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateSelect = (date) => {
    onChange(formatDate(date));
    setIsOpen(false);
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  if (disabled) {
    return (
      <input
        type="text"
        disabled
        placeholder="Lifetime"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed transition-all duration-300"
      />
    );
  }

  return (
    <div className="relative">
      <div className="relative group">
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-hover:text-orange-500 transition-colors duration-300" />
        <input
          type="text"
          value={value ? new Date(value + 'T00:00:00').toLocaleDateString() : ''}
          onClick={() => setIsOpen(true)}
          readOnly
          placeholder={placeholder}
          className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer transition-all duration-300 hover:shadow-md hover:border-orange-300 bg-white"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 animate-fadeInUp">
          <div 
            className="fixed inset-0 bg-transparent pointer-events-none"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="relative bg-white border border-gray-100 rounded-lg shadow-xl w-56 sm:w-64 pointer-events-auto overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3">
              <div className="flex items-center justify-between text-white">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-1 hover:bg-white/20 rounded transition-all duration-300 hover:scale-110"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h3 className="font-medium text-sm">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-1 hover:bg-white/20 rounded transition-all duration-300 hover:scale-110"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-2">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 p-1">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentMonth).map((date, index) => (
                  <div key={index} className="aspect-square">
                    {date && (
                      <button
                        onClick={() => handleDateSelect(date)}
                        className={`w-full h-full text-xs rounded flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                          selectedDate && date.toDateString() === selectedDate.toDateString()
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md transform scale-105'
                            : date.toDateString() === today.toDateString()
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm'
                            : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div 
              className="absolute -inset-4 -z-10"
              onClick={() => setIsOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const AgentMilestonePanel = () => {
  const [activeTab, setActiveTab] = useState('rules');
  const [showModal, setShowModal] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [milestoneData, setMilestoneData] = useState([
    {
      id: 1,
      tierName: 'Bronze',
      deliveriesRequired: 1000,
      tierIcon: '🥉',
      validity: 'Lifetime',
      validFrom: '',
      validTo: '',
      isLifetime: true,
      rewardsCount: 1,
      status: 'Active',
      rewards: ['₹500 Cash Bonus - ₹500 (Cash)']
    },
    {
      id: 2,
      tierName: 'Silver',
      deliveriesRequired: 10000,
      tierIcon: '🥈',
      validity: 'Lifetime',
      validFrom: '',
      validTo: '',
      isLifetime: true,
      rewardsCount: 2,
      status: 'Active',
      rewards: ['₹1000 Cash Bonus - ₹1000 (Cash)']
    },
    {
      id: 3,
      tierName: 'Gold',
      deliveriesRequired: 20000,
      tierIcon: '🥇',
      validity: 'Jan 1 - Dec 31',
      validFrom: '2024-01-01',
      validTo: '2024-12-31',
      isLifetime: false,
      rewardsCount: 3,
      status: 'Inactive',
      rewards: ['₹2000 Cash Bonus - ₹2000 (Cash)']
    }
  ]);

  const parseRewardDetails = (rewardString) => {
    if (!rewardString) return { type: 'No Reward', value: 'N/A' };
    
    const match = rewardString.match(/^(.+?)\s*-\s*(.+?)\s*\((.+?)\)$/);
    if (match) {
      const [, name, value, type] = match;
      return { type: type.trim(), value: value.trim() };
    }
    
    return { type: 'Reward', value: rewardString };
  };

  const filteredMilestoneData = React.useMemo(() => {
    if (!searchTerm.trim()) return milestoneData;
    
    return milestoneData.filter(milestone => {
      const searchLower = searchTerm.toLowerCase();
      return (
        milestone.tierName.toLowerCase().includes(searchLower) ||
        milestone.status.toLowerCase().includes(searchLower) ||
        milestone.deliveriesRequired.toString().includes(searchTerm) ||
        milestone.tierIcon.includes(searchTerm)
      );
    });
  }, [milestoneData, searchTerm]);

  const handleAddNew = () => {
    setEditingTier(null);
    setShowModal(true);
  };

  const handleEdit = (tier) => {
    setEditingTier(tier);
    setShowModal(true);
  };

  const formatValidityDisplay = (tier) => {
    if (tier.isLifetime) {
      return 'Lifetime';
    }
    if (tier.validFrom && tier.validTo) {
      const fromDate = new Date(tier.validFrom + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const toDate = new Date(tier.validTo + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${fromDate} - ${toDate}`;
    }
    return 'Not set';
  };

  const handleSaveTier = (tierData) => {
    setLoading(true);
    
    setTimeout(() => {
      const updatedTierData = {
        ...tierData,
        rewardsCount: tierData.rewards.length,
        validity: tierData.isLifetime ? 'Lifetime' : formatValidityDisplay(tierData)
      };

      if (editingTier) {
        setMilestoneData(prev => prev.map(tier => 
          tier.id === editingTier.id ? { ...updatedTierData, id: editingTier.id } : tier
        ));
      } else {
        const newTier = {
          ...updatedTierData,
          id: Date.now()
        };
        setMilestoneData(prev => [...prev, newTier]);
      }
      setShowModal(false);
      setEditingTier(null);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header with original size */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 shadow-lg pb-5">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-white mt-2">Agent Milestone Rules</h1>
                <p className="text-orange-100 text-sm">Manage delivery milestones and rewards</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-hover:text-orange-500 transition-colors duration-300" />
                <input
                  type="text"
                  placeholder="Search milestones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full sm:w-64 border-0 rounded-lg bg-white/90 backdrop-blur-sm placeholder-gray-400 focus:ring-2 focus:ring-white/50 focus:bg-white transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation with original size */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6">
          <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('rules')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-300 relative overflow-hidden ${
                activeTab === 'rules'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {activeTab === 'rules' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 animate-slideIn"></div>
              )}
              <div className="flex items-center space-x-2">
                <span>📁</span>
                <span>Rules List</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-300 relative overflow-hidden ${
                activeTab === 'settings'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {activeTab === 'settings' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 animate-slideIn"></div>
              )}
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 py-6">
        {activeTab === 'rules' && (
          <RulesListTab 
            milestoneData={filteredMilestoneData}
            onAddNew={handleAddNew}
            onEdit={handleEdit}
            formatValidityDisplay={formatValidityDisplay}
            searchTerm={searchTerm}
            totalCount={milestoneData.length}
            parseRewardDetails={parseRewardDetails}
          />
        )}
        {activeTab === 'settings' && <SettingsTab />}
      </div>

      {/* Modal */}
      {showModal && (
        <TierModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingTier(null);
          }}
          editingTier={editingTier}
          onSave={handleSaveTier}
          loading={loading}
        />
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
              <span className="text-gray-700 font-medium">Saving milestone...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Rules List Tab Component with original sizes
const RulesListTab = ({ milestoneData, onAddNew, onEdit, formatValidityDisplay, searchTerm, totalCount, parseRewardDetails }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Milestone Tiers</h2>
          {searchTerm && (
            <p className="text-sm text-gray-600 mt-1">
              Showing {milestoneData.length} of {totalCount} result{milestoneData.length !== 1 ? 's' : ''} for "{searchTerm}"
            </p>
          )}
        </div>
        <button
          onClick={onAddNew}
          className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 transform w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          <span>Add New Milestone Tier</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-2 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                  Tier Name
                </th>
                <th className="px-2 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                  Deliveries
                </th>
                <th className="px-2 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[60px]">
                  Icon
                </th>
                <th className="px-2 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                  Validity
                </th>
                <th className="px-2 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                  <div className="flex flex-col">
                    <span>Reward</span>
                    {/* <span className="text-gray-400 font-normal normal-case">Reward Values</span> */}
                  </div>
                </th>
                <th className="px-2 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                  Status
                </th>
                <th className="px-2 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {milestoneData.map((tier, index) => (
                <tr key={tier.id} className="group hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-50/50 transition-all duration-300 animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                  <td className="px-2 sm:px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm font-medium text-gray-900">{tier.tierName}</div>
                  </td>
                  <td className="px-2 sm:px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm text-gray-900">≥ {tier.deliveriesRequired.toLocaleString()}</div>
                  </td>
                  <td className="px-2 sm:px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="text-lg sm:text-xl lg:text-2xl transform group-hover:scale-110 transition-transform duration-300">{tier.tierIcon}</div>
                  </td>
                  <td className="px-2 sm:px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm text-gray-900">{formatValidityDisplay(tier)}</div>
                  </td>
                  <td className="px-2 sm:px-4 lg:px-6 py-4">
                    <div className="flex flex-col space-y-2 items-start">
                      {tier.rewards && tier.rewards.length > 0 ? (
                        tier.rewards.map((reward, rewardIndex) => {
                          const rewardDetails = parseRewardDetails(reward);
                          return (
                            <div key={rewardIndex} className="flex flex-col space-y-1 items-start">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium w-fit transition-all duration-300 hover:scale-105 ${
                                rewardDetails.type === 'Cash' 
                                  ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 hover:from-green-200 hover:to-green-300'
                                  : rewardDetails.type === 'Digital'
                                  ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 hover:from-blue-200 hover:to-blue-300'
                                  : rewardDetails.type === 'Gift Card'
                                  ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 hover:from-purple-200 hover:to-purple-300'
                                  : rewardDetails.type === 'Physical'
                                  ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 hover:from-yellow-200 hover:to-yellow-300'
                                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 hover:from-gray-200 hover:to-gray-300'
                              }`}>
                                {rewardDetails.type}
                              </span>
                              <div className="text-xs sm:text-sm font-semibold text-gray-900 pl-2">
                                {rewardDetails.value}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex flex-col space-y-1 items-start">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium w-fit bg-gray-100 text-gray-800">
                            No Reward
                          </span>
                          <div className="text-xs sm:text-sm font-semibold text-gray-900 pl-2">
                            N/A
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 lg:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105 ${
                      tier.status === 'Active'
                        ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 hover:from-green-200 hover:to-green-300'
                        : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 hover:from-red-200 hover:to-red-300'
                    }`}>
                      {tier.status === 'Active' ? '✅' : '❌'} {tier.status}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <button
                        onClick={() => onEdit(tier)}
                        className="group text-orange-600 hover:text-orange-900 px-1.5 sm:px-2 lg:px-3 py-1 rounded border border-orange-200 hover:bg-orange-50 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 text-xs sm:text-sm"
                      >
                        <Edit className="w-3 h-3 sm:hidden group-hover:rotate-12 transition-transform duration-300" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 transition-all duration-300 hover:scale-110">
                        <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {milestoneData.length === 0 && searchTerm && (
        <div className="text-center py-8 text-gray-500 animate-fadeIn">
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No milestones found</h3>
            <p className="text-gray-600 mb-4">No milestones found matching "{searchTerm}"</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              Clear search
            </button>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <span className="text-yellow-500 text-sm">🟡</span>
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> The ⋮ button opens more actions like Duplicate, Assign to Region, Disable, etc.
          </p>
        </div>
      </div>
    </div>
  );
};

// Settings Tab Component with original sizes
const SettingsTab = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">⚙️ Settings</h2>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
          <h3 className="text-md font-semibold text-gray-900 mb-4">General Rules</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 pr-4">
                <p className="text-sm font-medium text-gray-900">Auto-promotion logic</p>
                <p className="text-xs text-gray-500">Promote when threshold met</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-orange-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex-1 pr-4">
                <p className="text-sm font-medium text-gray-900">Multi-tier progression</p>
                <p className="text-xs text-gray-500">Allow only one tier at a time</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-orange-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1 pr-4">
                <p className="text-sm font-medium text-gray-900">Enable tier rollback</p>
                <p className="text-xs text-gray-500">If delivery count drops</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-orange-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
          <h3 className="text-md font-semibold text-gray-900 mb-4">📣 Notifications & Triggers</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <input type="checkbox" className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 mt-1" defaultChecked />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">🔔 Notify agent</p>
                <p className="text-xs text-gray-500">Push/SMS/Email notification</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <input type="checkbox" className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">📦 Trigger gift dispatch</p>
                <p className="text-xs text-gray-500">Automatic reward delivery</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <input type="checkbox" className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 mt-1" defaultChecked />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">🏷 Assign agent badge</p>
                <p className="text-xs text-gray-500">Display in agent profile</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <input type="checkbox" className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">🎉 Show in agent profile</p>
                <p className="text-xs text-gray-500">Like LinkedIn badges</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal Component with original sizes but enhanced animations
const TierModal = ({ isOpen, onClose, editingTier, onSave, loading }) => {
  const [formData, setFormData] = useState({
    tierName: editingTier?.tierName || '',
    deliveriesRequired: editingTier?.deliveriesRequired || '',
    tierIcon: editingTier?.tierIcon || '🥇',
    validFrom: editingTier?.validFrom || '',
    validTo: editingTier?.validTo || '',
    isLifetime: editingTier?.isLifetime ?? true,
    region: 'All India',
    status: editingTier?.status || 'Active',
    rewards: editingTier?.rewards || []
  });

  const [newReward, setNewReward] = useState({
    name: '',
    type: 'Cash',
    value: ''
  });

  const [showRewardForm, setShowRewardForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLifetimeToggle = (isLifetime) => {
    setFormData(prev => ({
      ...prev,
      isLifetime,
      validFrom: isLifetime ? '' : prev.validFrom,
      validTo: isLifetime ? '' : prev.validTo
    }));
  };

  const handleAddReward = () => {
    if (newReward.name.trim() && newReward.value.trim()) {
      const rewardText = `${newReward.name} - ${newReward.value} (${newReward.type})`;
      setFormData(prev => ({
        ...prev,
        rewards: [...prev.rewards, rewardText]
      }));
      setNewReward({ name: '', type: 'Cash', value: '' });
      setShowRewardForm(false);
    }
  };

  const handleRemoveReward = (index) => {
    setFormData(prev => ({
      ...prev,
      rewards: prev.rewards.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col animate-slideInUp" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-white" />
              <h2 className="text-lg font-semibold text-white">
                {editingTier ? 'Edit Milestone Tier' : '🎯 Define New Milestone Tier'}
              </h2>
            </div>
            <button 
              onClick={onClose} 
              className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          <form className="p-4 sm:p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tier Name *</label>
                <input
                  type="text"
                  required
                  value={formData.tierName}
                  onChange={(e) => handleInputChange('tierName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:shadow-md"
                  placeholder="e.g., Gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deliveries Required *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.deliveriesRequired}
                  onChange={(e) => handleInputChange('deliveriesRequired', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:shadow-md"
                  placeholder="e.g., 20000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tier Icon</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={formData.tierIcon}
                    onChange={(e) => handleInputChange('tierIcon', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:shadow-md"
                    placeholder="🥇"
                  />
                  <span className="text-2xl transform hover:scale-110 transition-transform duration-300">{formData.tierIcon}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Region / Zone</label>
                <select 
                  value={formData.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  className="w-1/2 sm:w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm transition-all duration-300 hover:shadow-md"
                >
                  <option>All India</option>
                  <option>North India</option>
                  <option>South India</option>
                  <option>West India</option>
                  <option>East India</option>
                </select>
              </div>
            </div>

            {/* Validity Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="lifetime-checkbox"
                  checked={formData.isLifetime}
                  onChange={(e) => handleLifetimeToggle(e.target.checked)}
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="lifetime-checkbox" className="text-sm font-medium text-gray-700">
                  Lifetime Validity
                </label>
              </div>

              {!formData.isLifetime && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valid From</label>
                    <ResponsiveCalendar
                      value={formData.validFrom}
                      onChange={(date) => handleInputChange('validFrom', date)}
                      placeholder="Select start date"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valid To</label>
                    <ResponsiveCalendar
                      value={formData.validTo}
                      onChange={(date) => handleInputChange('validTo', date)}
                      placeholder="Select end date"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active-status"
                checked={formData.status === 'Active'}
                onChange={(e) => handleInputChange('status', e.target.checked ? 'Active' : 'Inactive')}
                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="active-status" className="text-sm font-medium text-gray-700">
                ✓ Active
              </label>
            </div>

            {/* Rewards Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-semibold text-gray-900">🧰 Rewards Section (Multiple Rewards)</h3>
                <button
                  type="button"
                  onClick={() => setShowRewardForm(!showRewardForm)}
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center space-x-1 px-3 py-1 rounded-lg border border-orange-200 hover:bg-orange-50 transition-all duration-300 hover:shadow-md"
                >
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Add Reward</span>
                </button>
              </div>

              {/* Add Reward Form */}
              {showRewardForm && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-slideDown">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Reward name"
                      value={newReward.name}
                      onChange={(e) => setNewReward(prev => ({ ...prev, name: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm transition-all duration-300"
                    />
                    <select
                      value={newReward.type}
                      onChange={(e) => setNewReward(prev => ({ ...prev, type: e.target.value }))}
                      className="w-1/2 sm:w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm transition-all duration-300"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Digital">Digital</option>
                      <option value="Gift Card">Gift Card</option>
                      <option value="Physical">Physical</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Value (e.g., ₹1000)"
                      value={newReward.value}
                      onChange={(e) => setNewReward(prev => ({ ...prev, value: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm transition-all duration-300"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleAddReward}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm transition-all duration-300 hover:shadow-md"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRewardForm(false)}
                      className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded text-sm transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Rewards List */}
              <div className="space-y-2">
                {formData.rewards.length > 0 ? (
                  formData.rewards.map((reward, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300 group">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">🎁</span>
                        <span className="text-sm text-gray-900">{reward}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveReward(index)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-all duration-300 group-hover:scale-110"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Gift className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No rewards added yet</p>
                  </div>
                )}
              </div>
            </div>

            <div className="h-16"></div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300"
            >
              Cancel
            </button>
            <button 
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>💾 Save Tier</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// CSS animations (kept minimal)
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeInUp {
    from { 
      opacity: 0; 
      transform: translateY(10px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
  
  @keyframes slideInUp {
    from { 
      opacity: 0; 
      transform: translateY(50px) scale(0.95); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0) scale(1); 
    }
  }
  
  @keyframes slideDown {
    from { 
      opacity: 0; 
      transform: translateY(-10px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
  
  @keyframes slideIn {
    from { width: 0; }
    to { width: 100%; }
  }
  
  .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
  .animate-fadeInUp { animation: fadeInUp 0.3s ease-out; }
  .animate-slideInUp { animation: slideInUp 0.4s ease-out; }
  .animate-slideDown { animation: slideDown 0.2s ease-out; }
  .animate-slideIn { animation: slideIn 0.3s ease-out; }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default AgentMilestonePanel;
