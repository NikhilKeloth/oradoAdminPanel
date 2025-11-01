import { useState, useEffect } from 'react';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { getAllTemplates } from '../../../../apis/adminApis/templateApi'; // Import your API function

const TemplatesPage = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showSampleTemplates, setShowSampleTemplates] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await getAllTemplates();
        if (response.success) {
          // Transform the API data to match your component's expected format
          const formattedTemplates = response.templates.map(template => ({
            id: template._id,
            name: template.name,
            description: template.description,
            fields: template.fields,
            pricingRules: template.pricingRules
          }));
          setTemplates(formattedTemplates);
        }
      } catch (err) {
        console.error("Failed to fetch templates:", err);
        setError(err.message || "Failed to load templates");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const toggleDropdown = (templateId) => {
    setOpenDropdown(openDropdown === templateId ? null : templateId);
  };

  const handleEdit = (templateId) => {
    console.log("Edit template:", templateId);
    navigate(`/admin/agent-dashboard/settings/template/edit/${templateId}`);
  };

  const handleDuplicate = (templateId) => {
    setSelectedTemplate(templateId);
    setShowDuplicateModal(true);
    setOpenDropdown(null);
  };

  const handleDelete = async (templateId) => {
    try {
      // You'll need to implement deleteTemplate API function
      // await deleteTemplate(templateId);
      setTemplates(templates.filter(template => template.id !== templateId));
      setOpenDropdown(null);
    } catch (error) {
      console.error("Failed to delete template:", error);
      setError("Failed to delete template");
    }
  };

  const toggleAccordion = (section) => {
    setActiveAccordion(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCreateCustom = () => {
    navigate('/admin/agent-dashboard/settings/template/add');
  }; 

  const handleDuplicateTemplate = () => {
    if (newTemplateName.trim() && selectedTemplate) {
      const originalTemplate = templates.find(t => t.id === selectedTemplate);
      if (originalTemplate) {
        const duplicatedTemplate = {
          id: Date.now().toString(), // Temporary ID until saved to backend
          name: newTemplateName,
          description: originalTemplate.description,
          fields: [...originalTemplate.fields],
          pricingRules: [...originalTemplate.pricingRules]
        };
        setTemplates([...templates, duplicatedTemplate]);
        setNewTemplateName('');
        setShowDuplicateModal(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen p-4 md:p-6 flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-6">
      {/* Header Section */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Custom Templates</h2>
        <p className="text-sm md:text-base text-gray-600">
          Custom fields allow you to capture the information in a form that is specific to your business.
          <a href="#" className="text-blue-500 ml-1 hover:underline">Learn more</a>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <div className="relative w-full sm:w-auto">
          <button 
            onClick={() => setShowSampleTemplates(!showSampleTemplates)}
            className="flex items-center justify-center w-full sm:w-auto px-4 py-2 border border-yellow-500 rounded-full text-yellow-500 font-medium hover:shadow-md transition-all"
          >
            <span>Add From Library</span>
            <svg 
              className={`w-4 h-4 ml-2 transition-transform ${showSampleTemplates ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showSampleTemplates && (
            <div className="absolute z-10 mt-2 w-full sm:w-56 bg-white rounded-md shadow-lg py-1 border border-gray-200">
              <div className="px-4 py-2 text-sm text-gray-500 bg-gray-50 border-b">Sample Templates</div>
              <ul>
                <li className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center">
                  <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                    <span className="text-xs">1</span>
                  </span>
                  Invoice Template
                </li>
                <li className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center">
                  <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                    <span className="text-xs">2</span>
                  </span>
                  Delivery Template
                </li>
                <li className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center">
                  <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                    <span className="text-xs">3</span>
                  </span>
                  Service Template
                </li>
              </ul>
            </div>
          )}
        </div>

        <button 
          onClick={handleCreateCustom}
          className="w-full sm:w-auto px-4 py-2 bg-yellow-500 text-white rounded-full font-medium hover:bg-yellow-600 transition-colors"
        >
          Create Custom
        </button>
      </div>

      {/* Templates Grid */}
      <div>
        {templates.length > 0 ? (
          <>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Your Templates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {templates.map((template) => (
                <div key={template.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow px-4 py-4 border border-gray-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-800 truncate">{template.name}</h4>
                    
                    </div>
                    
                    {/* Dropdown Menu */}
                    <div className="relative">
                      <button 
                        onClick={() => toggleDropdown(template.id)}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        <EllipsisHorizontalIcon className="w-5 h-5" />
                      </button>
                      
                      {openDropdown === template.id && (
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 py-1 border border-gray-200">
                          <button 
                            onClick={() => handleEdit(template.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDuplicate(template.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Duplicate
                          </button>
                          <button 
                            onClick={() => handleDelete(template.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
            <h3 className="text-lg font-medium text-gray-700 mb-2">No templates found</h3>
            <p className="text-gray-500 mb-4">Create your first template to get started</p>
            <button 
              onClick={handleCreateCustom}
              className="px-4 py-2 bg-yellow-500 text-white rounded-full font-medium hover:bg-yellow-600 transition-colors"
            >
              Create Template
            </button>
          </div>
        )}
      </div>

      {/* Duplicate Template Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Duplicate Template</h3>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">New Template Name</label>
              <input
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Enter new template name"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setNewTemplateName('');
                  setShowDuplicateModal(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDuplicateTemplate}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
              >
                Duplicate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesPage;