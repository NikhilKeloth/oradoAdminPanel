import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';

const PromoCodeModal = ({
  isOpen,
  onClose,
  onSubmit,
  promo,
  isCreating,
  merchants = [],
  customers = []
}) => {
  const [formData, setFormData] = useState({
    code: '',
    description: '', // Added description field
    discountType: 'fixed',
    discountValue: '',
    minOrderValue: 0,
    validFrom: new Date(),
    validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true,
    isMerchantSpecific: false,
    applicableMerchants: [],
    isCustomerSpecific: false,
    applicableCustomers: [],
    maxUsagePerCustomer: 0
  });

  const [errors, setErrors] = useState({});
  const [merchantOptions, setMerchantOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Reset form when opening for creation
      if (isCreating) {
        setFormData({
          code: '',
          description: '', // Added description field
          discountType: 'fixed',
          discountValue: '',
          minOrderValue: 0,
          validFrom: new Date(),
          validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: true,
          isMerchantSpecific: false,
          applicableMerchants: [],
          isCustomerSpecific: false,
          applicableCustomers: [],
          maxUsagePerCustomer: 0
        });
      } else if (promo) {
        // Prefill form for editing
        setFormData({
          ...promo,
          validFrom: new Date(promo.validFrom),
          validTill: new Date(promo.validTill),
          applicableMerchants: promo.applicableMerchants || [],
          applicableCustomers: promo.applicableCustomers || []
        });
      }

      // Convert merchants and customers to options format
      setMerchantOptions(
        merchants.map(m => ({
          value: m._id,
          label: m.name
        }))
      );

      setCustomerOptions(
        customers.map(c => ({
          value: c.userId,
          label: `${c.name} (${c.email || c.id})`
        }))
      );
    }
  }, [isOpen, isCreating, promo, JSON.stringify(merchants), JSON.stringify(customers)]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleDateChange = (date, field) => {
    setFormData({
      ...formData,
      [field]: date
    });
  };

  const handleMerchantSelect = (selectedOptions) => {
    setFormData({
      ...formData,
      applicableMerchants: selectedOptions ? selectedOptions.map(opt => opt.value) : []
    });
  };

  const handleCustomerSelect = (selectedOptions) => {
    setFormData({
      ...formData,
      applicableCustomers: selectedOptions ? selectedOptions.map(opt => opt.value) : []
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.code.trim()) {
      newErrors.code = 'Promo code is required';
    }
    
    if (!formData.discountValue) {
      newErrors.discountValue = 'Discount value is required';
    } else if (formData.discountType === 'percentage' && 
              (formData.discountValue < 0 || formData.discountValue > 100)) {
      newErrors.discountValue = 'Percentage must be between 0 and 100';
    } else if (formData.discountType === 'fixed' && formData.discountValue < 0) {
      newErrors.discountValue = 'Fixed amount must be positive';
    }
    
    if (formData.validTill < formData.validFrom) {
      newErrors.validTill = 'End date must be after start date';
    }
    
    if (formData.isMerchantSpecific && formData.applicableMerchants.length === 0) {
      newErrors.applicableMerchants = 'At least one merchant must be selected';
    }
    
    if (formData.isCustomerSpecific && formData.applicableCustomers.length === 0) {
      newErrors.applicableCustomers = 'At least one customer must be selected';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        code: formData.code.toUpperCase()
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold">
            {isCreating ? 'Create New Promo Code' : 'Edit Promo Code'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Promo Code */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Promo Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.code ? 'border-red-500' : ''}`}
                placeholder="e.g., SUMMER20"
              />
              {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}
            </div>

            {/* Description */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Summer discount for all customers"
              />
            </div>

            {/* Discount Type */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type <span className="text-red-500">*</span>
              </label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="fixed">Fixed Amount</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>

            {/* Discount Value */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Value <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.discountValue ? 'border-red-500' : ''}`}
                  placeholder={formData.discountType === 'percentage' ? '0-100' : ''}
                  min={formData.discountType === 'percentage' ? 0 : undefined}
                  max={formData.discountType === 'percentage' ? 100 : undefined}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {formData.discountType === 'percentage' ? '%' : '$'}
                </span>
              </div>
              {errors.discountValue && <p className="mt-1 text-sm text-red-500">{errors.discountValue}</p>}
            </div>

            {/* Min Order Value */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Order Value
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="minOrderValue"
                  value={formData.minOrderValue}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              </div>
            </div>

            {/* Valid From */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valid From <span className="text-red-500">*</span>
              </label>
              <DatePicker
                selected={formData.validFrom}
                onChange={(date) => handleDateChange(date, 'validFrom')}
                selectsStart
                startDate={formData.validFrom}
                endDate={formData.validTill}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Valid Till */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valid Till <span className="text-red-500">*</span>
              </label>
              <DatePicker
                selected={formData.validTill}
                onChange={(date) => handleDateChange(date, 'validTill')}
                selectsEnd
                startDate={formData.validFrom}
                endDate={formData.validTill}
                minDate={formData.validFrom}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.validTill ? 'border-red-500' : ''}`}
              />
              {errors.validTill && <p className="mt-1 text-sm text-red-500">{errors.validTill}</p>}
            </div>

            {/* Is Active */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="flex items-center">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ms-3 text-sm font-medium text-gray-700">
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </label>
              </div>
            </div>

            {/* Max Usage Per Customer */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Usage Per Customer
              </label>
              <input
                type="number"
                name="maxUsagePerCustomer"
                value={formData.maxUsagePerCustomer}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                placeholder="0 = Unlimited"
              />
            </div>

            {/* Is Merchant Specific */}
            <div className="col-span-2">
              <div className="flex items-center mb-2">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isMerchantSpecific"
                    checked={formData.isMerchantSpecific}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ms-3 text-sm font-medium text-gray-700">
                    Merchant Specific
                  </span>
                </label>
              </div>

              {formData.isMerchantSpecific && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Applicable Merchants <span className="text-red-500">*</span>
                  </label>
                  <Select
                    isMulti
                    options={merchantOptions}
                    onChange={handleMerchantSelect}
                    value={merchantOptions.filter(opt => 
                      formData.applicableMerchants.includes(opt.value)
                    )}
                    className={`basic-multi-select ${errors.applicableMerchants ? 'border-red-500' : ''}`}
                    classNamePrefix="select"
                    placeholder="Select merchants..."
                  />
                  {errors.applicableMerchants && (
                    <p className="mt-1 text-sm text-red-500">{errors.applicableMerchants}</p>
                  )}
                </div>
              )}
            </div>

            {/* Is Customer Specific */}
            <div className="col-span-2">
              <div className="flex items-center mb-2">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isCustomerSpecific"
                    checked={formData.isCustomerSpecific}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ms-3 text-sm font-medium text-gray-700">
                    Customer Specific
                  </span>
                </label>
              </div>

              {formData.isCustomerSpecific && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Applicable Customers <span className="text-red-500">*</span>
                  </label>
                  <Select
                    isMulti
                    options={customerOptions}
                    onChange={handleCustomerSelect}
                    value={customerOptions.filter(opt => 
                      formData.applicableCustomers.includes(opt.value)
                    )}
                    className={`basic-multi-select ${errors.applicableCustomers ? 'border-red-500' : ''}`}
                    classNamePrefix="select"
                    placeholder="Select customers..."
                  />
                  {errors.applicableCustomers && (
                    <p className="mt-1 text-sm text-red-500">{errors.applicableCustomers}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isCreating ? 'Create Promo Code' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromoCodeModal;