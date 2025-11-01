import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  EllipsisHorizontalIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import PricingRulesModal from "./PricingRulesModal";
import { createTemplate } from "../../../../apis/adminApis/templateApi";

const AddTemplate = () => {
  // Template form state
  const [templateName, setTemplateName] = useState("");
  const [items, setItems] = useState([
    {
      id: "1",
      display_name: "",
      app_side: 1,
      customer_type: 0,
      data_type: "",
      required: 0,
      is_tag: 0,
      before_start: 0,
      input: "",
    },
  ]);

  // Accordion state
  const [activeAccordion, setActiveAccordion] = useState({
    notifications: false,
    invoice: false,
    pricing: false,
  });

  // Pricing rules state
  const [showRuleModal, setShowRuleModal] = useState(false);

const [pricingRules, setPricingRules] = useState([
  {
    id: 1,
    name: "Default Pricing",
    type: "task_pricing",
    pricingMode: "simple",
    simplePricing: {
      baseFare: 50,
      durationFare: 2,
      distanceFare: 8,
      waitingFare: 1,
      surgeEnabled: false,
      baseDuration: 5,
      baseDistance: 3,
      baseWaitingTime: 3
    },
    ranges: []
  }
]);

  // Field types
  const dataTypes = [
    "Barcode",
    "Checkbox",
    "Checklist",
    "Date",
    "Date-Future",
    "Date-Past",
    "Date-Time",
    "Datetime-Future",
    "Datetime-Past",
    "Dropdown",
    "Email",
    "Image",
    "Video",
    "Number",
    "Telephone",
    "Text",
    "Signature",
    "URL",
    "Table",
    "Audio",
    "Document",
    "BarcodeVerification",
    "DocumentWithExpiry",
    "Conditional-Dropdown",
    "Conditional-Checkbox",
  ];

  // Template field methods
  const addNewRow = () => {
    setItems([
      ...items,
      {
        id: `${items.length + 1}`,
        display_name: "",
        app_side: 1,
        customer_type: 0,
        data_type: "",
        required: 0,
        is_tag: 0,
        before_start: 0,
        input: "",
      },
    ]);
  };

  const removeRow = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === "data_type") {
            updatedItem.input = "";
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);
    setItems(newItems);
  };

  // Accordion toggle
  const toggleAccordion = (section) => {
    setActiveAccordion((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Pricing rules methods
const handleSaveRule = (newRule) => {
  const isRangeBased = newRule.formData.rangeBased;
  const isAgentEarning = newRule.formData.basicearningState === 1;

  const transformedRule = {
    id: pricingRules.length + 1,
    name: newRule.formData.name,
    type: isAgentEarning ? "agent_earning" : "task_pricing",
    pricingMode: isRangeBased ? "range_based" : "simple",
    simplePricing: isRangeBased ? null : {
      baseFare: parseFloat(newRule.pricingData.base.fare) || 0,
      durationFare: parseFloat(newRule.pricingData.duration.charge) || 0,
      distanceFare: parseFloat(newRule.pricingData.distance.fare) || 0,
      waitingFare: parseFloat(newRule.pricingData.waiting_time_data.waiting_fare) || 0,
      surgeEnabled: newRule.formData.dynamic_surge || false,
      baseDuration: parseFloat(newRule.pricingData.duration.base_duration_fee) || 0,
      baseDistance: parseFloat(newRule.pricingData.distance.base_distance_fee) || 0,
      baseWaitingTime: parseFloat(newRule.pricingData.waiting_time_data.base_waiting_time) || 0
    },
    ranges: isRangeBased ? newRule.rangeBasedData.map((range, index, array) => ({
      fromDistance: index === 0 ? 0 : parseFloat(array[index-1].distanceLimit) || 0,
      toDistance: range.isDefault ? null : parseFloat(range.distanceLimit),
      baseFare: parseFloat(range.base.fare) || 0,
      durationFare: parseFloat(range.duration.charge) || 0,
      distanceFare: parseFloat(range.distance.fare) || 0,
      waitingFare: parseFloat(range.waitingTime.fare) || 0,
      baseDuration: parseFloat(range.duration.baseDuration) || 0,
      baseDistance: parseFloat(range.distance.baseDistance) || 0,
      baseWaitingTime: parseFloat(range.waitingTime.baseWaiting) || 0,
      surgeEnabled: range.surge.dynamic || false
    })) : null
  };

  setPricingRules(prev => [...prev, transformedRule]);
  setShowRuleModal(false);
};

  const handleDeleteRule = (id) => {
    setPricingRules(pricingRules.filter((rule) => rule.id !== id));
  };



const handleSubmit = async () => {
  // Basic validation
  if (!templateName.trim()) {
    alert('Please enter a template name');
    return;
  }

  if (items.some(item => !item.display_name.trim() || !item.data_type)) {
    alert('Please fill all required fields for all items');
    return;
  }

  if (pricingRules.length === 0) {
    alert('Please add at least one pricing rule');
    return;
  }

  try {
    const templateData = {
      name: templateName,
      description: "Template for delivery pricing and agent earning configurations",
      fields: items.map(item => ({
        name: item.display_name,
        type: item.data_type.toLowerCase(),
        permissions: { 
          agent: item.app_side,
          customer: item.customer_type 
        },
        mandatory: item.required === 1,
        defaultValue: item.input || undefined
      })),
      pricingRules: pricingRules,
      notifications: {
        popupFields: ["Customer Name", "Order Amount"]
      },
      isActive: true
    };

    const response = await createTemplate(templateData);
    alert('Template created successfully!');
    
    // Optional: Reset form or redirect
    // setTemplateName("");
    // setItems([...initialItemState]);
    // setPricingRules([...initialPricingRules]);
    
  } catch (error) {
    console.error('Error creating template:', error);
    alert(`Failed to create template: ${error.message || 'Unknown error'}`);
  }
};
  return (
    <div className="col-span-12 shadow-box mb-4 relative bg-white rounded-lg p-4">
      <div className="row">
        <div className="col-span-12 mb-4">
          <label className="text-xs tracking-wider block mb-1">
            <span
              className="cursor-help"
              title="Give an easy name to your template, so that you can choose the right one while creating a task."
            >
              Template Name
            </span>
          </label>
          <input
            type="text"
            maxLength={35}
            className="w-full p-2 border-b border-gray-300 focus:outline-none focus:border-blue-500"
            placeholder="Template Name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />
        </div>
      </div>

      <div className="w-full">
        <div className="row-color-top col-span-12 bg-gray-100 rounded-t-lg flex">
          <div className="col-span-9 flex">
            <div className="col-span-2 p-3 pl-4">
              <span
                className="cursor-help"
                title="Field names reflect directly in the agent mobile app, so keep them relevant."
              >
                Field Name
              </span>
            </div>
            <div className="col-span-2 p-3">
              <span
                className="cursor-help"
                title="Permission to read only (agents can only see), read & write (agents can add or modify the field) or it is hidden from agents."
              >
                Agent can
              </span>
            </div>
            <div className="col-span-2 p-3">
              <span
                className="cursor-help"
                title="Permission to read only (customers can only see), read & write (customers can add or modify the field) or it is hidden from customers."
              >
                Customer can
              </span>
            </div>
            <div className="col-span-2 p-3">
              <span
                className="cursor-help"
                title="Validate the data entered, with the correct data type. You get options like number, email, text and more..."
              >
                Field type
              </span>
            </div>
            <div className="col-span-2 p-3">
              <span
                className="cursor-help"
                title="Pre-define the value of the field, add the value while creating a task or (with read/write option) allow agents to add the value from the mobile app."
              >
                Value
              </span>
            </div>
            <div className="col-span-2 p-3">
              <span
                className="cursor-help"
                title="Choose whether the field is mandatory or not mandatory while starting/completing the task. (Agent can't start/complete the task if mandatory fields are not filled)"
              >
                Mandatory
              </span>
            </div>
          </div>
          <div className="col-span-1 p-3">
            <span
              className="cursor-help"
              title="Choose whether the field values should be treated as Tags or not."
            >
              Send as Tag
            </span>
          </div>
          <div className="col-span-2 p-3 flex">
            <div className="col-span-9">
              <span
                className="cursor-help"
                title="Choose the field that you want to be editable before starting the task. (Agent can't start the task if mandatory fields are not filled."
              >
                EDIT BEFORE START
              </span>
            </div>
            <div className="col-span-3"></div>
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="template-fields">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {items.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="row-color col-span-12 bg-white border-b border-gray-200 flex items-center py-2"
                      >
                        <div className="col-span-9 flex">
                          <div className="col-span-2 flex items-start pl-2">
                            <div
                              {...provided.dragHandleProps}
                              className="flex items-center mr-1 cursor-move"
                            >
                              <svg
                                className="w-4 h-6 text-gray-400 mt-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M4 8h16M4 16h16"
                                />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <input
                                type="text"
                                maxLength={60}
                                className="w-full p-2 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                                placeholder="Field Name"
                                value={item.display_name}
                                onChange={(e) =>
                                  handleItemChange(
                                    item.id,
                                    "display_name",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div className="col-span-2 p-1">
                            <select
                              className="w-full p-2 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                              value={item.app_side}
                              onChange={(e) =>
                                handleItemChange(
                                  item.id,
                                  "app_side",
                                  parseInt(e.target.value)
                                )
                              }
                            >
                              <option value={0}>Read Only</option>
                              <option value={1}>Read & Write</option>
                              <option value={2}>Hidden Field</option>
                            </select>
                          </div>
                          <div className="col-span-2 p-1">
                            <select
                              className="w-full p-2 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                              value={item.customer_type}
                              onChange={(e) =>
                                handleItemChange(
                                  item.id,
                                  "customer_type",
                                  parseInt(e.target.value)
                                )
                              }
                            >
                              <option value={0}>Read Only</option>
                              <option value={1}>Read & Write</option>
                              <option value={2}>Hidden Field</option>
                            </select>
                          </div>
                          <div className="col-span-2 p-1">
                            <select
                              className="w-full p-2 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                              value={item.data_type}
                              onChange={(e) =>
                                handleItemChange(
                                  item.id,
                                  "data_type",
                                  e.target.value
                                )
                              }
                              required
                            >
                              <option value="">Select data type</option>
                              {dataTypes.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-span-2 p-1">
                            <input
                              type="text"
                              className="w-full p-2 border-b border-gray-300 focus:outline-none focus:border-blue-500 capitalize"
                              placeholder="Value"
                              disabled={
                                ![
                                  "Image",
                                  "Video",
                                  "Document",
                                  "DocumentWithExpiry",
                                  "Conditional-Dropdown",
                                  "Conditional-Checkbox",
                                ].includes(item.data_type)
                              }
                              value={item.input}
                              onChange={(e) =>
                                handleItemChange(
                                  item.id,
                                  "input",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="col-span-2 p-1">
                            <select
                              className="w-full p-2 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                              value={item.required}
                              onChange={(e) =>
                                handleItemChange(
                                  item.id,
                                  "required",
                                  parseInt(e.target.value)
                                )
                              }
                              disabled={
                                item.app_side === 0 || item.app_side === 2
                              }
                            >
                              <option value={1}>Mandatory</option>
                              <option value={0}>Not Mandatory</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 mt-2"
                            checked={item.is_tag === 1}
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                "is_tag",
                                e.target.checked ? 1 : 0
                              )
                            }
                            disabled={item.data_type !== "Dropdown"}
                          />
                        </div>
                        <div className="col-span-2 flex">
                          <div className="col-span-9 flex justify-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 mt-2"
                              checked={item.before_start === 1}
                              onChange={(e) =>
                                handleItemChange(
                                  item.id,
                                  "before_start",
                                  e.target.checked ? 1 : 0
                                )
                              }
                              disabled={item.app_side !== 1}
                            />
                          </div>
                          <div className="col-span-3 flex justify-center">
                            <button
                              onClick={() => removeRow(item.id)}
                              className="text-gray-500 hover:text-red-500 mt-1"
                              title="Delete"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div className="row-color-bottom col-span-12 bg-white rounded-b-lg p-3">
          <div style={{ width: "150px" }}>
            <button
              onClick={addNewRow}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Add More
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="general-form-heading col-lg-12">
          <label className="text-gray-700 font-semibold">
            Advanced Settings
          </label>
        </div>

        <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 no-left-padding mt-4">
          <div className="fullwidth accordion-base space-y-4">
            {/* App Pop-up Notifications */}
            <div className="panel panel-default bg-white rounded-lg shadow-sm overflow-hidden">
              <div
                className="panel-heading shadow-box no-margin-top p-4 cursor-pointer flex justify-between items-center"
                onClick={() => toggleAccordion("notifications")}
              >
                <h4 className="panel-title text-blue-500 font-medium">
                  App Pop-up Notifications
                </h4>
                {activeAccordion.notifications ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <div
                className={`panel-collapse transition-all duration-300 ease-in-out ${
                  activeAccordion.notifications ? "max-h-[500px]" : "max-h-0"
                }`}
              >
                <div className="panel-body p-4">
                  <p className="text-gray-600 mb-4">
                    Configure the fields that will reflect on the app pop-up
                    notification when a task is sent to your Agent.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Field 1
                      </label>
                      <select className="w-full p-2 border border-gray-300 rounded-md">
                        <option value="">None Selected</option>
                        <option value="t_d">Task Description</option>
                        <option value="o_id">Task Order ID</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Field 2
                      </label>
                      <select className="w-full p-2 border border-gray-300 rounded-md">
                        <option value="">None Selected</option>
                        <option value="t_d">Task Description</option>
                        <option value="o_id">Task Order ID</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Invoice Template */}
            <div className="panel panel-default bg-white rounded-lg shadow-sm overflow-hidden">
              <div
                className="panel-heading shadow-box p-4 cursor-pointer flex justify-between items-center"
                onClick={() => toggleAccordion("invoice")}
              >
                <h4 className="panel-title text-blue-500 font-medium">
                  Payment Invoice Template
                </h4>
                {activeAccordion.invoice ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <div
                className={`panel-collapse transition-all duration-300 ease-in-out ${
                  activeAccordion.invoice ? "max-h-[500px]" : "max-h-0"
                }`}
              >
                <div className="panel-body p-4">
                  <div className="inner-panel">
                    <p className="text-gray-600 mb-4">
                      Create a dynamic payment invoice template that will be
                      shown to your Agent within the app. You can also use
                      arithmetic and if-else formulas while creating this
                      template.
                    </p>
                    <div className="mb-4 w-full md:w-1/3">
                      <select className="w-full p-2 border border-gray-300 rounded-md">
                        <option value="">Select Tag</option>
                        <option value="task_description">
                          Task Description
                        </option>
                        <option value="customer_name">Customer Name</option>
                      </select>
                    </div>
                    <div
                      className="border border-gray-300 rounded-md p-3 min-h-32"
                      contentEditable="true"
                    >
                      {/* Editable invoice content area */}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Task Pricing & Agent earning */}
            <div className="panel panel-default bg-white rounded-lg shadow-sm overflow-hidden">
              <div
                className="panel-heading shadow-box p-4 cursor-pointer flex justify-between items-center"
                onClick={() => toggleAccordion("pricing")}
              >
                <h4 className="panel-title text-blue-500 font-medium">
                  Task Pricing & Agent earning
                </h4>
                {activeAccordion.pricing ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <div
                className={`panel-collapse transition-all duration-300 ease-in-out ${
                  activeAccordion.pricing ? "max-h-[1000px]" : "max-h-0"
                }`}
              >
                <div className="panel-body p-4">
                  <div className="inner-panel">
                    <div className="fullwidth rules-table-outer">
                      <p className="text-gray-600 mb-4">
                        Configure pricing rules for tasks and agent earnings.
                      </p>

                      {/* Rules Table - Only shown if rules exist */}
                      <div className="mb-6 overflow-x-auto">
  <table className="min-w-full bg-white border border-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Rule Name
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Type
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Pricing Mode
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      {pricingRules.map((rule) => (
        <tr key={rule.id}>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {rule.name}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
            {rule.type.replace('_', ' ')}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
            {rule.pricingMode.replace('_', ' ')}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <button 
              className="text-blue-500 hover:text-blue-700 mr-3"
              onClick={() => {
                // You can implement edit functionality here
                // For now, we'll just log the rule to be edited
                console.log("Editing rule:", rule);
              }}
            >
              Edit
            </button>
            <button 
              className="text-red-500 hover:text-red-700"
              onClick={() => handleDeleteRule(rule.id)}
            >
              Delete
            </button>
          </td>
        </tr>
      ))}
      {pricingRules.length === 0 && (
        <tr>
          <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
            No pricing rules added yet
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

                      {/* Additional Pricing Option */}
                      <div className="flex items-center mb-6">
                        <input
                          type="checkbox"
                          id="samePricing"
                          className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="samePricing"
                          className="ml-2 block text-sm text-gray-700"
                        >
                          Enable same pricing for customer application
                        </label>
                      </div>

                      {/* Add Rule Button */}
                      <button
                        onClick={() => setShowRuleModal(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        Add Rule
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
<PricingRulesModal
  showModal={showRuleModal}
  setShowModal={setShowRuleModal}
  onSave={handleSaveRule}
/>


<div className="mt-6 flex justify-end">
  <button
    onClick={handleSubmit}
    className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
  >
    Create Template
  </button>
</div>
    </div>
  );
};

export default AddTemplate;
