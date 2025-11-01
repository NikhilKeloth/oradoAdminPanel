import React, { useEffect, useState } from "react";
import {
  Plus,
  Download,
  Calendar,
  DollarSign,
  Target,
  Clock,
  Check,
  X,
  Edit2,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  getIncentivePlans,
  createIncentivePlan,
  togglePlanStatus,
  deleteIncentivePlan,
} from "../../apis/adminApis/incentiveApi";

const IncentivePlansOverview = () => {
  const [showForm, setShowForm] = useState(false);
  const [periodFilter, setPeriodFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingPlan, setEditingPlan] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    period: "weekly",
    conditions: [
      {
        conditionType: "earnings",
        threshold: 0,
        incentiveAmount: 0,
      },
    ],
    validFrom: new Date().toISOString().split("T")[0], // Set default to today
    validTo: "",
  });

  const [plans, setPlans] = useState([

  ]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(null);

        const periodParam = periodFilter === "all" ? undefined : periodFilter;
        const response = await getIncentivePlans({ period: periodParam });

        // Normalize the data structure
        const normalizedPlans = response.data.map((plan) => {
          // For plans with the new structure (has conditions array)
          if (plan.conditions) {
            return {
              id: plan._id,
              ...plan,
            };
          }
          // For plans with the old structure
          return {
            id: plan._id,
            name: plan.name,
            period: plan.planType,
            conditions: [
              {
                conditionType:
                  plan.targetType === "delivery_fee"
                    ? "earnings"
                    : "deliveries",
                threshold: plan.thresholdAmount,
                incentiveAmount: plan.incentiveAmount,
              },
            ],
            validFrom: plan.validFrom,
            validTo: plan.validTo,
            isActive: plan.isActive,
          };
        });

        setPlans(normalizedPlans);
      } catch (err) {
        console.error("Error fetching plans:", err);
        setError(err.message || "Failed to load incentive plans");
        toast.error(err.message || "Failed to load incentive plans");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [periodFilter]);

  const filteredPlans = plans.filter(
    (plan) => periodFilter === "all" || plan.period === periodFilter
  );

  const handleEditPlan = (plan) => {
    setEditingPlan({
      ...plan,
      validTo: plan.validTo || ''
    });
    setShowEditForm(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate
      if (!editingPlan.name.trim()) {
        toast.error('Plan name is required');
        return;
      }

      if (editingPlan.conditions.some(c => c.threshold <= 0)) {
        toast.error('All condition thresholds must be greater than 0');
        return;
      }

      // Prepare the update data
      const updateData = {
        ...editingPlan,
        validTo: editingPlan.validTo === '' ? null : editingPlan.validTo
      };

      // Call your API update function here
      // const response = await updateIncentivePlan(editingPlan.id, updateData);
      // For now, we'll simulate an update:
      console.log('Would update plan:', updateData);

      // Update local state
      setPlans(prev => prev.map(plan =>
        plan.id === editingPlan.id ? updateData : plan
      ));

      toast.success('Plan updated successfully');
      setShowEditForm(false);
      setEditingPlan(null);

    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error(error.message || 'Failed to update incentive plan');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? Number(value)
            : value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Plan name is required";
    if (formData.minEarnings <= 0 && formData.minOrders <= 0) {
      return "Either minimum earnings or minimum orders must be greater than 0";
    }
    if (formData.incentiveAmount < 0)
      return "Incentive amount must be 0 or greater";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.name.trim()) {
      toast.error("Plan name is required");
      return;
    }

    if (
      formData.conditions.length === 0 ||
      (formData.conditions[0].threshold <= 0 &&
        (!formData.conditions[1] || formData.conditions[1].threshold <= 0))
    ) {
      toast.error("At least one condition with threshold > 0 is required");
      return;
    }

    try {
      // Ensure conditions is properly formatted
      const planToSubmit = {
        ...formData,
        validTo: formData.validTo === '' ? null : formData.validTo,
        conditions: formData.conditions.filter(c => c.threshold > 0)
      };

      console.log(planToSubmit);

      const response = await createIncentivePlan(planToSubmit);
      console.log(response);

      // Reset form
      setFormData({
        name: "",
        description: "",
        period: "weekly",
        conditions: [
          {
            conditionType: "earnings",
            threshold: 0,
            incentiveAmount: 0,
          },
        ],
        validFrom: new Date().toISOString().split("T")[0],
        validTo: "",
      });

      setShowForm(false);
      toast.success("Plan created successfully");

      // Refresh plans
      const plansResponse = await getIncentivePlans({
        period: periodFilter === "all" ? undefined : periodFilter,
      });
      console.log(plansResponse);
      setPlans(plansResponse.data);
    } catch (error) {
      console.error("Error creating plan:", error);
      toast.error(error.message || "Failed to create incentive plan");
    }
  };
