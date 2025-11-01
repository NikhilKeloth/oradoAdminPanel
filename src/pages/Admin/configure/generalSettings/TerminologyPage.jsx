import { useState, useEffect } from 'react';
import { getTerminologyByLanguage, saveTerminology } from '../../../../apis/adminApis/terminologyApi';
import { toast } from 'react-toastify';

const TerminologyPage = () => {
  const [language, setLanguage] = useState('English');
  const [terminologies, setTerminologies] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('ORDER');

  // Static term categories
  const termCategories = {
    ORDER: [
      'ORDER PLACED', 'STORE CLOSED', 'ORDER ACCEPTED', 'ORDER ASSIGNED',
      'PROJECT POSTED', 'ORDER PICKED UP', 'ORDER PROCESSED', 'ORDER DISPATCHED',
      'ORDER APPROVAL PENDING', 'ORDER READY TO PICK UP'
    ],
    GENERAL: [
      'BID', 'BUY', 'NEW', 'PAY', 'TIP', 'VEG', 'WON', 'BIDS', 'CART', 'FIND',
      'ITEM', 'MENU', 'OPEN', 'UNIT', 'AGENT', 'HIPPO', 'ITEMS', 'NOTES', 'ORDER'
    ],
    DELIVERY: [
      'DELIVERY FROM', 'HOME DELIVERY', 'DELIVERY CHARGE', 'PICKUP AND DROP'
    ],
    PAYMENT: [
      'PAY', 'PAY LATER', 'PAYMENT METHOD', 'PAY ON DELIVERY'
    ]
  };

  // Fetch terminology by language
  useEffect(() => {
    const fetchTerminologies = async () => {
      setIsLoading(true);
      try {
        const data = await getTerminologyByLanguage(language);
        setTerminologies(data.terms);  // ✅ This is correct
      } catch (error) {
        // If not found, initialize with defaults
        const defaultTerminologies = {};
        Object.values(termCategories).flat().forEach(term => {
          defaultTerminologies[term] = term;
        });
        setTerminologies(defaultTerminologies);
      }
      setIsLoading(false);
    };

    fetchTerminologies();
  }, [language]);

  // Handle term value change
  const handleTermChange = (term, value) => {
    setTerminologies(prev => ({
      ...prev,
      [term]: value
    }));
  };

  // Save API call
  const handleSave = async () => {
    setIsLoading(true);
    try {
      await saveTerminology(language, terminologies);
   toast.success('Terminologies saved successfully!');
    } catch (error) {
      console.error("Error saving terminologies:", error);
    toast.error('Failed to save terminologies.');
    }
    setIsLoading(false);
  };

  // Reset to defaults
  const handleCancel = () => {
    const defaultTerminologies = {};
    Object.values(termCategories).flat().forEach(term => {
      defaultTerminologies[term] = term;
    });
    setTerminologies(defaultTerminologies);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Terminology Management</h1>
              <p className="text-gray-600 mt-1">Customize system terminology for different languages</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <select
                  className="block appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                <option value="English">English</option>

<option value="Malayalam">Malayalam</option>
<option value="Tamil">Tamil</option>
<option value="Hindi">Hindi</option>


                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-64">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800">Categories</h2>
              </div>
              <nav className="divide-y divide-gray-200">
                {Object.keys(termCategories).map((category) => (
                  <button
                    key={category}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      activeCategory === category ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1">
            {isLoading ? (
              <div className="bg-white shadow rounded-lg p-8 flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                {/* Form Header */}
                <div className="p-4 border-b border-gray-200">
                  <h2 className="font-semibold text-gray-800">{activeCategory} Terminologies</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Edit terms for {language.toLowerCase()} language
                  </p>
                </div>

                {/* Form Fields */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {termCategories[activeCategory].map((term) => (
                      <div key={term} className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                          {term.replace(/_/g, ' ')}
                        </label>
                        <input
                          type="text"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                          value={terminologies[term] || ''}
                          onChange={(e) => handleTermChange(term, e.target.value)}
                          placeholder={`Enter ${term.toLowerCase()}...`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Footer */}
                <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminologyPage;
