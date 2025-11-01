import React from 'react';

const ImageUploader = ({ onFilesSelected }) => {
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  return (
    <div>
      <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer">
        <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
        Upload Images
        <input
          type="file"
          id="product-images"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="sr-only"
        />
      </label>
      <span className="ml-2 text-sm text-gray-500">Max 5 images</span>
    </div>
  );
};

export default ImageUploader;