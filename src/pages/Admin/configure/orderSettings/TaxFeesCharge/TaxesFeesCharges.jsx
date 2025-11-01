import React, { useEffect, useState } from "react";
import {
  DollarSign,
  Receipt,
  Building2,
  Package,
  Store,
  CreditCard,
  Plus,
} from "lucide-react";
import DataTable from "../../../../../components/admin/configure/orderSettings/TaxFeesCharge/DataTable";
import SectionHeader from "../../../../../components/admin/configure/orderSettings/TaxFeesCharge/SectionHeader";
import Toggle from "../../../../../components/admin/configure/orderSettings/TaxFeesCharge/Toggle";
import MarketplaceTaxModal from "../../../../../components/admin/configure/orderSettings/TaxFeesCharge/MarketplaceTaxModal";
import {
  createTaxOrCharge,
  getAllTaxesAndCharges,
  toggleTaxOrChargeStatus,
  deleteTaxOrCharge,
  updateTaxOrCharge,
} from "../../../../../apis/adminApis/TaxOrCharge";
import MerchantTaxModal from "../../../../../components/admin/configure/orderSettings/TaxFeesCharge/MerchantTaxModal";
import { fetchRestaurantsDropdown } from "../../../../../apis/adminApis/adminFuntionsApi";
import MarketplacePackingModal from "../../../../../components/admin/configure/orderSettings/MarketplacePackingModal";
import { toast } from "react-toastify";
import MerchantPackingChargeModal from "../../../../../components/admin/configure/orderSettings/TaxFeesCharge/MerchantPackingChargeModal";
import MarketplaceAdditionalChargeModal from "../../../../../components/admin/configure/orderSettings/TaxFeesCharge/MarketplaceAdditionalChargeModal";
import MerchantAdditionalChargeModal from "../../../../../components/admin/configure/orderSettings/TaxFeesCharge/MerchantAdditionalChargeModal";

