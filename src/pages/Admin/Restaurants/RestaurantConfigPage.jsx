import React, { useState } from 'react';
import AvailabilitySettings from "./AvailabilitySettings"
const RestaurantAdminPage = () => {
  const [activeTab, setActiveTab] = useState('restaurants');
  const [restaurant, setRestaurant] = useState({
    id: 1579066,
    name: "Store Name 5",
    address: "388 Market Street, Suite 1300",
    slug: "Store - Name - 5 -",
    displayAddress: "Store Address",
    email: "roha.qureshi+mp+5851@yelo.red",
    phone: "+921234567890",
    description: "Describe Your Business Here",
    rating: "NA",
    status: "Virtual Meet",
    language: "English",
    logo: null,
    webBanner: null,
    mobileBanner: null,
    bgColor: "#ffffff",
    ratingBarColor: "#000000",
    customTag: "Grid"
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRestaurant(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setRestaurant(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Restaurant Management</h1>
        <div className="bg-gray-100 p-3 rounded-lg">
          {restaurant.name}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('configurations')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'configurations' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Configurations
          </button>
          <button
            onClick={() => setActiveTab('catalogue')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'catalogue' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Catalogue
          </button>
            <button
            onClick={() => setActiveTab('restaurants')}
  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
    activeTab === 'restaurants' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
  }`}
          >
           Restaurants
          </button>
        </nav>
      </div>

      {activeTab === 'restaurants' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                <div className="bg-gray-100 p-2 rounded">{restaurant.id}</div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">ADDRESS *</label>
                <textarea
                  name="address"
                  value={restaurant.address}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows="2"
                />
                <p className="text-xs text-gray-500 mt-1">SLUG (MAX 100 CHARACTERS)</p>
                <input
                  name="slug"
                  value={restaurant.slug}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  maxLength="100"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">NAME *</label>
                <input
                  name="name"
                  value={restaurant.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">DISPLAY ADDRESS *</label>
                <input
                  name="displayAddress"
                  value={restaurant.displayAddress}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">LOGO</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <p>Drag & Drop images, or browse from computer</p>
                  <input 
                    type="file" 
                    onChange={(e) => handleFileUpload(e, 'logo')}
                    className="hidden" 
                    id="logo-upload" 
                  />
                  <label htmlFor="logo-upload" className="mt-2 inline-block px-4 py-2 bg-blue-500 text-white rounded cursor-pointer">
                    Browse Files
                  </label>
                  {restaurant.logo && (
                    <div className="mt-4">
                      <p className="font-medium">Preview</p>
                      <img src={restaurant.logo} alt="Logo preview" className="max-h-20 mt-2 mx-auto" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">EMAIL *</label>
                <input
                  name="email"
                  value={restaurant.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">RESTAURANT NAME *</label>
                <input
                  name="name"
                  value={restaurant.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">BANNER IMAGE FOR WEB (1300X326 PX)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <p>Drag & Drop images, or browse from computer</p>
                  <input 
                    type="file" 
                    onChange={(e) => handleFileUpload(e, 'webBanner')}
                    className="hidden" 
                    id="web-banner-upload" 
                  />
                  <label htmlFor="web-banner-upload" className="mt-2 inline-block px-4 py-2 bg-blue-500 text-white rounded cursor-pointer">
                    Browse Files
                  </label>
                  {restaurant.webBanner && (
                    <div className="mt-4">
                      <p className="font-medium">Preview</p>
                      <img src={restaurant.webBanner} alt="Web banner preview" className="max-h-20 mt-2 mx-auto" />
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">LANGUAGE</label>
                <select
                  name="language"
                  value={restaurant.language}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">PHONE *</label>
                <input
                  name="phone"
                  value={restaurant.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">DESCRIPTION (MAX 360 CHARACTERS)</label>
                <textarea
                  name="description"
                  value={restaurant.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows="3"
                  maxLength="360"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">MOBILE BANNER IMAGE (450X250PX)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <p>Drag & Drop images, or browse from computer</p>
                  <input 
                    type="file" 
                    onChange={(e) => handleFileUpload(e, 'mobileBanner')}
                    className="hidden" 
                    id="mobile-banner-upload" 
                  />
                  <label htmlFor="mobile-banner-upload" className="mt-2 inline-block px-4 py-2 bg-blue-500 text-white rounded cursor-pointer">
                    Browse Files
                  </label>
                  {restaurant.mobileBanner && (
                    <div className="mt-4">
                      <p className="font-medium">Preview</p>
                      <img src={restaurant.mobileBanner} alt="Mobile banner preview" className="max-h-20 mt-2 mx-auto" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">RATING</label>
                <div className="bg-gray-100 p-2 rounded">{restaurant.rating}</div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">CUSTOM TAG TO BE DISPLAYED ON STORE LISTING PAGE</label>
                <input
                  name="customTag"
                  value={restaurant.customTag}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">BACKGROUND COLOR</label>
                <div className="flex items-center">
                  <input
                    type="color"
                    name="bgColor"
                    value={restaurant.bgColor}
                    onChange={handleInputChange}
                    className="h-10 w-10"
                  />
                  <span className="ml-2">{restaurant.bgColor}</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">RATING BAR COLOR</label>
                <div className="flex items-center">
                  <input
                    type="color"
                    name="ratingBarColor"
                    value={restaurant.ratingBarColor}
                    onChange={handleInputChange}
                    className="h-10 w-10"
                  />
                  <span className="ml-2">{restaurant.ratingBarColor}</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">STATUS</label>
                <div className="bg-gray-100 p-2 rounded">{restaurant.status}</div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button className="px-6 py-2 bg-gray-300 text-gray-800 rounded mr-4">
              Cancel
            </button>
            <button className="px-6 py-2 bg-blue-500 text-white rounded">
              Save Changes
            </button>
          </div>
        </div>
      )}

{activeTab === 'configurations' && (
  <div>
    <h2 className="text-2xl font-semibold mb-6">Configurations</h2>
    <AvailabilitySettings />
  </div>
)}


      
    </div>
  );
};

export default RestaurantAdminPage;