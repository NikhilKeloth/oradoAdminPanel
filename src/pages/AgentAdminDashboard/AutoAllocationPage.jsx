// src/pages/AgentAdminDashboard/AutoAllocationPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AllocationMethodSelector from "../../components/AgentAdminDashboard/SettingPage/AutoAllocation/AllocationMethodSelector";
import apiClient from "../../apis/apiClient/apiClient";

const AutoAllocationPage = () => {
  const [autoAllocationEnabled, setAutoAllocationEnabled] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [allocationSettings, setAllocationSettings] = useState({
    method: "",
    // Remove these top-level fields as they belong to specific methods
    // requestExpirySec: 30,
    // numberOfRetries: 0,
    // startAllocationBeforeTaskTimeMin: 5,
    
    // Method-specific configurations
    round_robin: {
      maxTasksAllowed: 20,
      radiusKm: 10,
      radiusIncrementKm: 2,
      maximumRadiusKm: 10,
      startAllocationBeforeTaskTimeMin: 0,
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
    const fetchSettings = async () => {
      try {
        const res = await apiClient.get("/admin/allocation-settings");

        if (res.data.success) {
          const settings = res.data.data;
          setAutoAllocationEnabled(settings.isAutoAllocationEnabled);

          setAllocationSettings((prev) => ({
            ...prev,
            method: settings.method || "",
            
            // Round Robin settings
            round_robin: {
              ...prev.round_robin,
              ...(settings.roundRobinSettings || {}),
            },

            // One By One settings
            one_by_one: {
              ...prev.one_by_one,
              ...(settings.oneByOneSettings || {}),
              autoCancelSettings: {
                ...prev.one_by_one.autoCancelSettings,
                ...(settings.oneByOneSettings?.autoCancelSettings || {}),
              },
            },

            // Send To All settings
            send_to_all: {
              ...prev.send_to_all,
              ...(settings.sendToAllSettings || {}),
            },

            // Batch Wise settings
            batch_wise: {
              ...prev.batch_wise,
              ...(settings.batchWiseSettings || {}),
            },

            // Nearest Available settings
            nearest_available: {
              ...prev.nearest_available,
              ...(settings.nearestAvailableSettings || {}),
              autoCancelSettings: {
                ...prev.nearest_available.autoCancelSettings,
                ...(settings.nearestAvailableSettings?.autoCancelSettings || {}),
              },
            },

            // FIFO settings
            fifo: {
              ...prev.fifo,
              ...(settings.fifoSettings || {}),
            },

            // Pooling settings
            pooling: {
              ...prev.pooling,
              ...(settings.poolingSettings || {}),
            },
          }));
        }
      } catch (err) {
        console.error("Failed to fetch allocation settings", err);
        toast.error("Failed to load allocation settings");
      } finally {
        setLoadingSettings(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveAllocationSettings = (settings) => {
    setAllocationSettings(settings);

    // Create request body that matches backend schema
    const requestBody = {
      isAutoAllocationEnabled: autoAllocationEnabled,
      method: settings.method,

      // Round Robin Settings
      roundRobinSettings: settings.round_robin || {},

      // One By One Settings
      oneByOneSettings: settings.one_by_one || {},

      // Send To All Settings
      sendToAllSettings: settings.send_to_all || {},

      // Batch Wise Settings
      batchWiseSettings: settings.batch_wise || {},

      // Nearest Available Settings
      nearestAvailableSettings: settings.nearest_available || {},

      // FIFO Settings
      fifoSettings: settings.fifo || {},

      // Pooling Settings
      poolingSettings: settings.pooling || {},
    };

    apiClient
      .put("/admin/allocation-settings", requestBody)
      .then((res) => {
        console.log("Settings saved successfully", res.data);
        toast.success("Allocation settings updated successfully");
      })
      .catch((err) => {
        console.error("Failed to save settings", err);
        toast.error("Failed to update allocation settings");
      });
  };

  const handleToggleAutoAllocation = async () => {
    // Step 1: Optimistically update UI
    setAutoAllocationEnabled((prev) => !prev);

    try {
      // Step 2: Call API
      const res = await apiClient.patch(
        "/admin/allocation-settings/toggle-auto-allocation"
      );
      console.log(res);
      
      // Step 3: Sync state with backend response
      if (res.data.data) {
        setAutoAllocationEnabled(res.data.data.isAutoAllocationEnabled);
        toast.success(
          `Auto allocation ${
            res.data.data.isAutoAllocationEnabled ? "enabled" : "disabled"
          }`
        );
      }
    } catch (err) {
      console.error("Failed to toggle auto allocation status", err);

      // Step 4: Rollback UI state if API fails
      setAutoAllocationEnabled((prev) => !prev);

      toast.error("Failed to toggle auto allocation");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
        <div>
          <h3 className="font-medium text-lg">Auto Allocation</h3>
          <p className="text-gray-600 text-sm">
            Enable this option to automatically assign tasks to agents.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={autoAllocationEnabled}
            onChange={handleToggleAutoAllocation}
          />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
        </label>
      </div>

      {loadingSettings ? (
        <div className="text-gray-500">Loading current settings...</div>
      ) : (
        <>
          {autoAllocationEnabled && (
            <>
              <div className="text-sm text-gray-700">
                <strong>Current Method:</strong>{" "}
                {allocationSettings.method
                  ? allocationSettings.method
                      .replace(/_/g, " ")
                      .toUpperCase()
                  : "Not Configured"}
              </div>

              <AllocationMethodSelector
                allocationMethod={allocationSettings.method}
                setAllocationMethod={(method) =>
                  setAllocationSettings((prev) => ({ ...prev, method }))
                }
                initialConfigs={allocationSettings}
                onSave={handleSaveAllocationSettings}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AutoAllocationPage;