import React from "react";
import { MoreVertical, Plus, Archive, Edit3, Trash2, Eye, EyeOff } from "lucide-react";

function CategoriesColumn({
  categories,
  selectedCategory,
  setSelectedCategory,
  categoryDropdown,
  setCategoryDropdown,
  toggleCategoryDropdown,
  dropdownPosition,
  setDeleteCategoryId,
  setDeleteMode,
  setShowModal,
  setEditingCategory,
  setIsEditCategoryModalOpen,
  setIsProductModalOpen,
  handleArchiveCategory,
  handleUnarchiveCategory,
  handleDisableCategory,
  handleEnableCategory,
  setIsCategoryModalOpen
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 h-full shadow-sm">
      <div className="p-3 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-800 text-base">
            Category ({categories.length})
          </h3>
          <button
            className="p-1 text-pink-600 hover:text-pink-700 hover:bg-pink-50 rounded transition-colors"
            onClick={() => setIsCategoryModalOpen(true)}
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]">
        {categories.map((category) => (
          <div
            key={category._id}
            onClick={() => setSelectedCategory(category._id)}
            className={`w-full p-3 flex justify-between items-center cursor-pointer transition-all duration-150 rounded-lg border ${
              selectedCategory === category._id
                ? "bg-pink-50 border-pink-300 shadow-sm"
                : "bg-white border-gray-200 hover:bg-pink-50 hover:border-pink-200"
            }`}
          >
            <span
              className={`text-sm uppercase truncate ${
                selectedCategory === category._id
                  ? "font-bold text-pink-700"
                  : "font-medium text-gray-700"
              }`}
            >
              {category.name}
            </span>

            <div className="relative">
              <button
                onClick={(e) => toggleCategoryDropdown(category._id, e)}
                className="p-1 hover:bg-pink-100 rounded text-gray-500 hover:text-pink-600"
              >
                <MoreVertical size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Category Dropdown */}
      {categoryDropdown && (
        <div
          className="fixed z-[9999] bg-white rounded-md shadow-lg border border-gray-200 w-56"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Archive/Unarchive Option - FIRST */}
          {categories.find(c => c._id === categoryDropdown)?.archived ? (
            <button
              className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-pink-50 flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                handleUnarchiveCategory(categoryDropdown);
                setCategoryDropdown(null);
              }}
            >
              <Archive size={14} />
              Unarchive Category
            </button>
          ) : (
            <button
              className="w-full text-left px-4 py-2 text-sm text-pink-600 hover:bg-pink-50 flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                handleArchiveCategory(categoryDropdown);
                setCategoryDropdown(null);
              }}
            >
              <Archive size={14} />
              Archive Category
            </button>
          )}

          {/* Add Product Option - SECOND */}
          <button
            className="w-full text-left px-4 py-2 text-sm text-pink-600 hover:bg-pink-50 flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCategory(categoryDropdown);
              setIsProductModalOpen(true);
              setCategoryDropdown(null);
            }}
          >
            <Plus size={14} />
            Add Product
          </button>

          {/* Disable/Enable Category Option - THIRD */}
          {categories.find(c => c._id === categoryDropdown)?.active ? (
            <button
              className="w-full text-left px-4 py-2 text-sm text-pink-600 hover:bg-pink-50 flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                handleDisableCategory(categoryDropdown);
                setCategoryDropdown(null);
              }}
            >
              <EyeOff size={14} />
              Disable Category
            </button>
          ) : (
            <button
              className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-pink-50 flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                handleEnableCategory(categoryDropdown);
                setCategoryDropdown(null);
              }}
            >
              <Eye size={14} />
              Enable Category
            </button>
          )}

          {/* Edit Category Option - FOURTH */}
          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              const category = categories.find(c => c._id === categoryDropdown);
              setEditingCategory(category);
              setIsEditCategoryModalOpen(true);
              setCategoryDropdown(null);
            }}
          >
            <Edit3 size={14} />
            Edit Category
          </button>

          {/* Delete Category Option - FIFTH */}
          <button
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-pink-50 flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteCategoryId(categoryDropdown);
              setDeleteMode("category");
              setShowModal(true);
              setCategoryDropdown(null);
            }}
          >
            <Trash2 size={14} />
            Delete Category
          </button>
        </div>
      )}
    </div>
  );
}

export default CategoriesColumn;