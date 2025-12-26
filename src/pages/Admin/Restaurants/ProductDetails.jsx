import React from "react";
import { 
  Activity, Clock, Package, Image, Edit3, Trash2, AlertCircle, 
  Tag, DollarSign, BarChart, Calendar
} from "lucide-react";

function ProductDetails({ product, loading, getStatusColor, getFoodTypeColor }) {
  if (loading) {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl p-5 h-full border border-gray-200 shadow-sm">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl p-5 h-full border border-gray-200 shadow-sm">
        <div className="flex flex-col items-center justify-center h-96 text-gray-500">
          <Package size={64} className="text-pink-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No Product Selected
          </h3>
          <p className="text-center text-gray-500 max-w-md">
            Select a product from the list to view and edit its details, manage inventory, and update images.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl p-5 h-full border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Edit3 size={18} className="text-pink-600" />
          Product Details
        </h2>
        {/* {product && (
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors duration-200">
              <Edit3 size={16} />
            </button>
            <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
              <Trash2 size={16} />
            </button>
          </div>
        )} */}
      </div>

      <div className="space-y-5 max-h-[600px] overflow-y-auto">
        {/* Alert for Low Stock */}
        {product.enableInventory && product.isLowStock && (
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="text-pink-500 flex-shrink-0" size={20} />
            <div>
              <p className="font-medium text-pink-800">Low Stock Alert!</p>
              <p className="text-sm text-pink-600">
                Current stock ({product.stock}) is below reorder level ({product.reorderLevel})
              </p>
            </div>
          </div>
        )}

        {/* Basic Information Card */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="bg-pink-50 px-5 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Activity size={18} className="text-pink-600" />
              Basic Information
            </h3>
          </div>
          
          <div className="p-5">
            <div className="flex flex-col md:flex-row gap-5">
              {/* Product Image */}
              <div className="w-full md:w-1/3 flex-shrink-0">
                {product.images?.length > 0 ? (
                  <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-pink-50 rounded-lg border-2 border-dashed border-pink-300 flex items-center justify-center">
                    <Image size={40} className="text-pink-400" />
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Tag size={14} />
                    Product Name
                  </label>
                  <p className="text-gray-900 font-semibold text-lg">
                    {product.name}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <DollarSign size={14} />
                    Price
                  </label>
                  <p className="text-pink-600 font-bold text-xl">
                    ${product.price}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">
                    Food Type
                  </label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getFoodTypeColor(product.foodType)}`}>
                    {product.foodType === "veg" ? "🍏 Veg" : "🍗 Non-Veg"}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(product.status)}`}>
                    {product.status === "Active" ? "✅ Active" : "❌ Inactive"}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">
                    Unit
                  </label>
                  <p className="text-gray-900 font-medium capitalize">
                    {product.unit}
                  </p>
                </div>

                {product.description && (
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-sm font-medium text-gray-500">
                      Description
                    </label>
                    <p className="text-gray-700">
                      {product.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Operational Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock size={16} className="text-pink-600" />
            Operational Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg">
              <Clock size={18} className="text-pink-600 flex-shrink-0" />
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Preparation Time
                </label>
                <p className="text-gray-900 font-semibold">
                  {product.preparationTime} minutes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Package size={18} className="text-green-600 flex-shrink-0" />
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Allowed Order Quantity
                </label>
                <p className="text-gray-900 font-semibold">
                  Min: {product.minOrderQty} | Max: {product.maxOrderQty}
                </p>
              </div>
            </div>
          </div>

          {product.description && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <label className="text-sm font-medium text-gray-600 block mb-2">
                Description
              </label>
              <p className="text-gray-900 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}
        </div>

        {/* Images */}
        {product.images && product.images.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Image size={16} className="text-pink-600" />
              Product Images
              <span className="text-sm font-normal text-gray-500">
                ({product.images.length})
              </span>
            </h3>
            <div className="flex flex-wrap gap-3">
              {product.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 hover:border-pink-300 transition-colors duration-200"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inventory Management */}
        {product.enableInventory && (
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Package size={16} className="text-pink-600" />
              Inventory Management
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                <label className="text-sm font-medium text-gray-600 block mb-1">
                  Current Stock
                </label>
                <p className="text-2xl font-bold text-pink-600">
                  {product.stock}{" "}
                  <span className="text-sm font-normal text-gray-600">
                    {product.unit}
                  </span>
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <label className="text-sm font-medium text-gray-600 block mb-1">
                  Reorder Level
                </label>
                <p className="text-2xl font-bold text-orange-600">
                  {product.reorderLevel}{" "}
                  <span className="text-sm font-normal text-gray-600">
                    {product.unit}
                  </span>
                </p>
              </div>
            </div>

            {/* Stock Status Bar */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Stock Level
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round((product.stock / (product.reorderLevel * 3)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${
                    product.isLowStock ? "bg-red-500" : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.min((product.stock / (product.reorderLevel * 3)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Activity size={16} className="text-pink-600" />
            Additional Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {product.costPrice && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  Cost Price
                </label>
                <p className="text-gray-900 font-medium">
                  ${product.costPrice}
                </p>
              </div>
            )}

            {product.createdAt && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Calendar size={14} />
                  Created At
                </label>
                <p className="text-gray-900 font-medium">
                  {new Date(product.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}

            {product.updatedAt && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  Last Updated
                </label>
                <p className="text-gray-900 font-medium">
                  {new Date(product.updatedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;