function TaxesFeesCharges() {
  // Modal states
  const [isMarketTaxModalOpen, setIsMarketTaxModalOpen] = useState(false);
  const [isMerchantTaxModal, setIsMerchantTaxModal] = useState(false);
  const [isMarketpackModalOpen, setIsMarketpackModalOpen] = useState(false);
  const [isPackingModalOpen, setIsPackingModalOpen] = useState(false);
  const [isMarketAdditionModalOpen, setIsMarketAdditionModalOpen] = useState(false);
  const [isMerchantAdditionalModalOpen, setIsMerchantAdditionalModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [merchants, setMerchants] = useState([{ _id: "all", name: "All Merchants" }]);
  const [error, setError] = useState(null);

  // Edit tracking
  const [editingItem, setEditingItem] = useState(null);
  const [editingType, setEditingType] = useState("");

  // Merchant selection states
  const [selectedMerchant, setSelectedMerchant] = useState("all");
  const [selectedPackingMerchant, setSelectedPackingMerchant] = useState("all");
  const [selectedAdditionalMerchant, setSelectedAdditionalMerchant] = useState("all");

  // Data states
  const [marketplaceTaxes, setMarketplaceTaxes] = useState([]);
  const [merchantTaxes, setMerchantTaxes] = useState([]);
  const [marketplacePackingCharges, setMarketplacePackingCharges] = useState([]);
  const [merchantPackingCharges, setMerchantPackingCharges] = useState([]);
  const [marketplaceAdditionalCharges, setMarketplaceAdditionalCharges] = useState([]);
  const [merchantAdditionalCharges, setMerchantAdditionalCharges] = useState([]);

  // Toggles
  const [merchantTaxesEnabled, setMerchantTaxesEnabled] = useState(true);
  const [merchantPackingEnabled, setMerchantPackingEnabled] = useState(true);
  const [merchantAdditionalEnabled, setMerchantAdditionalEnabled] = useState(true);

  // --- Fetch Data on Mount ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const merchantsResponse = await fetchRestaurantsDropdown();
        setMerchants([{ _id: "all", name: "All Merchants" }, ...merchantsResponse.data]);
        const allCharges = await getAllTaxesAndCharges();

        setMarketplaceTaxes(allCharges.filter(
          charge => charge?.level === "Marketplace" && charge?.category === "Tax"
        ));
        setMerchantTaxes(allCharges.filter(
          charge => charge?.level === "Merchant" && charge?.category === "Tax"
        ));
        setMarketplacePackingCharges(allCharges.filter(
          charge => charge?.level === "Marketplace" && charge?.category === "PackingCharge"
        ));
        setMerchantPackingCharges(allCharges.filter(
          charge => charge?.level === "Merchant" && charge?.category === "PackingCharge"
        ));
        setMarketplaceAdditionalCharges(allCharges.filter(
          charge => charge?.level === "Marketplace" && charge?.category === "AdditionalCharge"
        ));
        setMerchantAdditionalCharges(allCharges.filter(
          charge => charge?.level === "Merchant" && charge?.category === "AdditionalCharge"
        ));
      } catch (err) {
        toast.error("Failed to load data");
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Filtering helpers ---
  const filteredMerchantTaxes = selectedMerchant === "all"
    ? merchantTaxes
    : merchantTaxes.filter(tax => tax?.merchant?._id === selectedMerchant);

  const filteredMerchantPackingCharges = selectedPackingMerchant === "all"
    ? merchantPackingCharges
    : merchantPackingCharges.filter(charge => charge?.merchant?._id === selectedPackingMerchant);

  const filteredMerchantAdditionalCharges = selectedAdditionalMerchant === "all"
    ? merchantAdditionalCharges
    : merchantAdditionalCharges.filter(charge => charge?.merchant?._id === selectedAdditionalMerchant);

  // --- Modal/CRUD Handlers ---

  // 1. Edit: track item and type, open modal
  const handleEdit = (item, type) => {
    setEditingItem(item);
    setEditingType(type);
    if (type === "MarketplaceTax") setIsMarketTaxModalOpen(true);
    else if (type === "MerchantTax") setIsMerchantTaxModal(true);
    else if (type === "MarketplacePacking") setIsMarketpackModalOpen(true);
    else if (type === "MerchantPacking") setIsPackingModalOpen(true);
    else if (type === "MarketplaceAdditional") setIsMarketAdditionModalOpen(true);
    else if (type === "MerchantAdditional") setIsMerchantAdditionalModalOpen(true);
  };

  // 2. Delete: API+UI confirm
  const handleDelete = async (item, setState, data) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteTaxOrCharge(item._id);
      setState(data.filter(d => d._id !== item._id));
      toast.success("Deleted successfully");
    } catch (error) {
      toast.error(error.message || "Failed to delete");
    }
  };

  // 3. Update
  const handleUpdate = async (id, updatedData, setState, data, closeModal) => {
    setIsLoading(true);
    try {
      const updated = await updateTaxOrCharge(id, updatedData);
      setState(data.map(d => d._id === updated._id ? updated : d));
      closeModal();
      setEditingItem(null);
      setEditingType("");
      toast.success("Updated successfully");
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Status Toggle
  const handleStatusToggle = async (item, setState, data) => {
    try {
      setState(prevData =>
        prevData.map(d =>
          d._id === item._id ? { ...d, status: !d.status } : d
        )
      );
      const updatedItem = await toggleTaxOrChargeStatus(item._id);
      setState(prevData =>
        prevData.map(d =>
          d._id === updatedItem._id ? updatedItem : d
        )
      );
      toast.success("Status updated successfully");
    } catch (error) {
      setState(data); // Revert on error
      toast.error(error.message || "Failed to update status");
    }
  };

  // --- Create (unaltered) ---
  const handleCreateTax = async (payload) => {
    setIsLoading(true);
    try {
      const createdTax = await createTaxOrCharge(payload);
      if (payload.level === "Marketplace") setMarketplaceTaxes([...marketplaceTaxes, createdTax]);
      else setMerchantTaxes([...merchantTaxes, createdTax]);
      setIsMarketTaxModalOpen(false);
      setIsMerchantTaxModal(false);
      toast.success("Tax created successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create tax");
    } finally {
      setIsLoading(false);
    }
  };
  const handleCreateMerchantTax = async (payload) => {
    setIsLoading(true);
    try {
      const finalPayload = {
        ...payload,
        level: "Merchant",
        merchant: selectedMerchant === "all" ? null : selectedMerchant,
        category: "Tax"
      };
      const createdTax = await createTaxOrCharge(finalPayload);
      setMerchantTaxes([...merchantTaxes, createdTax]);
      setIsMerchantTaxModal(false);
      toast.success("Merchant tax created successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create merchant tax");
    } finally {
      setIsLoading(false);
    }
  };
  const handleAddMerchantPackingCharge = async (payload) => {
    try {
      const finalPayload = {
        ...payload,
        merchant: selectedPackingMerchant === "all" ? null : selectedPackingMerchant,
        level: "Merchant",
        category: "PackingCharge"
      };
      const response = await createTaxOrCharge(finalPayload);
      setMerchantPackingCharges(prev => [...prev, response.data]);
      toast.success("Packing charge added successfully");
      setIsPackingModalOpen(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create packing charge");
    }
  };
  const handleCreateMarketplacePackingCharge = async (payload) => {
    try {
      const finalPayload = {
        ...payload,
        category: "PackingCharge",
        level: "Marketplace"
      };
      const response = await createTaxOrCharge(finalPayload);
      setMarketplacePackingCharges([...marketplacePackingCharges, response]);
      toast.success("Marketplace packing charge created successfully");
      setIsMarketpackModalOpen(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create packing charge");
    }
  };
  const handleCreateMarketplaceAdditionalCharge = async (payload) => {
    try {
      const finalPayload = {
        ...payload,
        category: "AdditionalCharge",
        level: "Marketplace"
      };
      const response = await createTaxOrCharge(finalPayload);
      setMarketplaceAdditionalCharges([...marketplaceAdditionalCharges, response]);
      toast.success("Marketplace additional charge created successfully");
      setIsMarketAdditionModalOpen(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create additional charge");
    }
  };
  const handleCreateMerchantAdditionalCharge = async (payload) => {
    try {
      const finalPayload = {
        ...payload,
        merchant: selectedAdditionalMerchant === "all" ? null : selectedAdditionalMerchant,
        level: "Merchant",
        category: "AdditionalCharge"
      };
      const response = await createTaxOrCharge(finalPayload);
      setMerchantAdditionalCharges([...merchantAdditionalCharges, response]);
      toast.success("Merchant additional charge created successfully");
      setIsMerchantAdditionalModalOpen(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create additional charge");
    }
  };

  // --- Column definitions ---
  const taxColumns = [
    { key: "name", label: "Tax Name", sortable: true },
    { key: "type", label: "Type", sortable: true },
    { key: "value", label: "Value", sortable: true },
    { key: "applicableOn", label: "Applicable On", sortable: true },
    { key: "status", label: "Status", sortable: true,
      render: (value) => value ? 'Active' : 'Inactive' }
  ];
  const merchantTaxColumns = [
    { key: "_id", label: "Tax ID", sortable: true },
    { key: "name", label: "Tax Name", sortable: true },
    { key: "value", label: "Tax Value", sortable: true },
    { key: "type", label: "Type", sortable: true },
    { key: "applicableOn", label: "Applicable On", sortable: true },
    { key: "merchant.name", label: "Merchant Name", sortable: true },
    { key: "status", label: "Status", sortable: false },
  ];
  const chargeColumns = [
    { key: "name", label: "Name", sortable: true },
    { key: "value", label: "Amount", sortable: true },
    { key: "type", label: "Type", sortable: true },
    { key: "applicableOn", label: "Applicable On", sortable: true },
    { key: "status", label: "Status", sortable: false },
  ];
  const merchantChargeColumns = [
    { key: "name", label: "Name", sortable: true },
    { key: "value", label: "Amount", sortable: true },
    { key: "type", label: "Type", sortable: true },
    { key: "applicableOn", label: "Applicable On", sortable: true },
    { key: "merchant.name", label: "Merchant Name", sortable: true },
    { key: "status", label: "Status", sortable: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <DollarSign className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Taxes & Charges</h1>
              <p className="text-gray-600 mt-1">
                Manage all taxes and additional charges
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">

        {/* Marketplace Level Taxes */}
        <section>
          <SectionHeader
            title="Marketplace Level Taxes"
            description="Manage taxes applied at the marketplace level across all merchants"
            buttonText="Add New Marketplace Tax"
            onAddNew={() => { setIsMarketTaxModalOpen(true); setEditingItem(null); setEditingType(""); }}
            icon={Receipt}
          />
          <DataTable
            data={marketplaceTaxes}
            columns={taxColumns}
            onEdit={item => handleEdit(item, "MarketplaceTax")}
            onDelete={item => handleDelete(item, setMarketplaceTaxes, marketplaceTaxes)}
            onStatusToggle={item => handleStatusToggle(item, setMarketplaceTaxes, marketplaceTaxes)}
          />
        </section>

        {/* Merchant Level Taxes */}
        <section>
          <SectionHeader
            title="Merchant Level Taxes"
            description="Manage taxes specific to individual merchants"
            buttonText="Add New Merchant Tax"
            onAddNew={() => { setIsMerchantTaxModal(true); setEditingItem(null); setEditingType(""); }}
            icon={Building2}
          />
          <div className="mb-6 bg-white p-6 rounded-lg border border-gray-200">
            <Toggle
              enabled={merchantTaxesEnabled}
              onChange={() => setMerchantTaxesEnabled(!merchantTaxesEnabled)}
              label="Enable merchant-specific taxes"
              size="md"
            />
            <p className="text-sm text-gray-500 mt-2">
              Allow merchants to set their own tax rates and rules
            </p>
          </div>
          {merchantTaxesEnabled && (
            <>
              <div className="mb-6 bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Merchant
                    </label>
                    <select
                      value={selectedMerchant}
                      onChange={(e) => setSelectedMerchant(e.target.value)}
                      className="block w-64 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      {merchants.map((merchant) => (
                        <option key={merchant._id} value={merchant._id}>
                          {merchant.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedMerchant === "all"
                      ? `Showing ${filteredMerchantTaxes.length} taxes from all merchants`
                      : `Showing ${filteredMerchantTaxes.length} taxes for ${
                          merchants.find(m => m._id === selectedMerchant)?.name || 'selected merchant'
                        }`}
                  </div>
                </div>
              </div>
              <DataTable
                data={filteredMerchantTaxes}
                columns={merchantTaxColumns}
                onEdit={item => handleEdit(item, "MerchantTax")}
                onDelete={item => handleDelete(item, setMerchantTaxes, merchantTaxes)}
                onStatusToggle={item => handleStatusToggle(item, setMerchantTaxes, merchantTaxes)}
              />
            </>
          )}
        </section>

        {/* Marketplace Level Packing Charges */}
        <section>
          <SectionHeader
            title="Marketplace Level Packing Charges"
            description="Manage packing charges applied at the marketplace level"
            buttonText="Add New Marketplace Packing Charge"
            onAddNew={() => { setIsMarketpackModalOpen(true); setEditingItem(null); setEditingType(""); }}
            icon={Package}
          />
          <DataTable
            data={marketplacePackingCharges}
            columns={chargeColumns}
            onEdit={item => handleEdit(item, "MarketplacePacking")}
            onDelete={item => handleDelete(item, setMarketplacePackingCharges, marketplacePackingCharges)}
            onStatusToggle={item => handleStatusToggle(item, setMarketplacePackingCharges, marketplacePackingCharges)}
          />
        </section>

        {/* Merchant Level Packing Charges */}
        <section>
          <SectionHeader
            title="Merchant Level Packing Charges"
            description="Manage packing charges specific to individual merchants"
            buttonText="Add New Merchant Packing Charge"
            onAddNew={() => { setIsPackingModalOpen(true); setEditingItem(null); setEditingType(""); }}
            icon={Store}
          />
          <div className="mb-6 bg-white p-6 rounded-lg border border-gray-200">
            <Toggle
              enabled={merchantPackingEnabled}
              onChange={() => setMerchantPackingEnabled(!merchantPackingEnabled)}
              label="Allow merchant packing charges"
              size="md"
            />
            <p className="text-sm text-gray-500 mt-2">
              Allow merchants to set their own packing charges and packaging options
            </p>
          </div>
          {merchantPackingEnabled && (
            <>
              <div className="mb-6 bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Merchant
                    </label>
                    <select
                      value={selectedPackingMerchant}
                      onChange={(e) => setSelectedPackingMerchant(e.target.value)}
                      className="block w-64 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      {merchants.map((merchant) => (
                        <option key={merchant._id} value={merchant._id}>
                          {merchant.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedPackingMerchant === "all"
                      ? `Showing ${filteredMerchantPackingCharges.length} packing charges from all merchants`
                      : `Showing ${filteredMerchantPackingCharges.length} packing charges for ${
                          merchants.find(m => m._id === selectedPackingMerchant)?.name || 'selected merchant'
                        }`}
                  </div>
                </div>
              </div>
              <DataTable
                data={filteredMerchantPackingCharges}
                columns={merchantChargeColumns}
                onEdit={item => handleEdit(item, "MerchantPacking")}
                onDelete={item => handleDelete(item, setMerchantPackingCharges, merchantPackingCharges)}
                onStatusToggle={item => handleStatusToggle(item, setMerchantPackingCharges, merchantPackingCharges)}
              />
            </>
          )}
        </section>

        {/* Marketplace Level Additional Charges */}
        <section>
          <SectionHeader
            title="Marketplace Level Additional Charges"
            description="Manage additional charges applied at the marketplace level"
            buttonText="Add New Marketplace Additional Charge"
            onAddNew={() => { setIsMarketAdditionModalOpen(true); setEditingItem(null); setEditingType(""); }}
            icon={CreditCard}
          />
          <DataTable
            data={marketplaceAdditionalCharges}
            columns={chargeColumns}
            onEdit={item => handleEdit(item, "MarketplaceAdditional")}
            onDelete={item => handleDelete(item, setMarketplaceAdditionalCharges, marketplaceAdditionalCharges)}
            onStatusToggle={item => handleStatusToggle(item, setMarketplaceAdditionalCharges, marketplaceAdditionalCharges)}
          />
        </section>

        {/* Merchant Level Additional Charges */}
        <section>
          <SectionHeader
            title="Merchant Level Additional Charges"
            description="Manage additional charges specific to individual merchants"
            buttonText="Add New Merchant Additional Charge"
            onAddNew={() => { setIsMerchantAdditionalModalOpen(true); setEditingItem(null); setEditingType(""); }}
            icon={Plus}
          />
          <div className="mb-6 bg-white p-6 rounded-lg border border-gray-200">
            <Toggle
              enabled={merchantAdditionalEnabled}
              onChange={() => setMerchantAdditionalEnabled(!merchantAdditionalEnabled)}
              label="Allow merchant-specific additional charges"
              size="md"
            />
            <p className="text-sm text-gray-500 mt-2">
              Allow merchants to set their own additional charges and special fees
            </p>
          </div>
          {merchantAdditionalEnabled && (
            <>
              <div className="mb-6 bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Merchant
                    </label>
                    <select
                      value={selectedAdditionalMerchant}
                      onChange={(e) => setSelectedAdditionalMerchant(e.target.value)}
                      className="block w-64 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      {merchants.map((merchant) => (
                        <option key={merchant._id} value={merchant._id}>
                          {merchant.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedAdditionalMerchant === "all"
                      ? `Showing ${filteredMerchantAdditionalCharges.length} additional charges from all merchants`
                      : `Showing ${filteredMerchantAdditionalCharges.length} additional charges for ${
                          merchants.find(m => m._id === selectedAdditionalMerchant)?.name || 'selected merchant'
                        }`}
                  </div>
                </div>
              </div>
              <DataTable
                data={filteredMerchantAdditionalCharges}
                columns={merchantChargeColumns}
                onEdit={item => handleEdit(item, "MerchantAdditional")}
                onDelete={item =>
                  handleDelete(item, setMerchantAdditionalCharges, merchantAdditionalCharges)
                }
                onStatusToggle={item =>
                  handleStatusToggle(item, setMerchantAdditionalCharges, merchantAdditionalCharges)
                }
              />
            </>
          )}
        </section>

        {/* --- Modals, each supporting edit/create --- */}
        <MarketplaceTaxModal
          isOpen={isMarketTaxModalOpen}
          onClose={() => {
            setIsMarketTaxModalOpen(false);
            setEditingItem(null);
            setEditingType("");
          }}
          onSubmit={async (payload) => {
            if (editingType === "MarketplaceTax" && editingItem)
              await handleUpdate(editingItem._id, payload, setMarketplaceTaxes, marketplaceTaxes, () => setIsMarketTaxModalOpen(false));
            else
              await handleCreateTax(payload);
          }}
          initialValues={editingType === "MarketplaceTax" ? editingItem : null}
        />

        <MerchantTaxModal
          isOpen={isMerchantTaxModal}
          onClose={() => {
            setIsMerchantTaxModal(false);
            setEditingItem(null);
            setEditingType("");
          }}
          onSubmit={async (payload) => {
            if (editingType === "MerchantTax" && editingItem)
              await handleUpdate(editingItem._id, payload, setMerchantTaxes, merchantTaxes, () => setIsMerchantTaxModal(false));
            else
              await handleCreateMerchantTax(payload);
          }}
          merchants={merchants.filter(m => m._id !== "all")}
          selectedMerchant={selectedMerchant === "all" ? null : selectedMerchant}
          initialValues={editingType === "MerchantTax" ? editingItem : null}
        />

        <MarketplacePackingModal
          isOpen={isMarketpackModalOpen}
          onClose={() => {
            setIsMarketpackModalOpen(false);
            setEditingItem(null);
            setEditingType("");
          }}
          onSubmit={async (payload) => {
            if (editingType === "MarketplacePacking" && editingItem)
              await handleUpdate(editingItem._id, payload, setMarketplacePackingCharges, marketplacePackingCharges, () => setIsMarketpackModalOpen(false));
            else
              await handleCreateMarketplacePackingCharge(payload);
          }}
          initialValues={editingType === "MarketplacePacking" ? editingItem : null}
        />

        <MerchantPackingChargeModal
          isOpen={isPackingModalOpen}
          onClose={() => {
            setIsPackingModalOpen(false);
            setEditingItem(null);
            setEditingType("");
          }}
          onSubmit={async (payload) => {
            if (editingType === "MerchantPacking" && editingItem)
              await handleUpdate(editingItem._id, payload, setMerchantPackingCharges, merchantPackingCharges, () => setIsPackingModalOpen(false));
            else
              await handleAddMerchantPackingCharge(payload);
          }}
          merchant={selectedPackingMerchant === "all"
            ? { _id: "all", name: "All Merchants" }
            : merchants.find(m => m._id === selectedPackingMerchant)}
          initialValues={editingType === "MerchantPacking" ? editingItem : null}
        />

        <MarketplaceAdditionalChargeModal
          isOpen={isMarketAdditionModalOpen}
          onClose={() => {
            setIsMarketAdditionModalOpen(false);
            setEditingItem(null);
            setEditingType("");
          }}
          onSubmit={async (payload) => {
            if (editingType === "MarketplaceAdditional" && editingItem)
              await handleUpdate(editingItem._id, payload, setMarketplaceAdditionalCharges, marketplaceAdditionalCharges, () => setIsMarketAdditionModalOpen(false));
            else
              await handleCreateMarketplaceAdditionalCharge(payload);
          }}
          initialValues={editingType === "MarketplaceAdditional" ? editingItem : null}
        />

        <MerchantAdditionalChargeModal
          isOpen={isMerchantAdditionalModalOpen}
          onClose={() => {
            setIsMerchantAdditionalModalOpen(false);
            setEditingItem(null);
            setEditingType("");
          }}
          onSubmit={async (payload) => {
            if (editingType === "MerchantAdditional" && editingItem)
              await handleUpdate(editingItem._id, payload, setMerchantAdditionalCharges, merchantAdditionalCharges, () => setIsMerchantAdditionalModalOpen(false));
            else
              await handleCreateMerchantAdditionalCharge(payload);
          }}
          merchants={merchants.filter(m => m._id !== "all")}
          selectedMerchant={selectedAdditionalMerchant === "all" ? null : selectedAdditionalMerchant}
          initialValues={editingType === "MerchantAdditional" ? editingItem : null}
        />
      </div>
    </div>
  );
}

export default TaxesFeesCharges;
