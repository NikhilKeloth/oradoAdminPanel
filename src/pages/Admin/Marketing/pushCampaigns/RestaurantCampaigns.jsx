import { useState } from 'react';

const RestaurantCampaigns = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [expiryDays, setExpiryDays] = useState('');
  const [useImage, setUseImage] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSendNotification = () => {
    // Example send logic
    console.log({
      title,
      message,
      expiryDays,
      useImage,
      imageFile
    });
    alert('Notification Sent!');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Mobile Push Notification</h2>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Message Title</label>
          <input
            type="text"
            placeholder="Enter message title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded p-2 focus:ring focus:ring-blue-300 outline-none"
          />
        </div>

        {/* Message */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Message</label>
          <textarea
            placeholder="Enter message content"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border rounded p-2 h-24 focus:ring focus:ring-blue-300 outline-none"
          />
        </div>

        {/* Expiry Days */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Expire Days</label>
          <input
            type="number"
            placeholder="0 for lifetime"
            value={expiryDays}
            onChange={(e) => setExpiryDays(e.target.value)}
            className="w-full border rounded p-2 focus:ring focus:ring-blue-300 outline-none"
          />
          <p className="text-sm text-gray-500 mt-1">
            (Number of days after which notification expires. Set 0 for lifetime.)
          </p>
        </div>

        {/* Image Upload */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Choose Image</label>
          <input type="file" onChange={handleImageChange} className="mb-2" />
          {imageFile && (
            <img
              src={URL.createObjectURL(imageFile)}
              alt="Preview"
              className="w-24 h-24 object-cover rounded"
            />
          )}
        </div>

        {/* Use Image Toggle */}
        <div className="flex items-center mb-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useImage}
              onChange={(e) => setUseImage(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="ml-2 text-gray-700">Use Image</span>
          </label>
        </div>

        {/* Mobile Preview */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Live Preview</h3>
          <div className="w-64 bg-gray-100 border rounded-lg p-4 space-y-2 shadow-md">
            {useImage && imageFile && (
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Preview"
                className="w-full h-32 object-cover rounded"
              />
            )}
            <div className="text-base font-medium text-gray-800">{title || 'Message Title'}</div>
            <div className="text-sm text-gray-600">{message || 'Notification message will appear here.'}</div>
          </div>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSendNotification}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Send Notification
        </button>
      </div>
    </div>
  );
};

export default RestaurantCampaigns;
