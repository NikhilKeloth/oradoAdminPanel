import React, { useState, useEffect } from "react";
import axios from "axios";
import { Settings, User, Layout, LogOut, Map } from "lucide-react";
import AllocationMethodSelector from "../../components/AgentAdminDashboard/SettingPage/AutoAllocation/AllocationMethodSelector";
import { toast } from "react-toastify";
import apiClient from "../../apis/apiClient/apiClient";

const AgentDashboardSettings = () => {
  const [activeTab, setActiveTab] = useState("Preferences");
  const [autoAllocationEnabled, setAutoAllocationEnabled] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [allocationSettings, setAllocationSettings] = useState({
    method: "",
    requestExpirySec: 30,
    numberOfRetries: 0,
    startAllocationBeforeTaskTimeMin: 5,
    nearest_available: {
      taskAllocationPriority: ["captive", "freelancer"],
      calculateByRoadDistance: false,
      maximumRadiusKm: 10,
      startAllocationBeforeTaskTimeMin: 5,
      autoCancelSettings: {
        enabled: false,
        timeForAutoCancelOnFailSec: 0,
      },
      considerAgentRating: false,
    },
    one_by_one: {
      taskAllocationPriority: ["captive", "freelancer"],
      requestExpirySec: 30,
      numberOfRetries: 0,
      startAllocationBeforeTaskTimeMin: 5,
      autoCancelSettings: {
        enabled: false,
        timeForAutoCancelOnFailSec: 0,
      },
      considerAgentRating: false,
    },
    send_to_all: {
      taskAllocationPriority: ["captive", "freelancer"],
      maxAgents: 500,
      requestExpirySec: 30,
      numberOfRetries: 0, // Added missing field
      startAllocationBeforeTaskTimeMin: 5,
      autoCancelSettings: {
        enabled: false,
        timeForAutoCancelOnFailSec: 0,
      },
      considerAgentRating: false, // Added missing field
    },
    fifo: {
      considerAgentRating: false,
      startAllocationBeforeTaskTimeMin: 0,
      startRadiusKm: 5,
      radiusIncrementKm: 1,
      maximumRadiusKm: 10,
      batchProcessingTimeSec: 30,
      requestTimeSec: 30,
      maximumBatchSize: 5,
      maximumBatchLimit: 10,
      enableClubbing: false,
      clubbingSettings: {
        deliveryDistanceKm: 5,
        orderThresholdTimeSec: 120,
        additionalTasksToBeClubbed: 2,
      },
    },

    round_robin: {
      taskAllocationPriority: ["captive", "freelancer"],
      maxTasksAllowed: 20,
      radiusKm: 10,
      startAllocationBeforeTaskTimeMin: 0,
      samePickupRadiusMeters: 50,
      waitingTimeForPickupMin: 0,
      waitingTimeForDeliveryMin: 0,
      parkingTimeAtPickupMin: 0,
      shortestEtaIgnoreMin: 0,
      shortestTimeSlaMin: 30,
      maxPoolTimeDifferenceMin: 30,
      maxPoolTaskCount: 999999,
      assignTaskToOffDutyAgents: false,
      considerThisDistanceAsMaxDistance: true,
      restartAllocationOnDecline: true,
      autoCancelSettings: {
        enabled: false,
        timeForAutoCancelOnFailSec: 0,
      },
      considerAgentRating: false,
      shortestTimeSlaEnabled: false, // Added this to control the toggle
    },
  });

  const settingsMenu = [
    { name: "Preferences", icon: <Settings size={18} /> },
    { name: "Theme Settings", icon: <Layout size={18} /> },
    { name: "Profile", icon: <User size={18} /> },
    { name: "Geo Fence", icon: <Map size={18} /> },
    { name: "Auto Allocation", icon: <Settings size={18} /> },
    { name: "Logout", icon: <LogOut size={18} /> },
  ];
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiClient.get(
          "/admin/allocation-settings"
        );

        if (res.data.success) {
          const settings = res.data.data;
          setAutoAllocationEnabled(settings.isAutoAllocationEnabled);

          setAllocationSettings((prev) => ({
            ...prev,
            method: settings.method || "",
            requestExpirySec:
              settings.requestExpirySec || prev.requestExpirySec,
            numberOfRetries: settings.numberOfRetries || prev.numberOfRetries,
            startAllocationBeforeTaskTimeMin:
              settings.startAllocationBeforeTaskTimeMin ||
              prev.startAllocationBeforeTaskTimeMin,

            // Nearest Available settings
            nearest_available: {
              ...prev.nearest_available,
              ...(settings.nearestAvailableSettings || {}),
              autoCancelSettings: {
                ...prev.nearest_available.autoCancelSettings,
                ...(settings.nearestAvailableSettings?.autoCancelSettings ||
                  {}),
              },
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
              autoCancelSettings: {
                ...prev.send_to_all.autoCancelSettings,
                ...(settings.sendToAllSettings?.autoCancelSettings || {}),
              },
            },
            fifo: {
              ...prev.fifo,
              ...(settings.fifoSettings || {})
            
            },
            round_robin: {
              ...prev.round_robin,
              ...(settings.roundRobinSettings || {}),
              autoCancelSettings: {
                ...prev.round_robin.autoCancelSettings,
                ...(settings.roundRobinSettings?.autoCancelSettings || {}),
              },
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

    const requestBody = {
      method: settings.method,
      requestExpirySec: settings.requestExpirySec,
      numberOfRetries: settings.numberOfRetries,
      startAllocationBeforeTaskTimeMin:
        settings.startAllocationBeforeTaskTimeMin,
      isAutoAllocationEnabled: autoAllocationEnabled,

      // Nearest Available settings
      nearestAvailableSettings: {
        taskAllocationPriority: settings.nearest_available
          ?.taskAllocationPriority || ["captive", "freelancer"],
        calculateByRoadDistance:
          settings.nearest_available?.calculateByRoadDistance || false,
        maximumRadiusKm: settings.nearest_available?.maximumRadiusKm || 10,
        startAllocationBeforeTaskTimeMin:
          settings.nearest_available?.startAllocationBeforeTaskTimeMin || 5,
        autoCancelSettings: {
          enabled:
            settings.nearest_available?.autoCancelSettings?.enabled || false,
          timeForAutoCancelOnFailSec:
            settings.nearest_available?.autoCancelSettings
              ?.timeForAutoCancelOnFailSec || 0,
        },
        considerAgentRating:
          settings.nearest_available?.considerAgentRating || false,
      },

      // One By One settings
      oneByOneSettings: {
        taskAllocationPriority: settings.one_by_one?.taskAllocationPriority || [
          "captive",
          "freelancer",
        ],
        requestExpirySec: settings.one_by_one?.requestExpirySec || 30,
        numberOfRetries: settings.one_by_one?.numberOfRetries || 0,
        startAllocationBeforeTaskTimeMin:
          settings.one_by_one?.startAllocationBeforeTaskTimeMin || 5,
        autoCancelSettings: {
          enabled: settings.one_by_one?.autoCancelSettings?.enabled || false,
          timeForAutoCancelOnFailSec:
            settings.one_by_one?.autoCancelSettings
              ?.timeForAutoCancelOnFailSec || 0,
        },
        considerAgentRating: settings.one_by_one?.considerAgentRating || false,
      },

      // Send To All settings
      sendToAllSettings: {
        taskAllocationPriority: settings.send_to_all
          ?.taskAllocationPriority || ["captive", "freelancer"],
        maxAgents: settings.send_to_all?.maxAgents || 500,
        requestExpirySec: settings.send_to_all?.requestExpirySec || 30,
        startAllocationBeforeTaskTimeMin:
          settings.send_to_all?.startAllocationBeforeTaskTimeMin || 5,
        autoCancelSettings: {
          enabled: settings.send_to_all?.autoCancelSettings?.enabled || false,
          timeForAutoCancelOnFailSec:
            settings.send_to_all?.autoCancelSettings
              ?.timeForAutoCancelOnFailSec || 0,
        },
        considerAgentRating: settings.send_to_all?.considerAgentRating || false,
      },

      // Round Robin settings
      roundRobinSettings: {
        taskAllocationPriority: settings.round_robin
          ?.taskAllocationPriority || ["captive", "freelancer"],
        maxTasksAllowed: settings.round_robin?.maxTasksAllowed || 20,
        radiusKm: settings.round_robin?.radiusKm || 10,
        startAllocationBeforeTaskTimeMin:
          settings.round_robin?.startAllocationBeforeTaskTimeMin || 0,
        samePickupRadiusMeters:
          settings.round_robin?.samePickupRadiusMeters || 50,
        waitingTimeForPickupMin:
          settings.round_robin?.waitingTimeForPickupMin || 0,
        waitingTimeForDeliveryMin:
          settings.round_robin?.waitingTimeForDeliveryMin || 0,
        parkingTimeAtPickupMin:
          settings.round_robin?.parkingTimeAtPickupMin || 0,
        shortestEtaIgnoreMin: settings.round_robin?.shortestEtaIgnoreMin || 0,
        shortestTimeSlaMin: settings.round_robin?.shortestTimeSlaMin || 30,
        maxPoolTimeDifferenceMin:
          settings.round_robin?.maxPoolTimeDifferenceMin || 30,
        maxPoolTaskCount: settings.round_robin?.maxPoolTaskCount || 999999,
        assignTaskToOffDutyAgents:
          settings.round_robin?.assignTaskToOffDutyAgents || false,
        considerThisDistanceAsMaxDistance:
          settings.round_robin?.considerThisDistanceAsMaxDistance || true,
        restartAllocationOnDecline:
          settings.round_robin?.restartAllocationOnDecline || true,
        autoCancelSettings: {
          enabled: settings.round_robin?.autoCancelSettings?.enabled || false,
          timeForAutoCancelOnFailSec:
            settings.round_robin?.autoCancelSettings
              ?.timeForAutoCancelOnFailSec || 0,
        },
        considerAgentRating: settings.round_robin?.considerAgentRating || false,
      },

      // FIFO settings
     fifoSettings: {
      considerAgentRating: settings.fifo?.considerAgentRating ?? true,
      startAllocationBeforeTaskTimeMin: settings.fifo?.startAllocationBeforeTaskTimeMin ?? 0,
      startRadiusKm: settings.fifo?.startRadiusKm ?? 3,
      radiusIncrementKm: settings.fifo?.radiusIncrementKm ?? 2,
      maximumRadiusKm: settings.fifo?.maximumRadiusKm ?? 10,
      requestExpirySec: settings.fifo?.requestExpirySec ?? 25, // Fixed field name
      autoAssignOrders: settings.fifo?.autoAssignOrders ?? false,
    },
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

    setAutoAllocationEnabled((prev) => !prev)
    // try {

    //   setAutoAllocationEnabled((preve) => !preve);
    //   const res = await apiClient.patch(
    //     "/admin/allocation-settings/toggle-auto-allocation"
    //   );
    //   if (res.data.data) {
     
    //     toast.success(
    //       `Auto allocation ${
    //         res.data.data.isAutoAllocationEnabled ? "enabled" : "disabled"
    //       }`
    //     );
    //   }
    // } catch (err) {
    //   console.error("Failed to toggle auto allocation status", err);
    //   toast.error("Failed to toggle auto allocation");
    // }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold flex items-center">
            <Settings className="mr-2" />
            Settings
          </h2>
        </div>
        <nav className="p-2">
          <ul className="space-y-1">
            {settingsMenu.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center p-3 rounded-lg text-left ${
                    activeTab === item.name
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-2xl font-bold mb-6">{activeTab}</h1>

        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === "Auto Allocation" && (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentDashboardSettings;
