import React from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Plus,
  Package
} from "lucide-react";

const TreeView = ({
  categories,
  expandedCategories,
  onToggleExpansion,
  onCategorySelect,
  onAddSubCategory,
  onAddProduct,
  selectedId,
  level = 0,
  path = []
}) => {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="space-y-1">
      {categories.map((category) => {
        const isExpanded = expandedCategories[category._id];
        const hasChildren = category.children && category.children.length > 0;
        const isSelected = selectedId === category._id;
        const currentPath = [...path, category._id];

        return (
          <div key={category._id} className="select-none">
            {/* Category Item */}
            <div
              onClick={() => onCategorySelect(category, currentPath)}
              className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? "bg-pink-100 border border-pink-300"
                  : "hover:bg-gray-50 border border-transparent"
              }`}
              style={{ 
                paddingLeft: `${level * 24 + 12}px`,
                marginLeft: `${level * 4}px`
              }}
            >
              {/* Expand/Collapse Button */}
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpansion(category._id);
                  }}
                  className="p-1 hover:bg-white rounded transition-colors flex-shrink-0"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              )}
              {!hasChildren && <div className="w-6 flex-shrink-0" />}

              {/* Icon with level indicator */}
              <div className="relative">
                <div className={`p-1.5 rounded flex-shrink-0 ${isSelected ? 'bg-pink-200' : 'bg-gray-100'}`}>
                  {isExpanded ? (
                    <FolderOpen className="h-4 w-4 text-pink-500" />
                  ) : (
                    <Folder className="h-4 w-4 text-pink-500" />
                  )}
                </div>
                {level > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 text-white text-xs flex items-center justify-center rounded-full">
                    {level}
                  </div>
                )}
              </div>

              {/* Category Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-medium truncate ${isSelected ? 'text-pink-700' : 'text-gray-800'}`}>
                    {category.name}
                  </span>
                  {category.archived && (
                    <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full">
                      Archived
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    category.active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {category.active ? "Active" : "Inactive"}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Package className="h-3 w-3" />
                    <span>{category.productCount || 0}</span>
                  </div>
                  {hasChildren && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Folder className="h-3 w-3" />
                      <span>{category.children.length}</span>
                      <span className="text-gray-400">• Level {level}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Add Subcategory Button - ALWAYS VISIBLE for unlimited nesting */}
              {/* <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddSubCategory(category._id);
                  }}
                  className="p-1.5 text-pink-600 hover:bg-pink-100 rounded opacity-70 hover:opacity-100 transition-all"
                  title={`Add Subcategory (Level ${level + 1})`}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div> */}

              {/* ACTION BUTTONS */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {/* ADD PRODUCT BUTTON - NEW */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddProduct(category._id, category.name); // Pass category ID and name
                  }}
                  className="p-1.5 text-green-600 hover:bg-green-100 rounded opacity-70 hover:opacity-100 transition-all"
                  title="Add Product to this Category"
                >
                  <Package className="h-4 w-4" />
                </button>

                {/* ADD SUBCATEGORY BUTTON - EXISTING */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddSubCategory(category._id);
                  }}
                  className="p-1.5 text-pink-600 hover:bg-pink-100 rounded opacity-70 hover:opacity-100 transition-all"
                  title={`Add Subcategory (Level ${level + 1})`}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Children - RECURSIVE RENDER FOR UNLIMITED NESTING */}
            {isExpanded && hasChildren && (
              <TreeView
                categories={category.children}
                expandedCategories={expandedCategories}
                onToggleExpansion={onToggleExpansion}
                onCategorySelect={onCategorySelect}
                onAddSubCategory={onAddSubCategory}
                selectedId={selectedId}
                level={level + 1}
                path={currentPath}
                onAddProduct={onAddProduct}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TreeView;