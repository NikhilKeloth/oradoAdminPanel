import React, { useState } from "react";
import LocationPicker from "../map/LocationPicker";

export default function EditAddressForm({ address, onClose, onUpdate }) {
  const [form, setForm] = useState({
    type: address.type || "Other",
    street: address.street || "",
    city: address.city || "",
    state: address.state || "",
    zip: address.zip || "",
    displayName: address.displayName || "",
    latitude: address.location?.latitude || "",
    longitude: address.location?.longitude || "",
    addressId: address.addressId,  // fixed here
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLocationSelect = (location) => {
    setForm((prev) => ({
      ...prev,
      street: location.street,
      city: location.city,
      state: location.state,
      zip: location.zip,
      latitude: location.latitude,
      longitude: location.longitude,
      displayName: location.displayName,
    }));
  };

  const handleSubmit = async () => {
    try {
      onUpdate(form); // send updated form back to parent
      onClose();
    } catch (error) {
      console.error("Failed to update address", error);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-white w-[90%] max-w-5xl h-[90%] rounded-lg shadow-lg flex flex-col relative p-6 overflow-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">Edit Address</h2>

        <div className="flex flex-1 gap-6">
          {/* Left: Map */}
          <div className="flex-1 border rounded-lg overflow-hidden">
            <LocationPicker onSelectLocation={handleLocationSelect} />
          </div>

          {/* Right: Form */}
          <div className="flex-1 flex flex-col gap-4">
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="border p-2 rounded"
            >
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>

            <input
              type="text"
              name="street"
              placeholder="Street"
              value={form.street}
              onChange={handleChange}
              className="border p-2 rounded"
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
              className="border p-2 rounded"
            />
            <input
              type="text"
              name="state"
              placeholder="State"
              value={form.state}
              onChange={handleChange}
              className="border p-2 rounded"
            />
            <input
              type="text"
              name="zip"
              placeholder="ZIP Code"
              value={form.zip}
              onChange={handleChange}
              className="border p-2 rounded"
            />

            <div className="p-2 bg-gray-100 rounded text-gray-700">
              {form.displayName || "No location selected"}
            </div>

            <button
              onClick={handleSubmit}
              className="bg-orange-600 text-white p-2 rounded mt-auto"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
