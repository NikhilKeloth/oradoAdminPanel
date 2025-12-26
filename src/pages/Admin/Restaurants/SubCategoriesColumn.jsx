import React from "react";
import { MoreVertical, Plus, Archive, Edit3, Trash2, Eye, EyeOff, Layers } from "lucide-react";

function SubCategoriesColumn({
  subCategories,
  selectedSubCategory,
  setSelectedSubCategory,
  subCategoryDropdown,
  setSubCategoryDropdown,
  toggleSubCategoryDropdown,
  dropdownPosition,
  setDeleteSubCategoryId,
  setDeleteMode,
  setShowModal,
  setEditingSubCategory,
  setIsEditSubCategoryModalOpen,
  setIsSubCategoryModalOpen,
  setIsProductModalOpen,
  handleArchiveSubCategory,
  handleUnarchiveSubCategory,
  handleDisableSubCategory,
  handleEnableSubCategory,
  loading
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 h-full shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-800 text-base flex items-center gap-2">
            <Layers size={16} className="text-blue-600" />
            Sub-categories ({subCategories.length})
          </h3>
          <button
            className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
            onClick={() => setIsSubCategoryModalOpen(true)}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-3"></div>
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      ) : (
        <div className="p-3 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]">
          {subCategories.length > 0 ? (
            subCategories.map((subCategory) => (
              <div
                key={subCategory._id}
                onClick={() => setSelectedSubCategory(subCategory._id)}
                className={`w-full p-3 flex justify-between items-center cursor-pointer transition-all duration-150 rounded-lg border ${
                  selectedSubCategory === subCategory._id
                    ? "bg-blue-50 border-blue-300 shadow-sm"
                    : "bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${subCategory.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span
                    className={`text-sm truncate ${
                      selectedSubCategory === subCategory._id
                        ? "font-bold text-blue-700"
                        : "font-medium text-gray-700"
                    }`}
                  >
                    {subCategory.name}
                  </span>
                  {!subCategory.active && (
                    <span className="text-xs text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                      Inactive
                    </span>
                  )}
                  {subCategory.archived && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                      Archived
                    </span>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={(e) => toggleSubCategoryDropdown(subCategory._id, e)}
                    className="p-1 hover:bg-blue-100 rounded text-gray-500 hover:text-blue-600"
                  >
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Layers size={20} className="text-blue-400" />
              </div>
              <p className="font-medium text-gray-700 mb-1">No sub-categories</p>
              <p className="text-sm text-gray-500 mb-4">Add your first sub-category</p>
              <button
                onClick={() => setIsSubCategoryModalOpen(true)}
                className="px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-all"
              >
                <Plus size={14} className="inline mr-1" />
                Add Sub-category
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sub-Category Dropdown */}
      {subCategoryDropdown && (
        <div
          className="fixed z-[9999] bg-white rounded-md shadow-lg border border-gray-200 w-56"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Archive/Unarchive Option */}
          {subCategories.find(sc => sc._id === subCategoryDropdown)?.archived ? (
            <button
              className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-blue-50 flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                handleUnarchiveSubCategory(subCategoryDropdown);
                setSubCategoryDropdown(null);
              }}
            >
              <Archive size={14} />
              Unarchive
            </button>
          ) : (
            <button
              className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                handleArchiveSubCategory(subCategoryDropdown);
                setSubCategoryDropdown(null);
              }}
            >
              <Archive size={14} />
              Archive
            </button>
          )}

          {/* Add Product Option */}
          <button
            className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSubCategory(subCategoryDropdown);
              setIsProductModalOpen(true);
              setSubCategoryDropdown(null);
            }}
          >
            <Plus size={14} />
            Add Product
          </button>

          {/* Disable/Enable */}
          {subCategories.find(sc => sc._id === subCategoryDropdown)?.active ? (
            <button
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-blue-50 flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                handleDisableSubCategory(subCategoryDropdown);
                setSubCategoryDropdown(null);
              }}
            >
              <EyeOff size={14} />
              Disable
            </button>
          ) : (
            <button
              className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-blue-50 flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                handleEnableSubCategory(subCategoryDropdown);
                setSubCategoryDropdown(null);
              }}
            >
              <Eye size={14} />
              Enable
            </button>
          )}

          {/* Edit */}
          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              const subCategory = subCategories.find(sc => sc._id === subCategoryDropdown);
              setEditingSubCategory(subCategory);
              setIsEditSubCategoryModalOpen(true);
              setSubCategoryDropdown(null);
            }}
          >
            <Edit3 size={14} />
            Edit
          </button>

          {/* Delete */}
          <button
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-blue-50 flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteSubCategoryId(subCategoryDropdown);
              setDeleteMode("subcategory");
              setShowModal(true);
              setSubCategoryDropdown(null);
            }}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default SubCategoriesColumn;