import { useState, useEffect } from "react";
import { updateNotificationPreferences, getNotificationPreferences, deleteAccount } from "../../../apis/settingsApi"; 


export default function SMSPreferences() {
  // Initialize notification preferences based on controller structure
  const [notificationPrefs, setNotificationPrefs] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    //  Fetch preferences on mount
  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const prefs = await getNotificationPreferences();
        setNotificationPrefs(prefs);
      } catch (error) {
        console.error("Failed to load preferences:", error);
      }
    };
    fetchPrefs();
  }, []);

  // Prevent render until prefs are loaded
  if (!notificationPrefs) {
    return <div className="p-6">Loading preferences...</div>;
  }

  const handleToggle = async (key) => {
    const updatedPrefs = {
        ...notificationPrefs,
        [key]: !notificationPrefs[key],
    };
    setNotificationPrefs(updatedPrefs);

    try {
        await updateNotificationPreferences({ [key]: updatedPrefs[key] });
        console.log("Preferences updated");
    } catch (err) {
        console.error("Error updating preferences", err);
        // Optionally revert toggle if API fails
    }
    };

    const handleDeleteAccount = async () => {
    try {
        await deleteAccount();
        console.log("Account deleted");
        setShowDeleteConfirm(false);
        // Optionally: redirect to login or home
    } catch (err) {
        console.error("Error deleting account", err);
    }
    };

  // Define notification preference items with descriptions
  const notificationItems = [
    {
      key: 'orderUpdates',
      title: 'Order Updates',
      description: 'Receive SMS notifications about your order status, delivery updates, and tracking information',
      disabled: true, // Order updates cannot be disabled as per original design
    },
    {
      key: 'promotions',
      title: 'Promotions & Offers',
      description: 'Get notified about special deals, discounts, and promotional offers',
      disabled: false,
    },
    {
      key: 'walletCredits',
      title: 'Wallet Credits',
      description: 'Receive updates about wallet balance, credits, and payment notifications',
      disabled: false,
    },
    {
      key: 'newFeatures',
      title: 'New Features',
      description: 'Stay informed about new app features, updates, and service enhancements',
      disabled: false,
    },
    {
      key: 'serviceAlerts',
      title: 'Service Alerts',
      description: 'Important notifications about service interruptions, maintenance, and urgent updates',
      disabled: false,
    }
  ];

  const ToggleSwitch = ({ enabled, onToggle, disabled }) => (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
        disabled 
          ? 'bg-gray-300 cursor-not-allowed' 
          : enabled 
            ? 'bg-orange-500' 
            : 'bg-gray-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">SMS Preferences</h1>
      
      <div className="space-y-4">
        {notificationItems.map((item) => (
          <div key={item.key}>
            {item.disabled ? (
              // Special styling for disabled order updates (matches original design)
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <p className="text-gray-700 text-sm">
                  Order related SMS cannot be disabled as they are critical to provide service
                </p>
              </div>
            ) : (
              // Regular notification preference items
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {item.description}
                    </p>
                  </div>
                  
                  <div className="ml-4">
                    <ToggleSwitch
                      enabled={notificationPrefs[item.key]}
                      onToggle={() => handleToggle(item.key)}
                      disabled={item.disabled}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Delete Account Button */}
      <div className="mt-8">
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Delete Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bgOp flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Are you sure?
            </h3>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. Your account and all associated data will be permanently deleted.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}