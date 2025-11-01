import { useState } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiArchive, FiRefreshCw, FiChevronDown } from 'react-icons/fi';
import { BsThreeDotsVertical, BsArrowUp, BsArrowDown } from 'react-icons/bs';

const CatalogPage = () => {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Green Produce', active: true, productCount: 3 },
    { id: 2, name: 'Dessert', active: false, productCount: 2 },
    { id: 3, name: 'Arabian', active: false, productCount: 1 }
  ]);

  const [products, setProducts] = useState([
    { id: 1, name: 'Zuchinni rolls', price: 400.00, description: 'Zucchini rolls filled with creamy chicken and home made cream cheese', categoryId: 1, active: true, image: 'https://d2sz1kgdtrlf1n.cloudfront.net/yelo_products/thumb-250-250-4a7ngjwkC5631tdiulD43n3rxi7u4qv8xbmh5gdl377je668k7n4gkO1715190210987-3bo3l33gQlkgffd4zpjp930t2sBa9m206o716ky29mljf.png' },
    { id: 2, name: 'Beef Pastrami Sourdough Sandwich', price: 350.00, description: 'Delicious beef pastrami on fresh sourdough bread', categoryId: 1, active: false },
    { id: 3, name: 'Green Beans and Chicken', price: 320.00, description: 'Fresh green beans with grilled chicken', categoryId: 1, active: false },
    { id: 4, name: 'Immune Charger Juice', price: 180.00, description: 'Healthy juice to boost your immunity', categoryId: 2, active: false },
    { id: 5, name: 'Fit for a King Smoothie', price: 200.00, description: 'Nutritious smoothie with fruits and protein', categoryId: 2, active: false },
    { id: 6, name: 'Shawarma', price: 250.00, description: 'Traditional Arabian shawarma wrap', categoryId: 3, active: false }
  ]);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    categoryId: 1
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Approved');

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const handleAddProduct = () => {
    const product = {
      id: products.length + 1,
      ...newProduct,
      price: parseFloat(newProduct.price),
      active: false,
      image: 'https://via.placeholder.com/250'
    };
    setProducts([...products, product]);
    // Update category count
    setCategories(categories.map(cat => 
      cat.id === product.categoryId ? {...cat, productCount: cat.productCount + 1} : cat
    ));
    setNewProduct({
      name: '',
      price: '',
      description: '',
      categoryId: 1
    });
    setShowAddProductModal(false);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="bg-blue-100 rounded-lg p-2 mr-3 text-blue-600">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24C18.6274 24 24 18.6274 24 12Z" fill="#E3E7EA"/>
              <path d="M9 12.75H11.25V13.5H9V12.75ZM9 14.25H12.75V15H9V14.25Z" fill="currentColor"/>
              <path d="M15.75 7.5H8.25C8.05109 7.50031 7.8606 7.57941 7.72 7.72C7.57941 7.8606 7.50031 8.05109 7.5 8.25V15.75C7.50031 15.9489 7.57941 16.1394 7.72 16.28C7.8606 16.4206 8.05109 16.4997 8.25 16.5H15.75C15.9489 16.4997 16.1394 16.4206 16.28 16.28C16.4206 16.1394 16.4997 15.9489 16.5 15.75V8.25C16.4997 8.05109 16.4206 7.8606 16.28 7.72C16.1394 7.57941 15.9489 7.50031 15.75 7.5ZM12.75 8.25V9.75H11.25V8.25H12.75ZM8.25 15.75V8.25H10.5V10.5H13.5V8.25H15.75L15.7503 15.75H8.25Z" fill="currentColor"/>
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-800">Product Catalog</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <select className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 pr-8 appearance-none text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Green Treat</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <FiChevronDown className="h-4 w-4" />
            </div>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center">
            <FiPlus className="mr-2" /> New Product
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 border-b flex justify-between items-center">
        <div className="flex space-x-2">
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center">
            <FiRefreshCw className="mr-2" /> Refresh
          </button>
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">
            Layout
          </button>
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">
            Import/Export
          </button>
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">
            Add ons
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">
            <FiArchive className="mr-2 inline" /> Archive
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 border-b flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Filter by:</span>
          <ul className="flex space-x-4">
            {['Approved', 'Pending', 'Rejected'].map((tab) => (
              <li 
                key={tab}
                className={`text-sm pb-1 cursor-pointer ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500 hover:text-blue-600'}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Show:</span>
          <select className="bg-gray-100 border border-gray-200 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option>All</option>
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
          <select className="bg-gray-100 border border-gray-200 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option>English</option>
          </select>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 border-b">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Categories Column */}
        <div className="w-64 bg-white border-r overflow-y-auto">
          <div className="p-4 border-b flex justify-between items-center">
            <p className="font-medium text-gray-700">Categories</p>
            <button 
              className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
              onClick={() => {/* Add category logic */}}
            >
              <FiPlus size={18} />
            </button>
          </div>
          <ul className="divide-y divide-gray-100">
            {categories.map((category) => (
              <li 
                key={category.id} 
                className={`p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center ${category.active ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                onClick={() => {
                  setCategories(categories.map(c => ({
                    ...c,
                    active: c.id === category.id
                  })));
                }}
              >
                <div>
                  <span className="block text-gray-800 font-medium">{category.name}</span>
                  <span className="block text-xs text-gray-500 mt-1">{category.productCount} products</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BsThreeDotsVertical className="text-gray-400 hover:text-gray-600 cursor-pointer" />
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Products Column */}
        <div className="w-80 bg-white border-r overflow-y-auto">
          <div className="p-4 border-b flex justify-between items-center">
            <p className="font-medium text-gray-700">Products ({filteredProducts.length})</p>
            <div className="flex items-center space-x-2">
              <button 
                className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                onClick={() => setShowAddProductModal(true)}
              >
                <FiPlus size={18} />
              </button>
              <div className="relative group">
                <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                  <BsThreeDotsVertical size={18} />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200 hidden group-hover:block">
                  <div className="py-1">
                    <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                      <div className="flex items-center mr-2">
                        <BsArrowUp size={14} className="mr-1" />
                        <BsArrowDown size={14} />
                      </div>
                      Move products
                    </button>
                    <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                      <FiArchive className="mr-2" /> Bulk Archive
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <ul className="divide-y divide-gray-100">
            {filteredProducts.map((product) => (
              <li 
                key={product.id} 
                className={`p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center ${selectedProduct?.id === product.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                onClick={() => handleProductSelect(product)}
              >
                <div className="truncate">
                  <p className="text-gray-800 font-medium truncate">{product.name}</p>
                  <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${product.active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <BsThreeDotsVertical className="text-gray-400 hover:text-gray-600 cursor-pointer" />
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Product Details Column */}
        <div className="flex-1 bg-white overflow-y-auto">
          {selectedProduct ? (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Product Details</h2>
                <div className="flex space-x-2">
                  <button className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100">
                    <FiEdit2 size={18} />
                  </button>
                  <button className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100">
                    <FiTrash2 size={18} />
                  </button>
                  <button className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100">
                    <FiRefreshCw size={18} />
                  </button>
                </div>
              </div>

              <div className="flex mb-8">
                <div className="w-40 h-40 rounded-lg overflow-hidden mr-6 border border-gray-200">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{selectedProduct.name}</h3>
                  <p className="text-blue-600 font-medium text-xl mb-3">${selectedProduct.price.toFixed(2)}</p>
                  <div className="flex items-center mb-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${selectedProduct.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {selectedProduct.active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                      {categories.find(c => c.id === selectedProduct.categoryId)?.name || 'Uncategorized'}
                    </span>
                  </div>
                  <p className="text-gray-600">{selectedProduct.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-700">INVENTORY TRACKING</h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={selectedProduct.active} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">Quantity Available</p>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2 text-gray-800">0</span>
                        <button className="text-blue-600 hover:text-blue-800">
                          <FiEdit2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">Low Stock Alert</p>
                        <p className="text-xs text-gray-500">Notify when quantity reaches</p>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2 text-gray-800">5</span>
                        <button className="text-blue-600 hover:text-blue-800">
                          <FiEdit2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-4">PRODUCT INFORMATION</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">SKU</p>
                      <p className="text-gray-800">PROD-{selectedProduct.id.toString().padStart(3, '0')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Category</p>
                      <p className="text-gray-800">{categories.find(c => c.id === selectedProduct.categoryId)?.name || 'Uncategorized'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="text-gray-800">Today</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="font-medium text-gray-700 mb-3">LONG DESCRIPTION</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600">{selectedProduct.description}</p>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-700">VARIANTS/ADD-ONS</h4>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    + Add Variant
                  </button>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-500 text-center py-4">No variants or add-ons assigned to this product</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                  Archive
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="max-w-md">
                <div className="bg-blue-100 p-4 rounded-full inline-block mb-4">
                  <FiPlus className="text-blue-600 text-2xl" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No product selected</h3>
                <p className="text-gray-500 mb-6">Select a product from the list to view details or create a new product</p>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center mx-auto"
                  onClick={() => setShowAddProductModal(true)}
                >
                  <FiPlus className="mr-2" /> Add New Product
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Add New Product</h2>
              <button 
                onClick={() => setShowAddProductModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="e.g. Chicken Sandwich"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  rows="3"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  placeholder="Brief description of the product..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={newProduct.categoryId}
                  onChange={(e) => setNewProduct({...newProduct, categoryId: parseInt(e.target.value)})}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
                onClick={() => setShowAddProductModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                onClick={handleAddProduct}
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogPage;