import React, { useState, useEffect } from "react";
import {
  User,
  Users,
  Layout,
  RefreshCw,
  MapPin,
  ListOrdered,
  CheckCircle2,
  Save,
} from "lucide-react";

const AllocationMethodSelector = ({
  allocationMethod,
  setAllocationMethod,
  initialConfigs,
  onSave,
}) => {
  const [methodConfigs, setMethodConfigs] = useState({
    round_robin: {
      maxTasksAllowed: 20,
      radiusKm: 10,
      startAllocationBeforeTaskTimeMin: 0,
      radiusIncrementKm: 2,
      maximumRadiusKm: 10,
      considerAgentRating: false,
    },
    one_by_one: {
      taskAllocationPriority: [],
      requestExpirySec: 30,
      numberOfRetries: 0,
      startAllocationBeforeTaskTimeMin: 0,
      autoCancelSettings: {
        enabled: false,
        timeForAutoCancelOnFailSec: 0,
      },
      considerAgentRating: false,
    },
    send_to_all: {
      maxAgents: 500,
      requestExpirySec: 30,
      startAllocationBeforeTaskTimeMin: 0,
      radiusKm: 5,
      maximumRadiusKm: 20,
      radiusIncrementKm: 2,
    },
    batch_wise: {
      batchSize: 5,
      batchLimit: 5,
    },
    nearest_available: {
      taskAllocationPriority: [],
      calculateByRoadDistance: true,
      maximumRadiusKm: 10,
      startAllocationBeforeTaskTimeMin: 0,
      autoCancelSettings: {
        enabled: false,
        timeForAutoCancelOnFailSec: 0,
      },
      considerAgentRating: false,
    },
    fifo: {
      considerAgentRating: false,
      startAllocationBeforeTaskTimeMin: 0,
      startRadiusKm: 3,
      radiusIncrementKm: 2,
      maximumRadiusKm: 10,
      requestExpirySec: 25,
    },
    pooling: {
      poolSize: 10,
    },
  });

  useEffect(() => {
    if (initialConfigs && Object.keys(initialConfigs).length > 0) {
      setMethodConfigs((prev) => ({
        ...prev,
        ...initialConfigs,
      }));
    }
  }, [initialConfigs]);

  const handleConfigChange = (methodId, field, value, nestedField = null) => {
    setMethodConfigs((prev) => {
      if (nestedField) {
        return {
          ...prev,
          [methodId]: {
            ...prev[methodId],
            [nestedField]: {
              ...prev[methodId][nestedField],
              [field]: value,
            },
          },
        };
      } else {
        return {
          ...prev,
          [methodId]: {
            ...prev[methodId],
            [field]: value,
          },
        };
      }
    });
  };

  // Helper function to handle number input changes
  const handleNumberChange = (methodId, field, value, isFloat = false, nestedField = null) => {
    // If value is empty string, set it as empty (allow clearing)
    if (value === '') {
      handleConfigChange(methodId, field, '', nestedField);
    } else {
      // Otherwise parse the number
      const parsedValue = isFloat ? parseFloat(value) : parseInt(value, 10);
      // Only update if it's a valid number
      if (!isNaN(parsedValue)) {
        handleConfigChange(methodId, field, parsedValue, nestedField);
      }
    }
  };

  // Helper function to get display value (show empty string for empty values)
  const getDisplayValue = (value, defaultValue = 0) => {
    return value === '' ? '' : (value || defaultValue);
  };

  const methods = [
    {
      id: "one_by_one",
      name: "One By One",
      icon: <User size={20} className="text-blue-500" />,
      description: "Tasks are allocated to agents one at a time until accepted",
    },
    {
      id: "send_to_all",
      name: "Send To All",
      icon: <Users size={20} className="text-green-500" />,
      description: "Task is sent to all available agents simultaneously",
    },
   
    {
      id: "round_robin",
      name: "Round Robin",
      icon: <RefreshCw size={20} className="text-orange-500" />,
      description: "Tasks are distributed evenly among all available agents",
    },
    {
      id: "nearest_available",
      name: "Nearest Available",
      icon: <MapPin size={20} className="text-red-500" />,
      description:
        "Tasks are allocated based on agent proximity to task location",
    },
    {
      id: "fifo",
      name: "FIFO",
      icon: <ListOrdered size={20} className="text-yellow-500" />,
      description:
        "First come, first served allocation based on task creation time",
    },
   
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-gray-800">
          Task Allocation Method
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Select and configure how tasks should be automatically allocated to
          agents
        </p>
      </div>

      <div>
        <h4 className="font-medium text-gray-700 mb-3">Available Methods</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {methods.map((method) => (
            <div
              key={method.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md group ${
                allocationMethod === method.id
                  ? "border-blue-500 bg-blue-50 ring-1 ring-blue-200"
                  : "border-gray-200 hover:border-blue-300"
              }`}
              onClick={() => setAllocationMethod(method.id)}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`p-2.5 rounded-lg ${
                    allocationMethod === method.id
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600 group-hover:bg-blue-50"
                  }`}
                >
                  {method.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-gray-900">{method.name}</h5>
                    {allocationMethod === method.id && (
                      <CheckCircle2
                        size={18}
                        className="text-blue-500 ml-2 flex-shrink-0"
                      />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {method.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {allocationMethod && (
        <div className="p-5 border rounded-lg bg-white shadow-sm space-y-5">
          <h4 className="font-medium text-gray-800">
            Configuration for{" "}
            {methods.find((m) => m.id === allocationMethod)?.name}
          </h4>

          {/* Round Robin Configuration */}
          {allocationMethod === "round_robin" && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Tasks Allowed per Agent
                </label>
                <input
                  type="number"
                  value={getDisplayValue(methodConfigs.round_robin.maxTasksAllowed, 20)}
                  onChange={(e) =>
                    handleNumberChange(
                      "round_robin",
                      "maxTasksAllowed",
                      e.target.value,
                      false
                    )
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  min="1"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Maximum concurrent tasks per agent
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Radius (km)
                </label>
                <input
                  type="number"
                  value={getDisplayValue(methodConfigs.round_robin.radiusKm, 10)}
                  onChange={(e) =>
                    handleNumberChange(
                      "round_robin",
                      "radiusKm",
                      e.target.value,
                      true
                    )
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  min="0"
                  step="0.1"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Initial search radius for agents
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Radius Increment (km)
                </label>
                <input
                  type="number"
                  value={getDisplayValue(methodConfigs.round_robin.radiusIncrementKm, 2)}
                  onChange={(e) =>
                    handleNumberChange(
                      "round_robin",
                      "radiusIncrementKm",
                      e.target.value,
                      true
                    )
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  min="0"
                  step="0.1"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Radius increase step when expanding search
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Radius (km)
                </label>
                <input
                  type="number"
                  value={getDisplayValue(methodConfigs.round_robin.maximumRadiusKm, 10)}
                  onChange={(e) =>
                    handleNumberChange(
                      "round_robin",
                      "maximumRadiusKm",
                      e.target.value,
                      true
                    )
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  min="0"
                  step="0.1"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Maximum search radius cap
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Allocation Before Task Time (minutes)
                </label>
                <input
                  type="number"
                  value={getDisplayValue(
                    methodConfigs.round_robin.startAllocationBeforeTaskTimeMin,
                    0
                  )}
                  onChange={(e) =>
                    handleNumberChange(
                      "round_robin",
                      "startAllocationBeforeTaskTimeMin",
                      e.target.value,
                      false
                    )
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  min="0"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Start allocation before scheduled delivery time
                </p>
              </div>

              <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">
                    Consider Agent Rating
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Prioritize higher rated agents
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={methodConfigs.round_robin.considerAgentRating || false}
                  onChange={(e) =>
                    handleConfigChange(
                      "round_robin",
                      "considerAgentRating",
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </>
          )}

          {/* One By One Configuration */}
          {allocationMethod === "one_by_one" && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Allocation Priority
                </label>
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 border focus:ring-blue-500 focus:border-blue-500"
                  value={methodConfigs.one_by_one.taskAllocationPriority?.join(" ") || "captive freelancer"}
                  onChange={(e) =>
                    handleConfigChange(
                      "one_by_one",
                      "taskAllocationPriority",
                      e.target.value === "none" ? [] : e.target.value.split(" ")
                    )
                  }
                >
                  <option value="none">No Priority</option>
                  <option value="captive freelancer">
                    Captive Agent then Freelancer Agent
                  </option>
                  <option value="freelancer captive">
                    Freelancer Agent then Captive Agent
                  </option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Request Expiry (seconds)
                </label>
                <input
                  type="number"
                  value={getDisplayValue(methodConfigs.one_by_one.requestExpirySec, 30)}
                  onChange={(e) =>
                    handleNumberChange(
                      "one_by_one",
                      "requestExpirySec",
                      e.target.value,
                      false
                    )
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 border focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Retries
                </label>
                <input
                  type="number"
                  value={getDisplayValue(methodConfigs.one_by_one.numberOfRetries, 0)}
                  onChange={(e) =>
                    handleNumberChange(
                      "one_by_one",
                      "numberOfRetries",
                      e.target.value,
                      false
                    )
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 border focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Allocation Before Task Time (minutes)
                </label>
                <input
                  type="number"
                  value={getDisplayValue(
                    methodConfigs.one_by_one.startAllocationBeforeTaskTimeMin,
                    0
                  )}
                  onChange={(e) =>
                    handleNumberChange(
                      "one_by_one",
                      "startAllocationBeforeTaskTimeMin",
                      e.target.value,
                      false
                    )
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 border focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>

              <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">
                    Auto Cancel Settings
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Automatically cancel unassigned tasks
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      methodConfigs.one_by_one.autoCancelSettings?.enabled || false
                    }
                    onChange={(e) =>
                      handleConfigChange(
                        "one_by_one",
                        "enabled",
                        e.target.checked,
                        "autoCancelSettings"
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {methodConfigs.one_by_one.autoCancelSettings?.enabled && (
                <div className="mb-6 pl-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time for Auto Cancel on Allocation Fail (seconds)
                  </label>
                  <input
                    type="number"
                    value={getDisplayValue(
                      methodConfigs.one_by_one.autoCancelSettings?.timeForAutoCancelOnFailSec,
                      0
                    )}
                    onChange={(e) =>
                      handleNumberChange(
                        "one_by_one",
                        "timeForAutoCancelOnFailSec",
                        e.target.value,
                        false,
                        "autoCancelSettings"
                      )
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 border focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">
                    Consider Agent Rating
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Prioritize higher rated agents
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={methodConfigs.one_by_one.considerAgentRating || false}
                    onChange={(e) =>
                      handleConfigChange(
                        "one_by_one",
                        "considerAgentRating",
                        e.target.checked
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </>
          )}

          {/* Send to All Configuration */}
          {allocationMethod === "send_to_all" && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Agents
                </label>
                <input
                  type="number"
                  value={getDisplayValue(methodConfigs.send_to_all.maxAgents, 500)}
                  onChange={(e) =>
                    handleNumberChange(
                      "send_to_all",
                      "maxAgents",
                      e.target.value,
                      false
                    )
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 border focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Maximum number of agents to send the task to (1-500)
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Request Expiry (seconds)
                </label>
                <input
                  type="number"
                  value={getDisplayValue(methodConfigs.send_to_all.requestExpirySec, 30)}
                  onChange={(e) =>
                    handleNumberChange(
                      "send_to_all",
                      "requestExpirySec",
                      e.target.value,
                      false
                    )
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 border focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Allocation Before Task Time (minutes)
                </label>
                <input
                  type="number"
                  value={getDisplayValue(
                    methodConfigs.send_to_all.startAllocationBeforeTaskTimeMin,
                    0
                  )}
                  onChange={(e) =>
                    handleNumberChange(
                      "send_to_all",
                      "startAllocationBeforeTaskTimeMin",
                      e.target.value,
                      false
                    )
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 border focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Radius (km)
                </label>
                <input
                  type="number"
                  value={getDisplayValue(methodConfigs.send_to_all.radiusKm, 5)}
                  onChange={(e) =>
                    handleNumberChange(
                      "send_to_all",
                      "radiusKm",
                      e.target.value,
                      true
                    )
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 border focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.1"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Radius (km)
                </label>
                <input
                  type="number"
                  value={getDisplayValue(methodConfigs.send_to_all.maximumRadiusKm, 20)}
                  onChange={(e) =>
                    handleNumberChange(
                      "send_to_all",
                      "maximumRadiusKm",
                      e.target.value,
                      true
                    )
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 border focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.1"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Radius Increment (km)
                </label>
                <input
                  type="number"
                  value={getDisplayValue(methodConfigs.send_to_all.radiusIncrementKm, 2)}
                  onChange={(e) =>
                    handleNumberChange(
                      "send_to_all",
                      "radiusIncrementKm",
                      e.target.value,
                      true
                    )
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 border focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.1"
                />
              </div>
            </>
          )}

       

          {/* Nearest Available Configuration */}
          {allocationMethod === "nearest_available" && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Allocation Priority
                </label>
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 border focus:ring-blue-500 focus:border-blue-500"
                  value={methodConfigs.nearest_available.taskAllocationPriority?.join(" ") || "none"}
                  onChange={(e) =>
                    handleConfigChange(
                      "nearest_available",
                      "taskAllocationPriority",
                      e.target.value === "none" ? [] : e.target.value.split(" ")
                    )
                  }
                >
                  <option value="none">No Priority</option>
                  <option value="captive freelancer">
                    Captive Agent then Freelancer Agent
                  </option>
                  <option value="freelancer captive">
                    Freelancer Agent then Captive Agent
                  </option>
                </select>
              </div>

              <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">
                    Calculate By Road Distance
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Uses actual road distance instead of straight-line
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={methodConfigs.nearest_available.calculateByRoadDistance || true}
                    onChange={(e) =>
                      handleConfigChange(
                        "nearest_available",
                        "calculateByRoadDistance",
                        e.target.checked
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Radius (km)
                </label>
                <input
                  type="number"
                  value={getDisplayValue(methodConfigs.nearest_available.maximumRadiusKm, 10)}
                  onChange={(e) =>
                    handleNumberChange(
                      "nearest_available",
                      "maximumRadiusKm",
                      e.target.value,
                      true
                    )
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 border focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.1"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Allocation Before Task Time (minutes)
                </label>
                <input
                  type="number"
                  value={getDisplayValue(
                    methodConfigs.nearest_available.startAllocationBeforeTaskTimeMin,
                    0
                  )}
                  onChange={(e) =>
                    handleNumberChange(
                      "nearest_available",
                      "startAllocationBeforeTaskTimeMin",
                      e.target.value,
                      false
                    )
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 border focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>

              <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">
                    Auto Cancel Settings
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Automatically cancel unassigned tasks
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      methodConfigs.nearest_available.autoCancelSettings?.enabled || false
                    }
                    onChange={(e) =>
                      handleConfigChange(
                        "nearest_available",
                        "enabled",
                        e.target.checked,
                        "autoCancelSettings"
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {methodConfigs.nearest_available.autoCancelSettings?.enabled && (
                <div className="mb-6 pl-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time for Auto Cancel on Allocation Fail (seconds)
                  </label>
                  <input
                    type="number"
                    value={getDisplayValue(
                      methodConfigs.nearest_available.autoCancelSettings?.timeForAutoCancelOnFailSec,
                      0
                    )}
                    onChange={(e) =>
                      handleNumberChange(
                        "nearest_available",
                        "timeForAutoCancelOnFailSec",
                        e.target.value,
                        false,
                        "autoCancelSettings"
                      )
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 border focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">
                    Consider Agent Rating
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Prioritize higher rated agents
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={methodConfigs.nearest_available.considerAgentRating || false}
                    onChange={(e) =>
                      handleConfigChange(
                        "nearest_available",
                        "considerAgentRating",
                        e.target.checked
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </>
          )}

          {/* FIFO Configuration */}
          {allocationMethod === "fifo" && (
            <>
              <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Consider Agent Rating</h4>
                  <p className="text-xs text-gray-500 mt-1">Prioritize higher rated agents</p>
                </div>
                <input
                  type="checkbox"
                  checked={methodConfigs.fifo.considerAgentRating || false}
                  onChange={(e) =>
                    handleConfigChange("fifo", "considerAgentRating", e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Allocation Before Task Time (minutes)
                </label>
                <input
                  type="number"
                  value={getDisplayValue(methodConfigs.fifo.startAllocationBeforeTaskTimeMin, 0)}
                  onChange={(e) =>
                    handleNumberChange(
                      "fifo",
                      "startAllocationBeforeTaskTimeMin",
                      e.target.value,
                      false
                    )
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  min="0"
                />
              </div>

              <div className="space-y-3 mb-4 p-3 border border-gray-200 rounded">
                <h4 className="text-sm font-medium text-gray-700">Distance Settings</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Radius (km)
                  </label>
                  <input
                    type="number"
                    value={getDisplayValue(methodConfigs.fifo.startRadiusKm, 3)}
                    onChange={(e) =>
                      handleNumberChange(
                        "fifo",
                        "startRadiusKm",
                        e.target.value,
                        true
                      )
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Radius Increment (km)
                  </label>
                  <input
                    type="number"
                    value={getDisplayValue(methodConfigs.fifo.radiusIncrementKm, 2)}
                    onChange={(e) =>
                      handleNumberChange(
                        "fifo",
                        "radiusIncrementKm",
                        e.target.value,
                        true
                      )
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Radius (km)
                  </label>
                  <input
                    type="number"
                    value={getDisplayValue(methodConfigs.fifo.maximumRadiusKm, 10)}
                    onChange={(e) =>
                      handleNumberChange(
                        "fifo",
                        "maximumRadiusKm",
                        e.target.value,
                        true
                      )
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="space-y-3 mb-4 p-3 border border-gray-200 rounded">
                <h4 className="text-sm font-medium text-gray-700">Time Settings</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Request Expiry Time (seconds)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Time available to the Agent for accepting the task</p>
                  <input
                    type="number"
                    value={getDisplayValue(methodConfigs.fifo.requestExpirySec, 25)}
                    onChange={(e) =>
                      handleNumberChange(
                        "fifo",
                        "requestExpirySec",
                        e.target.value,
                        false
                      )
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    min="0"
                  />
                </div>
              </div>
            </>
          )}

    

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() =>
                onSave({
                  ...methodConfigs,
                  method: allocationMethod,
                })
              }
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Save size={18} className="mr-2" />
              Save Allocation Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllocationMethodSelector;