import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRole } from "../../../../apis/adminApis/roleApi";

const AddRolePage = () => {
  const navigate = useNavigate();
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [permissions, setPermissions] = useState([
    {
      moduleName: "orders",
      create: false,
      view: false,
      edit: false,
      delete: false,
    },
    {
      moduleName: "restaurants",
      create: false,
      view: false,
      edit: false,
      delete: false,
    },
    {
      moduleName: "restaurant_configurations",
      create: false,
      view: false,
      edit: false,
      delete: false,
    },
    {
      moduleName: "catalogue",
      create: false,
      view: false,
      edit: false,
      delete: false,
    },
    {
      moduleName: "import_export",
      create: false,
      view: false,
      edit: false,
      delete: false,
    },
    {
      moduleName: "customers",
      create: false,
      view: false,
      edit: false,
      delete: false,
    },
    { moduleName: "analytics", view: false },
    {
      moduleName: "wallet",
      create: false,
      view: false,
      edit: false,
      delete: false,
    },
    {
      moduleName: "promo_codes",
      create: false,
      view: false,
      edit: false,
      delete: false,
    },
    {
      moduleName: "discount",
      create: false,
      view: false,
      edit: false,
      delete: false,
    },
    {
      moduleName: "referral",
      create: false,
      view: false,
      edit: false,
      delete: false,
    },
    {
      moduleName: "ad_banners",
      create: false,
      view: false,
      edit: false,
      delete: false,
    },
    {
      moduleName: "loyalty_points",
      create: false,
      view: false,
      edit: false,
      delete: false,
    },
    {
      moduleName: "push_campaigns",
      create: false,
      view: false,
      edit: false,
      delete: false,
    },
    {
      moduleName: "seo_for_manager",
      create: false,
      view: false,
      edit: false,
      delete: false,
    },
    {
      moduleName: "catalog",
      create: false,
      view: false,
      edit: false,
      delete: false,
    },
    {
      moduleName: "checkout",
      create: false,
      view: false,
      edit: false,
      delete: false,
    },
    {
      moduleName: "delivery",
      create: false,
      view: false,
      edit: false,
      delete: false,
    },
    {
      moduleName: "order_settings_orders",
      create: false,
      view: false,
      edit: false,
      delete: false,
    },
    {
      moduleName: "cancellation",
      create: false,
      view: false,
      edit: false,
      delete: false,
    },
    {
      moduleName: "commission",
      create: false,
      view: false,
      edit: false,
      delete: false,
    },
    {
      moduleName: "taxes_fees_charges",
      create: false,
      view: false,
      edit: false,
      delete: false,
    },
    {
      moduleName: "user_settings_customers",
      create: false,
      view: false,
      edit: false,
      delete: false,
    },
    {
      moduleName: "user_settings_restaurants",
      create: false,
      view: false,
      edit: false,
      delete: false,
    },
    {
      moduleName: "marketplace",
      create: false,
      view: false,
      edit: false,
      delete: false,
    },
    {
      moduleName: "preferences",
      create: false,
      view: false,
      edit: false,
      delete: false,
    },
    {
      moduleName: "terminology",
      create: false,
      view: false,
      edit: false,
      delete: false,
    },
    {
      moduleName: "notifications",
      create: false,
      view: false,
      edit: false,
      delete: false,
    },
    {
      moduleName: "tookan",
      create: false,
      view: false,
      edit: false,
      delete: false,
    },
    {
      moduleName: "webhooks",
      create: false,
      view: false,
      edit: false,
      delete: false,
    },
    {
      moduleName: "master_brand",
      create: false,
      view: false,
      edit: false,
      delete: false,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    general: false,
    marketing: false,
    orderSettings: false,
    userSettings: false,
    marketplace: false,
    generalSettings: false,
    tookanIntegration: false,
    integration: false,
    masterBrand: false,
  });

  const handlePermissionChange = (moduleName, permission) => {
    setPermissions((prev) =>
      prev.map((module) => {
        if (module.moduleName === moduleName) {
          // For analytics which only has view permission
          if (moduleName === "analytics") {
            return { ...module, view: !module.view };
          }
          return { ...module, [permission]: !module[permission] };
        }
        return module;
      })
    );
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const roleData = {
        roleName,
        description: roleDescription,
        permissions: permissions.map((module) => {
          // For analytics, we only need the view property
          if (module.moduleName === "analytics") {
            return { moduleName: module.moduleName, view: module.view };
          }
          return module;
        }),
      };

      const response = await createRole(roleData);
      console.log("Role created:", response);
      navigate("/admin/dashboard/role-management");
    } catch (err) {
      setError(err.message || "Failed to create role");
      console.error("Error creating role:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper component for permission toggles
  const PermissionToggle = ({
    moduleName,
    permission,
    label,
    disabled = false,
  }) => {
    const module = permissions.find((m) => m.moduleName === moduleName);
    if (!module) return null;

    return (
      <div className="flex justify-between items-center mb-3">
        <label className="text-gray-700">{label}</label>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={module[permission]}
            onChange={() => handlePermissionChange(moduleName, permission)}
            disabled={disabled}
          />
          <div
            className={`w-11 h-6 ${
              disabled ? "bg-gray-300" : "bg-gray-200"
            } peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
              disabled ? "peer-checked:bg-gray-400" : "peer-checked:bg-blue-500"
            }`}
          ></div>
        </label>
      </div>
    );
  };

  // Helper component for section
  const Section = ({ title, sectionKey, moduleGroups }) => (
    <div className="border border-gray-200 rounded mb-4">
      <div
        className="bg-gray-100 p-3 cursor-pointer flex justify-between items-center"
        onClick={() => toggleSection(sectionKey)}
      >
        <h4 className="font-medium">{title}</h4>
        <svg
          className={`w-5 h-5 transform transition-transform ${
            expandedSections[sectionKey] ? "rotate-180" : ""
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      {expandedSections[sectionKey] && (
        <div className="p-4 border-t border-gray-200">
          {moduleGroups.map(({ title: groupTitle, modules }) => (
            <div key={groupTitle} className="mb-4 last:mb-0">
              <h5 className="font-medium mb-2 text-gray-700">{groupTitle}</h5>
              <div className="pl-4">
                {modules.map((moduleName) => {
                  const module = permissions.find(
                    (m) => m.moduleName === moduleName
                  );
                  if (!module) return null;

                  return (
                    <div
                      key={moduleName}
                      className="border border-gray-200 rounded mb-2 p-3"
                    >
                      <h6 className="font-medium mb-2 capitalize">
                        {moduleName.replace(/_/g, " ")}
                      </h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {moduleName === "analytics" ? (
                          <PermissionToggle
                            moduleName={moduleName}
                            permission="view"
                            label="View"
                          />
                        ) : (
                          <>
                            <PermissionToggle
                              moduleName={moduleName}
                              permission="create"
                              label="Create"
                            />
                            <PermissionToggle
                              moduleName={moduleName}
                              permission="view"
                              label="View"
                            />
                            <PermissionToggle
                              moduleName={moduleName}
                              permission="edit"
                              label="Edit"
                            />
                            <PermissionToggle
                              moduleName={moduleName}
                              permission="delete"
                              label="Delete"
                            />
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full p-0">
      <div className="flex items-center border border-gray-200 rounded p-4 mb-4">
        <h3 className="text-xl font-semibold capitalize">Add Role</h3>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <section className="border border-gray-200 rounded p-4 mb-4">
        <div className="w-full">
          <section className="border-none">
            <div className="w-full">
              <form className="w-full" onSubmit={handleSubmit}>
                <div className="flex flex-col md:flex-row items-center mb-4">
                  <label className="font-medium w-full md:w-1/3 mb-2 md:mb-0">
                    Role Name<span className="text-red-500">*</span>
                  </label>
                  <div className="w-full md:w-2/3">
                    <input
                      type="text"
                      name="role_name"
                      autoFocus
                      className="border border-gray-300 rounded px-3 py-2 w-full"
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center mb-4">
                  <label className="font-medium w-full md:w-1/3 mb-2 md:mb-0">
                    Role Description
                  </label>
                  <div className="w-full md:w-2/3">
                    <input
                      type="text"
                      maxLength="60"
                      name="role_description"
                      className="border border-gray-300 rounded px-3 py-2 w-full"
                      value={roleDescription}
                      onChange={(e) => setRoleDescription(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-4 pl-0">
                  <label className="text-gray-700 mb-0">
                    <b>Permissions</b>
                  </label>
                </div>

                {/* General Section */}
                <Section
                  title="General"
                  sectionKey="general"
                  moduleGroups={[
                    { title: "Orders", modules: ["orders"] },
                    {
                      title: "Restaurants",
                      modules: ["restaurants", "restaurant_configurations"],
                    },
                    {
                      title: "Catalogue",
                      modules: ["catalogue", "import_export"],
                    },
                    { title: "Customers", modules: ["customers"] },
                    { title: "Analytics", modules: ["analytics"] },
                    { title: "Wallet", modules: ["wallet"] },
                  ]}
                />

                {/* Marketing Section */}
                <Section
                  title="Marketing"
                  sectionKey="marketing"
                  moduleGroups={[
                    {
                      title: "Promotions",
                      modules: ["promo_codes", "discount", "referral"],
                    },
                    { title: "Advertising", modules: ["ad_banners"] },
                    { title: "Loyalty", modules: ["loyalty_points"] },
                    { title: "Campaigns", modules: ["push_campaigns"] },
                    { title: "SEO", modules: ["seo_for_manager"] },
                  ]}
                />

                {/* Order Settings Section */}
                <Section
                  title="Order Settings"
                  sectionKey="orderSettings"
                  moduleGroups={[
                    { title: "Catalog", modules: ["catalog"] },
                    { title: "Checkout", modules: ["checkout"] },
                    { title: "Delivery", modules: ["delivery"] },
                    { title: "Orders", modules: ["order_settings_orders"] },
                    { title: "Cancellation", modules: ["cancellation"] },
                    { title: "Commission", modules: ["commission"] },
                    { title: "Taxes & Fees", modules: ["taxes_fees_charges"] },
                  ]}
                />

                {/* User Settings Section */}
                <Section
                  title="User Settings"
                  sectionKey="userSettings"
                  moduleGroups={[
                    {
                      title: "Customers",
                      modules: ["user_settings_customers"],
                    },
                    {
                      title: "Restaurants",
                      modules: ["user_settings_restaurants"],
                    },
                  ]}
                />

                {/* Marketplace Section */}
                <Section
                  title="Marketplace"
                  sectionKey="marketplace"
                  moduleGroups={[
                    { title: "Marketplace", modules: ["marketplace"] },
                  ]}
                />

                {/* General Settings Section */}
                <Section
                  title="General Settings"
                  sectionKey="generalSettings"
                  moduleGroups={[
                    { title: "Preferences", modules: ["preferences"] },
                    { title: "Terminology", modules: ["terminology"] },
                    { title: "Notifications", modules: ["notifications"] },
                  ]}
                />

                {/* TOOKAN Integration Section */}
                <Section
                  title="TOOKAN Integration"
                  sectionKey="tookanIntegration"
                  moduleGroups={[{ title: "TOOKAN", modules: ["tookan"] }]}
                />

                {/* Integration Section */}
                <Section
                  title="Integration"
                  sectionKey="integration"
                  moduleGroups={[{ title: "Webhooks", modules: ["webhooks"] }]}
                />

                {/* Master Brand Section */}
                <Section
                  title="Master Brand"
                  sectionKey="masterBrand"
                  moduleGroups={[
                    { title: "Master Brand", modules: ["master_brand"] },
                  ]}
                />

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 float-right disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add"}
                </button>
                <div className="clear-both"></div>
              </form>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
};

export default AddRolePage;