const handleTogglePlanStatus = async (id) => {
  try {
    // Optimistically update the UI first
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === id ? { ...plan, isActive: !plan.isActive } : plan
      )
    );

    // Make the API call
    const res = await togglePlanStatus(id);
    
    // If API fails, revert the UI change
    if (!res.success) {
      setPlans((prev) =>
        prev.map((plan) =>
          plan.id === id ? { ...plan, isActive: !plan.isActive } : plan // Revert the toggle
        )
      );
      toast.error(res.message || 'Failed to update plan status');
    } else {
      toast.success('Plan status updated successfully');
    }
    
  } catch (error) {
    // Revert on any error
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === id ? { ...plan, isActive: !plan.isActive } : plan
      )
    );
    toast.error(error.message || 'Failed to update plan status');
    console.error('Error toggling plan status:', error);
  }
};

  const deletePlan = async (id) => {
    try {
      if (
        window.confirm("Are you sure you want to delete this incentive plan?")
      ) {
        const response = await deleteIncentivePlan(id);
        console.log(response);
        toast.success("Plan deleted successfully");
        setPlans((prev) => prev.filter((plan) => plan.id !== id));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Period",
      "Name",
      "Min Earnings (₹)",
      "Min Orders",
      "Incentive Amount (₹)",
      "Valid From",
      "Valid To",
      "Active",
    ];
    const csvData = filteredPlans.map((plan) => [
      plan.period.charAt(0).toUpperCase() + plan.period.slice(1),
      plan.name,
      plan.minEarnings,
      plan.minOrders,
      plan.incentiveAmount,
      plan.validFrom,
      plan.validTo || "N/A",
      plan.isActive ? "Yes" : "No",
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "incentive-plans.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount) => `₹${amount.toLocaleString("en-IN")}`;

  const getPeriodColor = (period) => {
    switch (period) {
      case "daily":
        return "bg-blue-100 text-blue-800";
      case "weekly":
        return "bg-green-100 text-green-800";
      case "monthly":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Incentive Plans Management
          </h1>
          <p className="text-gray-600">
            Create and manage incentive plans for your delivery team
          </p>
        </div>

        {/* Create Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bgOp flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Create Incentive Plan
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Plan Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incentive Plan Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter plan name"
                    required
                    maxLength={100}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter description (optional)"
                    rows={3}
                    maxLength={500}
                  />
                </div>

                {/* Period */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Period *
                  </label>
                  <div className="flex gap-4">
                    {["daily", "weekly", "monthly"].map((period) => (
                      <label
                        key={period}
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="period"
                          value={period}
                          checked={formData.period === period}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          required
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {period}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Earnings Condition */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Earnings Condition
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Earnings (₹) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          ₹
                        </span>
                        <input
                          type="number"
                          name="earningsThreshold"
                          value={formData.conditions[0]?.threshold || 0}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            setFormData((prev) => ({
                              ...prev,
                              conditions: [
                                {
                                  conditionType: "earnings",
                                  threshold: value,
                                  incentiveAmount:
                                    prev.conditions[0]?.incentiveAmount || 0,
                                },
                              ],
                            }));
                          }}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="0"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Incentive Amount (₹) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          ₹
                        </span>
                        <input
                          type="number"
                          name="earningsIncentive"
                          value={formData.conditions[0]?.incentiveAmount || 0}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            setFormData((prev) => ({
                              ...prev,
                              conditions: [
                                {
                                  conditionType: "earnings",
                                  threshold: prev.conditions[0]?.threshold || 0,
                                  incentiveAmount: value,
                                },
                              ],
                            }));
                          }}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="0"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valid From *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        name="validFrom"
                        value={formData.validFrom}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valid To (Optional)
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        name="validTo"
                        value={formData.validTo}
                        onChange={handleInputChange}
                        min={formData.validFrom}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Is Active */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Is Active?
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Save Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}


        {/* Edit Form Modal */}
        {showEditForm && editingPlan && (
          <div className="fixed inset-0 bg-black bgOp  flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Edit Incentive Plan</h2>
                  <button
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingPlan(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
                {/* Plan Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incentive Plan Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter plan name"
                    required
                    maxLength={100}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={editingPlan.description}
                    onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter description (optional)"
                    rows={3}
                    maxLength={500}
                  />
                </div>

                {/* Period */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Period *</label>
                  <div className="flex gap-4">
                    {['daily', 'weekly', 'monthly'].map(period => (
                      <label key={period} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="period"
                          value={period}
                          checked={editingPlan.period === period}
                          onChange={() => setEditingPlan({ ...editingPlan, period })}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          required
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{period}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Conditions */}
                {editingPlan.conditions.map((condition, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {condition.conditionType === 'earnings' ? 'Earnings Condition' : 'Deliveries Condition'}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {condition.conditionType === 'earnings' ? 'Minimum Earnings (₹)' : 'Minimum Deliveries'} *
                        </label>
                        <div className="relative">
                          {condition.conditionType === 'earnings' && (
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">₹</span>
                          )}
                          <input
                            type="number"
                            value={condition.threshold}
                            onChange={(e) => {
                              const newConditions = [...editingPlan.conditions];
                              newConditions[index].threshold = parseFloat(e.target.value) || 0;
                              setEditingPlan({ ...editingPlan, conditions: newConditions });
                            }}
                            className={`w-full ${condition.conditionType === 'earnings' ? 'pl-8' : 'pl-4'} pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                            placeholder="0"
                            min="0"
                            step={condition.conditionType === 'earnings' ? "0.01" : "1"}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Incentive Amount (₹) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">₹</span>
                          <input
                            type="number"
                            value={condition.incentiveAmount}
                            onChange={(e) => {
                              const newConditions = [...editingPlan.conditions];
                              newConditions[index].incentiveAmount = parseFloat(e.target.value) || 0;
                              setEditingPlan({ ...editingPlan, conditions: newConditions });
                            }}
                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="0"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Date Range */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valid From *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        name="validFrom"
                        value={editingPlan.validFrom}
                        onChange={(e) => setEditingPlan({ ...editingPlan, validFrom: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valid To (Optional)
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        name="validTo"
                        value={editingPlan.validTo || ''}
                        onChange={(e) => setEditingPlan({ ...editingPlan, validTo: e.target.value || null })}
                        min={editingPlan.validFrom}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Is Active */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={editingPlan.isActive}
                    onChange={(e) => setEditingPlan({ ...editingPlan, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">Is Active?</label>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Update Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingPlan(null);
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}









        {/* Actions Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Filter */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                Filter by Period:
              </span>
              <div className="flex gap-2">
                {["all", "daily", "weekly", "monthly"].map((period) => (
                  <button
                    key={period}
                    onClick={() => setPeriodFilter(period)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${periodFilter === period
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {/* <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button> */}
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus className="w-4 h-4" />
                Create New Plan
              </button>
            </div>
          </div>
        </div>

        {/* Plans Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Incentive Plans Overview
            </h2>
            <p className="text-gray-600 mt-1">
              {filteredPlans.length} plans found
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conditions
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Incentive
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valid From
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valid To
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPlans?.map((plan) => {
                  const conditions = plan.conditions || [];

                  // Find the earnings and deliveries conditions
                  const earningsCondition = plan.conditions.find(
                    (c) => c.conditionType === "earnings"
                  );
                  const deliveriesCondition = plan.conditions.find(
                    (c) => c.conditionType === "deliveries"
                  );

                  return (
                    <tr
                      key={plan.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getPeriodColor(
                            plan.period
                          )}`}
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {plan.period}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {plan.name}
                        </div>
                        {plan.description && (
                          <div className="text-xs text-gray-500 mt-1">
                            {plan.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {conditions.map((condition) => (
                            <div
                              key={`${plan.id}-${condition.conditionType}`}
                              className="flex items-center text-sm"
                            >
                              {condition.conditionType === "earnings" ? (
                                <>
                                  <DollarSign className="w-3 h-3 mr-1 text-gray-400" />
                                  <span>
                                    Min Earnings:{" "}
                                    {formatCurrency(condition.threshold)}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Target className="w-3 h-3 mr-1 text-gray-400" />
                                  <span>Min Orders: {condition.threshold}</span>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">
                          {plan.conditions
                            .map((c) => formatCurrency(c.incentiveAmount))
                            .join(" + ")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(plan.validFrom).toLocaleDateString("en-IN")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 italic">
                          {plan.validTo ? new Date(plan.validTo).toLocaleDateString("en-IN") : "No End Date"}
                        </div>
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap">
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={plan.isActive}
      onChange={() => handleTogglePlanStatus(plan._id)}
      className="sr-only peer" // Hide the default checkbox
    />
    <div className={`w-11 h-6 rounded-full peer ${plan.isActive 
        ? 'bg-green-400 peer-focus:ring-green-300' 
        : 'bg-red-400 peer-focus:ring-red-300'
      } peer-focus:ring-2 peer-focus:ring-offset-2 transition-colors`}
    >
      {/* Toggle knob */}
      <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform ${
        plan.isActive ? 'translate-x-5' : ''
      }`}></div>
    </div>
    <span className="ml-2 text-sm font-medium text-gray-700">
      {plan.isActive ? 'Active' : 'Inactive'}
    </span>
  </label>
</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditPlan(plan)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="Edit Plan"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deletePlan(plan._id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Delete Plan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredPlans.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Target className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No plans found
                </h3>
                <p className="text-gray-500 mb-6">
                  Get started by creating your first incentive plan.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create New Plan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncentivePlansOverview;
