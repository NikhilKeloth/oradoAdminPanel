import { useState, useEffect } from "react";
import {
  FiPlus,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiInfo,
} from "react-icons/fi";
import { getAllTemplates } from "../../../../apis/adminApis/templateApi";

const CityModal = ({
  onClose,
  onSave,
  geofences = [],
  mode = "add",
  initialData = null,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    assigningGeofences: [],
    is_normal_order_active: false,
    normal_order_charge_calculation: false,
    normal_orders_charge_type: "Fixed",
    normal_orders_fixed_charges: "",
    dynamic_charges_template_normal_orders: "",
    dynamic_charges_template_schedule_order: "",
    earning_template_normal_order: "",
    is_custom_order_active: false,
    custom_order_charge_calculation: false,
    city_charge_type: "Fixed",
    fixed_delivery_charges: "",
    status: true,
  });

  const [errors, setErrors] = useState({
    name: false,
    assigningGeofences: false,
  });

  const [dropdowns, setDropdowns] = useState({
    assigningGeofences: false,
    dynamic_charges_template_normal_orders: false,
    dynamic_charges_template_schedule_order: false,
    earning_template_normal_order: false,
  });

  const [templates, setTemplates] = useState([]);

  // Initialize form data when mode or initialData changes
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        assigningGeofences: initialData.geofences || [],
        is_normal_order_active: initialData.isNormalOrderActive,
        normal_order_charge_calculation:
          initialData.normalOrderChargeCalculation,
        normal_orders_charge_type: initialData.normalOrdersChargeType,
        normal_orders_fixed_charges:
          initialData.fixedDeliveryChargesNormalOrders?.toString() || "",
        dynamic_charges_template_normal_orders:
          initialData.dynamicChargesTemplateNormalOrders || "",
        dynamic_charges_template_schedule_order:
          initialData.dynamicChargesTemplateScheduleOrder || "",
        earning_template_normal_order:
          initialData.earningTemplateNormalOrder || "",
        is_custom_order_active: initialData.isCustomOrderActive,
        custom_order_charge_calculation:
          initialData.customOrderChargeCalculation,
        city_charge_type: initialData.cityChargeType,
        fixed_delivery_charges:
          initialData.fixedDeliveryChargesCustomOrders?.toString() || "",
        status: initialData.status,
      });
    }
  }, [mode, initialData]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const result = await getAllTemplates();
        setTemplates(result.templates);
      } catch (error) {
        console.error("Failed to fetch templates", error);
      }
    };

    fetchTemplates();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleDropdown = (name) => {
    setDropdowns((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleGeofenceToggle = (geofenceId) => {
    setFormData((prev) => {
      const newGeofences = prev.assigningGeofences.includes(geofenceId)
        ? prev.assigningGeofences.filter((id) => id !== geofenceId)
        : [...prev.assigningGeofences, geofenceId];

      setErrors((prevErrors) => ({
        ...prevErrors,
        assigningGeofences: newGeofences.length === 0,
      }));

      return {
        ...prev,
        assigningGeofences: newGeofences,
      };
    });
  };

  const toggleSelectAllGeofences = (selectAll) => {
    setFormData((prev) => {
      const newGeofences = selectAll ? geofences.map((g) => g._id) : [];

      setErrors((prevErrors) => ({
        ...prevErrors,
        assigningGeofences: newGeofences.length === 0,
      }));

      return {
        ...prev,
        assigningGeofences: newGeofences,
      };
    });
  };

  const validateForm = () => {
    const newErrors = {
      name: formData.name.trim() === "",
      assigningGeofences: formData.assigningGeofences.length === 0,
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        ...formData,
        geofences: formData.assigningGeofences,
      });
    }
  };

  const getTemplateName = (templateId) => {
    const template = templates.find((t) => t._id === templateId);
    return template ? template.name : "";
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Blur backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div
          className="bg-white rounded-lg w-full max-w-2xl mx-4 shadow-xl transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="border-b px-6 py-4 flex justify-between items-center bg-gray-50 rounded-t-lg">
            <h3 className="text-lg font-semibold text-gray-800">
              {mode === "add" ? "Add City" : "Edit City"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Body */}
          <form
            onSubmit={handleSubmit}
            className="p-6 max-h-[80vh] overflow-y-auto"
          >
            {/* Name Field */}
            <div className="mb-4 flex">
              <label className="w-1/3 text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <div className="w-2/3">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={100}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#FC8019] focus:border-[#FC8019] outline-none transition-all ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">Name is required</p>
                )}
              </div>
            </div>

            {/* Description Field */}
            <div className="mb-4 flex">
              <label className="w-1/3 text-sm font-medium text-gray-700">
                Description
              </label>
              <div className="w-2/3">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  maxLength={500}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FC8019] focus:border-[#FC8019] outline-none transition-all"
                  placeholder="Please enter description"
                />
              </div>
            </div>

            {/* Assign Geofence */}
            <div className="mb-4 flex">
              <label className="w-1/3 text-sm font-medium text-gray-700">
                Assign Geofence <span className="text-red-500">*</span>
              </label>
              <div className="w-2/3 relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown("assigningGeofences")}
                  className={`w-full px-3 py-2 border rounded-md text-left flex justify-between items-center ${
                    errors.assigningGeofences
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                >
                  <span>
                    {formData.assigningGeofences.length > 0
                      ? `${formData.assigningGeofences.length} geofence(s) selected`
                      : "Choose"}
                  </span>
                  {dropdowns.assigningGeofences ? (
                    <FiChevronUp />
                  ) : (
                    <FiChevronDown />
                  )}
                </button>

                {dropdowns.assigningGeofences && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 border-b">
                      <label className="flex items-center px-2 py-1 hover:bg-gray-100 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={
                            formData.assigningGeofences.length ===
                            geofences.length
                          }
                          onChange={(e) =>
                            toggleSelectAllGeofences(e.target.checked)
                          }
                          className="h-4 w-4 text-[#FC8019] rounded border-gray-300 focus:ring-[#FC8019]"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Select All
                        </span>
                      </label>
                    </div>
                    {geofences.map((geofence) => (
                      <label
                        key={geofence._id}
                        className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.assigningGeofences.includes(
                            geofence._id
                          )}
                          onChange={() => handleGeofenceToggle(geofence._id)}
                          className="h-4 w-4 text-[#FC8019] rounded border-gray-300 focus:ring-[#FC8019]"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {geofence.regionName}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
                {errors.assigningGeofences && (
                  <p className="mt-1 text-sm text-red-500">
                    At least one geofence is required
                  </p>
                )}
              </div>
            </div>

            {/* Enable Orders */}
            <div className="mb-4 flex items-center">
              <label className="w-1/3 text-sm font-medium text-gray-700">
                Enable Orders
              </label>
              <div className="w-2/3">
                <label className="switch custom-switch">
                  <input
                    type="checkbox"
                    name="is_normal_order_active"
                    checked={formData.is_normal_order_active}
                    onChange={handleChange}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>

            {/* Enable Order Charge Calculation */}
            {formData.is_normal_order_active && (
              <div className="mb-4 flex items-center">
                <label className="w-2/3 text-sm text-gray-700">
                  Enable this toggle to define Delivery Charges for Order at
                  City Level
                </label>
                <div className="w-1/3">
                  <label className="switch custom-switch">
                    <input
                      type="checkbox"
                      name="normal_order_charge_calculation"
                      checked={formData.normal_order_charge_calculation}
                      onChange={handleChange}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
            )}

            {/* Delivery Charge Type */}
            {formData.is_normal_order_active &&
              formData.normal_order_charge_calculation && (
                <>
                  <div className="mb-4 flex items-center">
                    <label className="w-1/3 text-sm font-medium text-gray-700 flex items-center">
                      Delivery Charge
                      <FiInfo className="ml-1 text-gray-500" />
                    </label>
                    <div className="w-2/3 flex">
                      <label className="checkbox-box mb-0 field-data mr-4">
                        <div className="check-radio">
                          <input
                            type="radio"
                            name="normal_orders_charge_type"
                            value="Fixed"
                            checked={
                              formData.normal_orders_charge_type === "Fixed"
                            }
                            onChange={handleChange}
                          />
                          <span className="tf check"></span>
                        </div>
                        <span className="radio-ck-label">Fixed</span>
                      </label>
                      <label className="checkbox-box mb-0 field-data">
                        <div className="check-radio">
                          <input
                            type="radio"
                            name="normal_orders_charge_type"
                            value="Dynamic"
                            checked={
                              formData.normal_orders_charge_type === "Dynamic"
                            }
                            onChange={handleChange}
                          />
                          <span className="tf check"></span>
                        </div>
                        <span className="radio-ck-label">Dynamic</span>
                      </label>
                    </div>
                  </div>

                  {/* Static Charges for Normal Orders */}
                  {formData.normal_orders_charge_type === "Fixed" && (
                    <div className="mb-4 flex">
                      <label className="w-1/3 text-sm font-medium text-gray-700">
                        Static Charges <span className="text-red-500">*</span>
                      </label>
                      <div className="w-2/3">
                        <input
                          type="number"
                          name="normal_orders_fixed_charges"
                          value={formData.normal_orders_fixed_charges}
                          onChange={handleChange}
                          maxLength={5}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FC8019] focus:border-[#FC8019] outline-none transition-all"
                          placeholder="Enter Static Delivery Charges"
                        />
                      </div>
                    </div>
                  )}

                  {/* Dynamic Templates for Normal Orders */}
                  {formData.normal_orders_charge_type === "Dynamic" && (
                    <>
                      <div className="mb-4 flex">
                        <label className="w-1/3 text-sm font-medium text-gray-700">
                          Delivery Template{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="w-2/3 relative">
                          <button
                            type="button"
                            onClick={() =>
                              toggleDropdown(
                                "dynamic_charges_template_normal_orders"
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-left flex justify-between items-center"
                          >
                            <span>
                              {getTemplateName(
                                formData.dynamic_charges_template_normal_orders
                              ) || "Choose"}
                            </span>
                            {dropdowns.dynamic_charges_template_normal_orders ? (
                              <FiChevronUp />
                            ) : (
                              <FiChevronDown />
                            )}
                          </button>
                          {dropdowns.dynamic_charges_template_normal_orders && (
                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                              {templates.map((template) => (
                                <div
                                  key={template._id}
                                  className={`px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center ${
                                    formData.dynamic_charges_template_normal_orders ===
                                    template._id
                                      ? "bg-gray-100"
                                      : ""
                                  }`}
                                  onClick={() => {
                                    setFormData({
                                      ...formData,
                                      dynamic_charges_template_normal_orders:
                                        template._id,
                                    });
                                    toggleDropdown(
                                      "dynamic_charges_template_normal_orders"
                                    );
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={
                                      formData.dynamic_charges_template_normal_orders ===
                                      template._id
                                    }
                                    readOnly
                                    className="h-4 w-4 text-[#FC8019] rounded border-gray-300 focus:ring-[#FC8019] mr-2"
                                  />
                                  {template.name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mb-4 flex">
                        <label className="w-1/3 text-sm font-medium text-gray-700">
                          On Demand Orders
                        </label>
                        <div className="w-2/3 relative">
                          <button
                            type="button"
                            onClick={() =>
                              toggleDropdown(
                                "dynamic_charges_template_schedule_order"
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-left flex justify-between items-center"
                          >
                            <span>
                              {getTemplateName(
                                formData.dynamic_charges_template_schedule_order
                              ) || "Choose"}
                            </span>
                            {dropdowns.dynamic_charges_template_schedule_order ? (
                              <FiChevronUp />
                            ) : (
                              <FiChevronDown />
                            )}
                          </button>
                          {dropdowns.dynamic_charges_template_schedule_order && (
                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                              {templates.map((template) => (
                                <div
                                  key={template._id}
                                  className={`px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center ${
                                    formData.dynamic_charges_template_schedule_order ===
                                    template._id
                                      ? "bg-gray-100"
                                      : ""
                                  }`}
                                  onClick={() => {
                                    setFormData({
                                      ...formData,
                                      dynamic_charges_template_schedule_order:
                                        template._id,
                                    });
                                    toggleDropdown(
                                      "dynamic_charges_template_schedule_order"
                                    );
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={
                                      formData.dynamic_charges_template_schedule_order ===
                                      template._id
                                    }
                                    readOnly
                                    className="h-4 w-4 text-[#FC8019] rounded border-gray-300 focus:ring-[#FC8019] mr-2"
                                  />
                                  {template.name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mb-4 flex">
                        <label className="w-1/3 text-sm font-medium text-gray-700">
                          Earning Template{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="w-2/3 relative">
                          <button
                            type="button"
                            onClick={() =>
                              toggleDropdown("earning_template_normal_order")
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-left flex justify-between items-center"
                          >
                            <span>
                              {getTemplateName(
                                formData.earning_template_normal_order
                              ) || "Choose"}
                            </span>
                            {dropdowns.earning_template_normal_order ? (
                              <FiChevronUp />
                            ) : (
                              <FiChevronDown />
                            )}
                          </button>
                          {dropdowns.earning_template_normal_order && (
                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                              {templates.map((template) => (
                                <div
                                  key={template._id}
                                  className={`px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center ${
                                    formData.earning_template_normal_order ===
                                    template._id
                                      ? "bg-gray-100"
                                      : ""
                                  }`}
                                  onClick={() => {
                                    setFormData({
                                      ...formData,
                                      earning_template_normal_order: template._id,
                                    });
                                    toggleDropdown(
                                      "earning_template_normal_order"
                                    );
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={
                                      formData.earning_template_normal_order ===
                                      template._id
                                    }
                                    readOnly
                                    className="h-4 w-4 text-[#FC8019] rounded border-gray-300 focus:ring-[#FC8019] mr-2"
                                  />
                                  {template.name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

            {/* Enable Custom Order */}
            <div className="mb-4 flex items-center">
              <label className="w-1/3 text-sm font-medium text-gray-700">
                Enable Custom Order
              </label>
              <div className="w-2/3">
                <label className="switch custom-switch">
                  <input
                    type="checkbox"
                    name="is_custom_order_active"
                    checked={formData.is_custom_order_active}
                    onChange={handleChange}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>

            {/* Custom Order Charge Calculation */}
            {formData.is_custom_order_active && (
              <div className="mb-4 flex items-center">
                <label className="w-2/3 text-sm text-gray-700">
                  Enable this toggle to define Delivery for Custom Order at City
                  Level
                </label>
                <div className="w-1/3">
                  <label className="switch custom-switch">
                    <input
                      type="checkbox"
                      name="custom_order_charge_calculation"
                      checked={formData.custom_order_charge_calculation}
                      onChange={handleChange}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
            )}

            {/* Custom Order Charge Type */}
            {formData.is_custom_order_active &&
              formData.custom_order_charge_calculation && (
                <>
                  <div className="mb-4 flex items-center">
                    <label className="w-1/3 text-sm font-medium text-gray-700 flex items-center">
                      Delivery Charge
                      <FiInfo className="ml-1 text-gray-500" />
                    </label>
                    <div className="w-2/3 flex">
                      <label className="checkbox-box mb-0 field-data mr-4">
                        <div className="check-radio">
                          <input
                            type="radio"
                            name="city_charge_type"
                            value="Fixed"
                            checked={formData.city_charge_type === "Fixed"}
                            onChange={handleChange}
                          />
                          <span className="tf check"></span>
                        </div>
                        <span className="radio-ck-label">Fixed</span>
                      </label>
                      <label className="checkbox-box mb-0 field-data">
                        <div className="check-radio">
                          <input
                            type="radio"
                            name="city_charge_type"
                            value="Dynamic"
                            checked={formData.city_charge_type === "Dynamic"}
                            onChange={handleChange}
                          />
                          <span className="tf check"></span>
                        </div>
                        <span className="radio-ck-label">Dynamic</span>
                      </label>
                    </div>
                  </div>

                  {/* Static Charges for Custom Orders */}
                  {formData.city_charge_type === "Fixed" && (
                    <div className="mb-4 flex">
                      <label className="w-1/3 text-sm font-medium text-gray-700">
                        Static Charges <span className="text-red-500">*</span>
                      </label>
                      <div className="w-2/3">
                        <input
                          type="number"
                          name="fixed_delivery_charges"
                          value={formData.fixed_delivery_charges}
                          onChange={handleChange}
                          maxLength={5}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FC8019] focus:border-[#FC8019] outline-none transition-all"
                          placeholder="Enter Static Delivery Charges"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

            {/* Status */}
            <div className="mb-4 flex items-center">
              <label className="w-1/3 text-sm font-medium text-gray-700">
                Status
              </label>
              <div className="w-2/3">
                <label className="switch custom-switch">
                  <input
                    type="checkbox"
                    name="status"
                    checked={formData.status}
                    onChange={handleChange}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 border-t pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  !formData.name || formData.assigningGeofences.length === 0
                }
                className={`px-4 py-2 rounded-md text-sm font-medium text-white transition-colors ${
                  !formData.name || formData.assigningGeofences.length === 0
                    ? "bg-[#FC8019]/50 cursor-not-allowed"
                    : "bg-[#FC8019] hover:bg-[#e67317]"
                }`}
              >
                {mode === "add" ? "Add City" : "Update City"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CityModal;