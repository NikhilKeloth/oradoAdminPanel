import React, { useState } from 'react';
import { FiPlus } from 'react-icons/fi';

const MerchantCampaigns = () => {
  const [selectedMerchants, setSelectedMerchants] = useState(['Green Treat']);
  const [selectAll, setSelectAll] = useState(false);
  const [campaignData, setCampaignData] = useState({
    title: '',
    message: '',
    expiryDays: '',
    useImage: false,
    image: null
  });
  const [preview, setPreview] = useState({
    title: 'Your Message Title here',
    message: 'Your Message Content here'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCampaignData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Update preview
    if (name === 'broadcast_title') {
      setPreview(prev => ({ ...prev, title: value || 'Your Message Title here' }));
    } else if (name === 'user_first_message') {
      setPreview(prev => ({ ...prev, message: value || 'Your Message Content here' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCampaignData(prev => ({
        ...prev,
        image: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Campaign data:', campaignData);
    console.log('Selected merchants:', selectedMerchants);
    // Add your API call here
  };

  return (
    <div className="h-100 p-4">
      <div className="app_update_message mb-4">
        <span className="error-star">**</span>
        <span style={{ direction: 'ltr' }}>(Make sure your apps are updated)</span>
      </div>

      <form onSubmit={handleSubmit} className="containerDiv">
        {/* Audience Selection Block */}
        <div className="blocks mb-6 p-4 border border-dashed border-gray-300 rounded-lg relative">
          <div className="absolute top-0 left-0 w-full h-1 dotted_border"></div>
          <span className="plusminus absolute -top-3 -left-3 bg-white text-blue-800 text-xl rounded-full w-6 h-6 flex items-center justify-center">
            <FiPlus className="icon" />
          </span>
          
          <div className="blocks__column">
            <div className="choose_audience mb-4">
              <div style={{ direction: 'ltr' }} className="font-semibold">Choose Your Audience</div>
              <div className="count text-sm text-gray-500" style={{ direction: 'ltr' }}>
                {selectedMerchants.length} selected
              </div>
            </div>
            
            <div className="multiselect flex items-center mb-4">
              <span style={{ margin: '10px 5px' }} className="text-sm">Select All</span>
              <label className="switch custom-switch" style={{ marginBottom: '0px', marginLeft: '3px', marginTop: '6px' }}>
                <input 
                  type="checkbox" 
                  checked={selectAll}
                  onChange={() => setSelectAll(!selectAll)}
                />
                <span className="slider round"></span>
              </label>
            </div>
            
            <div className="relative w-full">
              <select 
                className="w-full p-2 border border-gray-300 rounded"
                value={selectedMerchants[0]}
                onChange={(e) => setSelectedMerchants([e.target.value])}
              >
                <option value="Green Treat">Green Treat</option>
                {/* Add more merchant options here */}
              </select>
              <div className="absolute right-3 top-3 pointer-events-none">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z" fill="currentColor"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Message Block */}
        <div className="blocks mb-6 p-4 border border-dashed border-gray-300 rounded-lg relative">
          <div className="absolute top-0 left-0 w-full h-1 dotted_border"></div>
          <span className="plusminus absolute -top-3 -left-3 bg-white text-blue-800 text-xl rounded-full w-6 h-6 flex items-center justify-center">
            <FiPlus className="icon" />
          </span>
          
          <div className="blocks__column">
            <div className="choose_audience mb-4">
              <div style={{ direction: 'ltr' }} className="font-semibold">Message</div>
            </div>
            
            <div className="blocks2 flex flex-col md:flex-row gap-6">
              {/* Message Form */}
              <div className="inner_block w-full md:w-1/2">
                <div style={{ direction: 'ltr' }} className="font-medium mb-2">Mobile Push Notification</div>
                
                <input
                  type="text"
                  name="broadcast_title"
                  value={campaignData.title}
                  onChange={handleInputChange}
                  className="input1 w-full p-2 border border-gray-300 rounded mb-4"
                  placeholder="Enter Message title"
                  style={{ direction: 'ltr' }}
                />
                
                <textarea
                  name="user_first_message"
                  value={campaignData.message}
                  onChange={handleInputChange}
                  className="textarea w-full p-2 border border-gray-300 rounded mb-4 h-32"
                  style={{ direction: 'ltr' }}
                ></textarea>
                
                <div className="inputs__3 flex flex-col md:flex-row gap-4 mb-4">
                  <div className="input__1 w-full md:w-1/2">
                    <div className="heading font-medium mb-1" style={{ direction: 'ltr' }}>Expire Days</div>
                    <input
                      type="number"
                      name="expiry_days"
                      value={campaignData.expiryDays}
                      onChange={handleInputChange}
                      className="expiry_days w-full p-2 border border-gray-300 rounded"
                    />
                    <br />
                    <span className="sub_heading text-xs text-gray-500" style={{ direction: 'ltr' }}>
                      (Number of days after which notification will expire. Set 0 for lifetime validity)
                    </span>
                  </div>
                  
                  <div className="input__1 w-full md:w-1/2">
                    <div className="input__1__image-container flex flex-col items-center">
                      <div style={{ margin: '10px' }} className="text-center">
                        <img 
                          className="img mb-2 w-20 h-20 object-cover border border-gray-200" 
                          src={campaignData.image || "assets/images/add_cat_dummy.svg"} 
                          alt="Campaign"
                        />
                        <label htmlFor="logo" style={{ color: 'rgb(16, 67, 153)' }} className="cursor-pointer">
                          Choose Image
                          <input
                            type="file"
                            id="logo"
                            name="logo"
                            className="input_hidden hidden"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                      
                      <div style={{ margin: '10px' }} className="flex items-center">
                        <label className="switch custom-switch" style={{ marginBottom: '0px', marginLeft: '3px', marginRight: '3px' }}>
                          <input
                            type="checkbox"
                            checked={campaignData.useImage}
                            onChange={() => setCampaignData(prev => ({
                              ...prev,
                              useImage: !prev.useImage
                            }))}
                          />
                          <span className="slider round"></span>
                        </label>
                        <span>Use Image</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Preview */}
              <div className="preview w-full md:w-1/2">
                <div className="preview__mobile bg-gray-100 p-4 rounded-lg">
                  <div className="preview__mobile__inner bg-white p-4 rounded shadow">
                    <div className="preview__mobile__inner__cross absolute top-2 right-2 w-4 h-4"></div>
                    <div className="preview__mobile__inner__text font-semibold mb-2" style={{ direction: 'ltr' }}>
                      {preview.title}
                    </div>
                    <div className="preview__mobile__inner__text__sub text-sm text-gray-600" style={{ direction: 'ltr' }}>
                      {preview.message}
                    </div>
                    {campaignData.image && campaignData.useImage && (
                      <img 
                        src={campaignData.image} 
                        alt="Preview" 
                        className="mt-2 w-full h-auto rounded"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="btn btn-new bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          style={{ direction: 'ltr' }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default MerchantCampaigns;