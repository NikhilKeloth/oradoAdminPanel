import React, { useState } from "react";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
const EditDiscountModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    language: "English",
    name: "",
    value: "",
    description: "",
    from: null,
    till: null,
    addOnDiscount: false,
  });

  const languages = [
    { name: "English", code: "en" },
    { name: "Spanish", code: "es" },
    { name: "French", code: "fr" },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleDateChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
   <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        {/* Modal Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h4 className="text-xl font-semibold text-gray-800">Edit Discount</h4>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Language Dropdown */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <Dropdown
                  value={formData.language}
                  options={languages}
                  optionLabel="name"
                  onChange={(e) =>
                    setFormData({ ...formData, language: e.value })
                  }
                  placeholder="Choose"
                  className="w-full"
                />
              </div>

              {/* Promotion Name */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Promotion Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Discount Value */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  min={0}
                  max={100}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (max 150 characters){" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  maxLength={150}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* From Date */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From <span className="text-red-500">*</span>
                </label>
                <Calendar
                  value={formData.from}
                  onChange={(e) => handleDateChange("from", e.value)}
                  showTime
                  hourFormat="12"
                  className="w-full"
                />
              </div>

              {/* Till Date */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Till <span className="text-red-500">*</span>
                </label>
                <Calendar
                  value={formData.till}
                  onChange={(e) => handleDateChange("till", e.value)}
                  showTime
                  hourFormat="12"
                  className="w-full"
                />
              </div>

              {/* Discount on Addon */}
              <div className="form-group flex items-center">
                <label className="block text-sm font-medium text-gray-700 mr-4">
                  Discount on Addon
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="addOnDiscount"
                    checked={formData.addOnDiscount}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditDiscountModal;