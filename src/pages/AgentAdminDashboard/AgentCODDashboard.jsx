import React, { useState, useEffect, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Search, Calendar, User, AlertTriangle, Pencil, XCircle, Check, X, CheckCircle
} from "lucide-react";
import { getAgentCODMonitor, updateAgentCODLimit } from "../../apis/adminApis/agentApi";

// Status badge utility
function statusBadge(status) {
  if (status === "OK")
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"><CheckCircle size={13} className="mr-1" />OK</span>;
  if (status === "over")
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800"><AlertTriangle size={13} className="mr-1" />Over</span>;
  return null;
}

function holdingColor(holding, limit) {
  return holding > limit ? "text-rose-600 font-bold" : "text-green-600 font-bold";
}

export default function AgentCODDashboard() {
  // === Main STATE ===
  const [agents, setAgents] = useState([]);
  const [summary, setSummary] = useState({ totalCODHeld: 0, agentsExceededCOD: 0, unverifiedSubmits: 0 });
  const [pagination, setPagination] = useState({ totalDocs: 0, totalPages: 1, page: 1, limit: 10 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter state
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

  // Modal states
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({ codLimit: "" });
  const [editError, setEditError] = useState(null);

  // Fetch data from API
  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      try {
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          search: search || undefined,
          dateFrom: dateFrom ? dateFrom.toISOString() : undefined,
          dateTo: dateTo ? dateTo.toISOString() : undefined,
        };
        const response = await getAgentCODMonitor(params);
        setAgents(response.data);
        setSummary(response.summary);
        setPagination(response.pagination);
      } catch (err) {
        setError("Failed to fetch agent data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, [pagination.page, search, dateFrom, dateTo]);

  // Pagination Controls Component
  function PaginationControls() {
    if (pagination.totalPages <= 1) return null;
    
    return (
      <div className="flex justify-center items-center gap-3 py-4 bg-gradient-to-r from-orange-50 to-orange-100">
        <button
          className="px-4 py-2 rounded-lg bg-white border-2 border-orange-300 font-bold text-orange-700 shadow-md hover:bg-orange-50 hover:border-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
          disabled={pagination.page === 1}
        >
          Previous
        </button>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-white rounded-lg border border-orange-200 text-orange-800 font-semibold shadow-sm">
            {pagination.page}
          </span>
          <span className="text-orange-600 font-medium">of</span>
          <span className="px-3 py-1 bg-white rounded-lg border border-orange-200 text-orange-800 font-semibold shadow-sm">
            {pagination.totalPages}
          </span>
        </div>
        <button
          className="px-4 py-2 rounded-lg bg-white border-2 border-orange-300 font-bold text-orange-700 shadow-md hover:bg-orange-50 hover:border-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
          disabled={pagination.page === pagination.totalPages}
        >
          Next
        </button>
      </div>
    );
  }

  // Open edit modal
  function openEdit(agent) {
    setEditModal(agent);
    setEditForm({ codLimit: agent.codLimit });
    setEditError(null);
  }


function formatToReadableIST(isoString) {
  if (!isoString) return "—";

  const date = new Date(isoString);
  const now = new Date();

  // ✅ Convert UTC → IST (+5 hours 30 minutes)
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(date.getTime() + istOffset);
  const istNow = new Date(now.getTime() + istOffset);

  const isToday =
    istDate.getDate() === istNow.getDate() &&
    istDate.getMonth() === istNow.getMonth() &&
    istDate.getFullYear() === istNow.getFullYear();

  const yesterday = new Date(istNow);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    istDate.getDate() === yesterday.getDate() &&
    istDate.getMonth() === yesterday.getMonth() &&
    istDate.getFullYear() === yesterday.getFullYear();

  const formattedTime = istDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  if (isToday) return `Today, ${formattedTime}`;
  if (isYesterday) return `Yesterday, ${formattedTime}`;

  const formattedDate = istDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return `${formattedDate}, ${formattedTime}`;
}



  
  // Submit edit (for COD limit with API call and toast)
  async function submitEdit(ev) {
    ev.preventDefault();
    const newLimit = Number(editForm.codLimit);
    if (!newLimit || newLimit < 0) {
      setEditError("Please enter a valid COD limit.");
      toast.error("Please enter a valid COD limit.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    try {
      await updateAgentCODLimit(editModal.id, newLimit);
      // Refetch agents to get updated data
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        dateFrom: dateFrom ? dateFrom.toISOString() : undefined,
        dateTo: dateTo ? dateTo.toISOString() : undefined,
      };
      const response = await getAgentCODMonitor(params);
      setAgents(response.data);
      setSummary(response.summary);
      setPagination(response.pagination);
      setEditModal(null);
      setEditForm({ codLimit: "" });
      setEditError(null);
      toast.success("COD limit updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      const errorMessage = "Failed to update COD limit. Please try again.";
      setEditError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      console.error(err);
    }
  }

  // === Render
  return (
    <>
      <style>{`
        @media (max-width: 640px){
          .react-datepicker{font-size:1rem !important;transform:scale(0.9)!important;}
        }
        .react-datepicker__header{background:#f97316!important;color:white!important;}
        .react-datepicker__day--selected{background:#f97316!important;color:white!important;font-weight:bold;}
        .react-datepicker__day--keyboard-selected{background:#fb923c!important;color:white!important;}
        .react-datepicker__day:hover{background:#fed7aa!important;color:#9a3412!important;}
        .react-datepicker__day--today{background:#ffedd5!important;color:#ea580c!important;font-weight:600!important;}
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 pb-14">
        {/* Toast Container */}
        <ToastContainer />
        {/* Header */}
        <div className="bg-white shadow-lg border-b border-orange-100">
          <div className="max-w-7xl mx-auto px-6 py-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <User size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Agent COD Monitoring
              </h1>
              <p className="text-base text-gray-600">Monitor and edit Cash On Delivery limits for all agents</p>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        <div className="max-w-7xl mx-auto px-6 py-5">
          <form
            className="bg-white p-5 rounded-xl border border-orange-100 shadow flex flex-wrap items-end gap-x-2 gap-y-5"
            style={{ justifyContent: 'center' }}
            onSubmit={e => e.preventDefault()}>
            <div className="flex flex-col items-center w-full sm:w-[240px]">
              <label className="block text-xs font-semibold mb-1 text-gray-700 ml-1 md:mr-40">Search Agent</label>
              <div className="relative w-full">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full pl-9 pr-2 py-2 text-center sm:text-left rounded-lg border border-orange-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Name or Phone"
                />
              </div>
            </div>
            <div className="flex-grow max-w-full flex gap-x-0 gap-y-3 flex-col sm:flex-row">
              <div className="flex flex-col items-center sm:items-start">
                <label className="block text-xs font-semibold mb-1 text-gray-700 ml-1">From</label>
                <DatePicker selected={dateFrom} onChange={setDateFrom}
                  maxDate={dateTo}
                  placeholderText="Start Date"
                  className="w-full px-3 py-2 rounded-lg border border-orange-300 text-center sm:text-left text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  dateFormat="dd/MM/yyyy"
                  isClearable
                />
              </div>
              <div className="flex flex-col items-center sm:items-start ml-0 sm:ml-1">
                <label className="block text-xs font-semibold mb-1 text-gray-700 ml-1 sm:ml-2">To</label>
                <DatePicker selected={dateTo} onChange={setDateTo}
                  minDate={dateFrom}
                  placeholderText="End Date"
                  className="w-full px-3 py-2 rounded-lg border border-orange-300 text-center sm:text-left text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  dateFormat="dd/MM/yyyy"
                  isClearable
                />
              </div>
            </div>
          </form>
        </div>

        {/* Metrics Summary */}
        <div className="max-w-7xl mx-auto px-6 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-orange-100 shadow flex items-center px-4 py-4 gap-5">
              <span className="inline-flex items-center justify-center w-9 h-9 bg-orange-100 rounded-lg"><span className="text-orange-500 text-xl font-bold">₹</span></span>
              <div>
                <div className="text-sm text-gray-600 font-semibold">Total COD Held</div>
                <div className="text-xl font-bold text-gray-900">₹{summary.totalCODHeld.toLocaleString()}</div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-orange-100 shadow flex items-center px-4 py-4 gap-5">
              <span className="inline-flex items-center justify-center w-9 h-9 bg-rose-100 rounded-lg"><AlertTriangle size={22} className="text-rose-500" /></span>
              <div>
                <div className="text-sm text-gray-600 font-semibold">Agents Exceeded COD</div>
                <div className="text-xl font-bold text-gray-900">{summary.agentsExceededCOD} Agents</div>
              </div>
            </div>
          </div>
        </div>

        {/* COD Agent Table */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="bg-white rounded-xl border border-orange-100 shadow-lg overflow-x-auto">
            {loading && <div className="p-12 text-center text-gray-500">Loading...</div>}
            {error && <div className="p-12 text-center text-rose-500">{error}</div>}
            {!loading && !error && (
              <table className="w-full min-w-[900px] text-base">
                <thead className="bg-gradient-to-r from-orange-50 to-orange-100">
                  <tr className="text-left font-semibold text-gray-700 uppercase text-xs">
                    <th className="px-4 py-3">Agent</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">COD Limit</th>
                    <th className="px-4 py-3">Current Holding</th>
                    <th className="px-4 py-3">Daily Collected</th>
                    <th className="px-4 py-3">Last Submitted</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <User size={40} className="text-gray-300 mb-3" />
                          <h3 className="text-lg font-semibold">No Agents Found</h3>
                          <div className="text-sm">Try changing your filter/search criteria</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    agents.map(agent => (
                      <tr key={agent.id} className="hover:bg-orange-50 transition-colors font-medium">
                        <td className="px-4 py-3 flex items-center gap-2 text-gray-900">
                          <User size={15} className="text-orange-500" /> {agent.fullName}
                        </td>
                        <td className="px-4 py-3">{agent.phone}</td>
                        <td className="px-4 py-3">₹{agent.codLimit}</td>
                        <td className={`px-4 py-3 flex items-center ${holdingColor(agent.currentHolding, agent.codLimit)}`}>
                          ₹{agent.currentHolding}
                          <span className="ml-1">
                            {agent.currentHolding > agent.codLimit
                              ? <span role="img" aria-label="Exceeded">🔴</span>
                              : <span role="img" aria-label="OK">🟢</span>}
                          </span>
                        </td>
                        <td className="px-4 py-3">₹{agent.dailyCollected}</td>
                        <td className="px-4 py-3">{formatToReadableIST(agent.lastSubmitted)}</td>
                        <td className="px-4 py-3">{statusBadge(agent.status)}</td>
                        <td className="px-4 py-3">
                          <button className="px-2 py-1 rounded bg-orange-50 hover:bg-orange-200 border border-orange-200 text-orange-700 font-semibold flex items-center gap-1"
                            onClick={() => openEdit(agent)}>
                            <Pencil size={15} /> Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
            {/* Pagination Controls */}
            <PaginationControls />
          </div>
        </div>
      </div>

      {/* --- Edit Modal --- */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-3">
          <form
            onSubmit={submitEdit}
            className="bg-white max-w-lg w-full rounded-xl shadow-2xl border border-orange-100 px-8 py-8 relative"
            style={{ minWidth: 340 }}>
            <button type="button" onClick={() => setEditModal(null)} className="absolute right-4 top-4 text-gray-400 hover:text-orange-500"><XCircle size={22} /></button>
            <div className="mb-5 flex items-center gap-2">
              <Pencil size={21} className="text-orange-500" />
              <h2 className="font-bold text-xl">Edit COD Limit</h2>
            </div>
            <div className="text-base mb-2 flex flex-wrap gap-x-5 gap-y-2">
              <span className="inline-flex items-center gap-1 text-gray-800"><User size={15} className="text-orange-500" /> <span className="font-semibold">{editModal.fullName}</span> ({editModal.phone})</span>
              <span className="inline-block ml-2 text-orange-700">Current COD Limit: ₹{editModal.codLimit}</span>
              <span className={holdingColor(editModal.currentHolding, editModal.codLimit)}>Holding: ₹{editModal.currentHolding}</span>
            </div>
            {editError && (
              <div className="text-sm text-rose-600 mb-4">{editError}</div>
            )}
            <div className="grid gap-5 mt-6">
              <div>
                <label className="block text-xs font-semibold mb-1">New COD Limit</label>
                <input type="number" name="codLimit" min="0" value={editForm.codLimit}
                  onChange={e => setEditForm(f => ({ ...f, codLimit: e.target.value }))}
                  className="w-full px-4 py-2 border border-orange-300 rounded-lg text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="₹ Amount"
                />
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setEditModal(null)}
                  className="px-5 py-2 text-gray-500 bg-gray-100 border rounded-lg text-sm font-semibold hover:bg-gray-200 flex items-center gap-2">
                  <X size={16} /> Cancel
                </button>
                <button type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-semibold hover:from-orange-600 hover:to-orange-700 flex items-center gap-2">
                  <Check size={16} /> Submit
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
}