import React, { useEffect, useState } from "react";
import { ChromePicker } from "react-color";
import { createOrUpdateMyThemeSettings, getMyThemeSettings } from "../../../../apis/adminApis/temeApi";
import { toast } from "react-toastify";
import { FiChevronLeft, FiChevronRight, FiSave, FiRefreshCw } from "react-icons/fi";

const ThemeSettingsPage = () => {
  const [colors, setColors] = useState({
    primaryNavbar: "#000000",
    menuButton: "#f48fb1",
    buttonsTabs: "#fbc02d",
    buttonText: "#ffffff",
    menuHover: "#272727"
  });

  const [activePicker, setActivePicker] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleColorChange = (colorKey) => (color) => {
    setColors(prev => ({
      ...prev,
      [colorKey]: color.hex
    }));
  };

  const togglePicker = (pickerName) => {
    setActivePicker(activePicker === pickerName ? null : pickerName);
  };

  const fetchThemeSettings = async () => {
    try {
      setIsLoading(true);
      const data = await getMyThemeSettings();
      if (data) {
        setColors({
          primaryNavbar: data.primaryNavbar,
          menuButton: data.menuButton,
          buttonsTabs: data.buttonsTabs,
          buttonText: data.buttonText,
          menuHover: data.menuHover,
        });
      }
    } catch (error) {
      console.error("Failed to load theme settings:", error);
      toast.error("Failed to load theme settings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchThemeSettings();
  }, []);

  const saveThemeSettings = async () => {
    try {
      setIsSaving(true);
      await createOrUpdateMyThemeSettings(colors);
      toast.success("Theme settings saved successfully!");
    } catch (error) {
      console.error("Failed to save theme settings:", error);
      toast.error("Failed to save theme settings");
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefault = () => {
    setColors({
      primaryNavbar: "#000000",
      menuButton: "#f48fb1",
      buttonsTabs: "#fbc02d",
      buttonText: "#ffffff",
      menuHover: "#272727"
    });
    toast.info("Reset to default colors");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Theme Settings</h1>
        <p className="text-gray-600">Customize your dashboard appearance</p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Color Settings Column */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Primary Colors</h2>
            
            {[
              {
                key: 'primaryNavbar',
                label: 'Top Navbar & Side Menu',
                description: 'Background color for top navbar and side menu',
                color: colors.primaryNavbar
              },
              {
                key: 'menuButton',
                label: 'Menu Button',
                description: 'Background color for top menu button',
                color: colors.menuButton
              },
              {
                key: 'buttonsTabs',
                label: 'Buttons & Tabs',
                description: 'Background color for buttons and tabs',
                color: colors.buttonsTabs
              }
            ].map((item) => (
              <div key={item.key} className="mb-5">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-700">{item.label}</span>
                  <span className="text-sm text-gray-500">{item.color}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-md cursor-pointer border border-gray-200 shadow-sm"
                    style={{ backgroundColor: item.color }}
                    onClick={() => togglePicker(item.key)}
                  />
                  <button 
                    onClick={() => togglePicker(item.key)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {activePicker === item.key ? 'Hide picker' : 'Change color'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                {activePicker === item.key && (
                  <div className="mt-3">
                    <ChromePicker 
                      color={item.color} 
                      onChange={handleColorChange(item.key)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Secondary Colors</h2>
            
            {[
              {
                key: 'buttonText',
                label: 'Button Text',
                description: 'Text color for buttons',
                color: colors.buttonText
              },
              {
                key: 'menuHover',
                label: 'Menu Hover',
                description: 'Hover color for side menu items',
                color: colors.menuHover
              }
            ].map((item) => (
              <div key={item.key} className="mb-5">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-700">{item.label}</span>
                  <span className="text-sm text-gray-500">{item.color}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-md cursor-pointer border border-gray-200 shadow-sm"
                    style={{ backgroundColor: item.color }}
                    onClick={() => togglePicker(item.key)}
                  />
                  <button 
                    onClick={() => togglePicker(item.key)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {activePicker === item.key ? 'Hide picker' : 'Change color'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                {activePicker === item.key && (
                  <div className="mt-3">
                    <ChromePicker 
                      color={item.color} 
                      onChange={handleColorChange(item.key)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Live Preview Column */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-lg shadow p-5 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Live Preview</h2>
              <div className="flex gap-2">
                <button 
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
                  title="Previous view"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
                  title="Next view"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Dashboard Preview */}
            <div className="border rounded-lg overflow-hidden">
              {/* Header */}
              <div 
                className="flex justify-between items-center p-4"
                style={{ backgroundColor: colors.primaryNavbar }}
              >
                <img 
                  src="https://d2ljatibw03amr.cloudfront.net/Tookan/Tookan-live/angular/assets/images/inner_logo.svg" 
                  alt="Logo" 
                  className="h-5"
                />
                <div 
                  className="p-1 rounded"
                  style={{ backgroundColor: colors.menuButton }}
                >
                  <img 
                    src="https://d2ljatibw03amr.cloudfront.net/Tookan/Tookan-live/angular/assets/images/marketplace-menu.svg" 
                    alt="Menu" 
                    className="h-5"
                  />
                </div>
              </div>
              
              {/* Main Content */}
              <div className="flex border-t">
                {/* Side Menu */}
                <div 
                  className="w-1/4 p-3 space-y-2"
                  style={{ backgroundColor: colors.primaryNavbar }}
                >
                  {['Home', 'Dashboard', 'Agent', 'Merchant', 'Customers', 'Routes', 'Analytics', 'Task', 'Parcel', 'Settings', 'Extensions'].map((item, index) => (
                    <div 
                      key={item}
                      className={`flex items-center p-2 rounded cursor-pointer text-sm transition-colors ${
                        index === 1 ? '' : 'hover:bg-gray-800'
                      }`}
                      style={{ 
                        backgroundColor: index === 1 ? colors.buttonsTabs : 'transparent',
                        color: index === 1 ? colors.buttonText : '#fff'
                      }}
                    >
                      <span className="w-5 h-5 bg-gray-500 rounded-full mr-2 flex-shrink-0"></span>
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
                
                {/* Content Area */}
                <div className="w-3/4 bg-gray-50">
                  <div className="p-4">
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-gray-700">Dashboard Overview</h3>
                        <div 
                          className="px-3 py-1 rounded text-sm font-medium"
                          style={{ 
                            backgroundColor: colors.buttonsTabs,
                            color: colors.buttonText
                          }}
                        >
                          Today
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {['Agents Online', 'Tasks Completed', 'Parcels Delivered'].map((stat, i) => (
                          <div key={stat} className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-500">{stat}</p>
                            <p className="text-xl font-semibold">{
                              i === 0 ? '24' : 
                              i === 1 ? '156' : 
                              '89'
                            }</p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="h-40 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                        Map Visualization
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm p-4">
                      <h3 className="font-medium text-gray-700 mb-3">Recent Activities</h3>
                      <div className="space-y-3">
                        {[
                          'Agent John completed task #1234',
                          'New parcel assigned to Agent Sarah',
                          'Route optimization completed'
                        ].map((activity, i) => (
                          <div key={i} className="flex items-start">
                            <div 
                              className="w-2 h-2 rounded-full mt-2 mr-2"
                              style={{ backgroundColor: colors.buttonsTabs }}
                            ></div>
                            <p className="text-sm text-gray-600">{activity}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button 
              onClick={resetToDefault}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" />
              Reset Default
            </button>
            <button 
              onClick={saveThemeSettings}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-white hover:opacity-90 transition-opacity disabled:opacity-70"
              style={{ 
                backgroundColor: colors.buttonsTabs,
                color: colors.buttonText
              }}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettingsPage;