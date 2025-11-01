import { Edit, Trash2, ToggleLeft, ToggleRight, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify'; // Assuming you have toast notifications

const PromoCodeListTable = ({ promoCodes, loading, onEdit, onDelete, onStatusToggle }) => {
  const [actionLoading, setActionLoading] = useState(null);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Promo code copied to clipboard!');
  };

  const handleStatusToggle = async (id, currentStatus) => {
    setActionLoading(`toggle-${id}`);
    try {
      await onStatusToggle(id, currentStatus);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(`delete-${id}`);
    try {
      await onDelete(id);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (promoCodes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="text-center py-8 text-gray-500">
          No promo codes found. Create your first promo code to get started.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Discount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Min Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Validity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Restrictions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {promoCodes.map((promo) => {
              const isExpired = new Date(promo.validTill) < new Date();
              const isActive = promo.isActive && !isExpired;
              
              return (
                <tr key={promo._id} className={`hover:bg-gray-50 ${isExpired ? 'bg-gray-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">{promo.code}</span>
                      <button 
                        onClick={() => handleCopyCode(promo.code)}
                        className="ml-2 text-gray-400 hover:text-blue-500"
                        title="Copy code"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {promo.discountType === 'percentage' ? 'Percentage' : 'Fixed'}
                    </span>
                <div className="mt-1 text-sm">
  {promo.discountType === 'percentage' 
    ? `${promo.discountValue || 0}%` 
    : `$${(promo.discountValue || 0).toFixed(2)}`}
</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {promo.minOrderValue > 0 ? `$${promo.minOrderValue.toFixed(2)}` : 'None'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(promo.validFrom).toLocaleDateString()}
                    </div>
                    <div className={`text-sm ${isExpired ? 'text-red-500' : 'text-gray-500'}`}>
                      to {new Date(promo.validTill).toLocaleDateString()}
                      {isExpired && <span className="ml-1">(Expired)</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleStatusToggle(promo._id, promo.isActive)}
                      className="flex items-center"
                      disabled={actionLoading === `toggle-${promo._id}`}
                    >
                      {actionLoading === `toggle-${promo._id}` ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                      ) : isActive ? (
                        <ToggleRight className="text-green-500" size={24} />
                      ) : (
                        <ToggleLeft className="text-gray-400" size={24} />
                      )}
                      <span className="ml-1">
                        {isActive ? 'Active' : 'Inactive'}
                        {isExpired && !promo.isActive && ' (Expired)'}
                      </span>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${promo.isCustomerSpecific ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                        {promo.isCustomerSpecific ? 'Limited Customers' : 'All Customers'}
                      </span>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${promo.isMerchantSpecific ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                        {promo.isMerchantSpecific ? 'Limited Merchants' : 'All Merchants'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      Used: {promo.totalUsageCount || 0}
                    </div>
                    <div className="text-xs text-gray-500">
                      Max: {promo.maxUsagePerCustomer || '∞'} per customer
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(promo)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                        disabled={actionLoading}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(promo._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                        disabled={actionLoading === `delete-${promo._id}`}
                      >
                        {actionLoading === `delete-${promo._id}` ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-500"></div>
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PromoCodeListTable;