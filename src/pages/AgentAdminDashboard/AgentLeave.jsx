import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Search,
  Filter,
  Calendar,
  User,
  ChevronRight,
  X,
  Check,
  ChevronLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import axios from "axios";
import apiClient from "../../apis/apiClient/apiClient";
import { toast } from "react-toastify";

const AgentLeave = () => {
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const recordsPerPage = 10;

  // State for leave requests
  const [allLeaves, setAllLeaves] = useState([]);

  // Fetch leave requests from API
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/admin/agent/leaves', {
          params: {
            status: selectedStatus === 'all' ? 'all' : selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)
          }
        });
        
        const transformedLeaves = response.data.map(item => ({
          id: item.leaves._id,
          agentId: item._id,
          agentName: item.fullName,
          leaveDates: `${new Date(item.leaves.leaveStartDate).toLocaleDateString()} – ${new Date(item.leaves.leaveEndDate).toLocaleDateString()}`,
          startDate: item.leaves.leaveStartDate,
          endDate: item.leaves.leaveEndDate,
          type: item.leaves.leaveType,
          reason: item.leaves.reason,
          status: item.leaves.status.toLowerCase(),
          rejectionReason: item.leaves.rejectionReason || null,
          reviewedBy: item.leaves.reviewedBy || null,
          reviewedAt: item.leaves.reviewedAt || null,
          appliedAt: item.leaves.appliedAt
        }));
        
        setAllLeaves(transformedLeaves);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, []);

  // Update status helper
  const updateStatus = async (leaveId, newStatus, reason = null, agentId) => {
    try {
      const toastId = toast.loading(`Updating leave to ${newStatus}...`);
      
      const response = await apiClient.post(
        `/admin/agent/${agentId}/leaves/${leaveId}/decision`,
        {
          decision: newStatus.charAt(0).toUpperCase() + newStatus.slice(1),
          ...(newStatus.toLowerCase() === "rejected" && {
            rejectionReason: reason,
          }),
        }
      );

      setAllLeaves((prev) =>
        prev.map((leave) =>
          leave.id === leaveId
            ? {
                ...leave,
                status: newStatus.toLowerCase(),
                rejectionReason: reason,
                reviewedAt: new Date().toISOString(),
              }
            : leave
        )
      );

      toast.success(`Leave ${newStatus} successfully`, {
        id: toastId,
        duration: 4000,
      });

    } catch (err) {
      console.error("Failed to update leave status:", err);
      
      toast.error(
        `Failed to ${newStatus} leave: ${err.response?.data?.message || err.message}`,
        {
          duration: 5000,
        }
      );
    }
  };

  const handleApprove = (leaveId, agentId) =>
    updateStatus(leaveId, "approved", null, agentId);
  const handleRevoke = (id) => updateStatus(id, "pending");
  const handleFilterChange = () => setCurrentPage(1);

  // Filtering
  const filtered = allLeaves.filter((l) => {
    const matchName =
      searchText === "" ||
      l.agentName.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = selectedStatus === "all" || l.status === selectedStatus;
    let matchDate = true;
    if (fromDate && toDate) {
      const s = new Date(l.startDate);
      matchDate = s >= fromDate && s <= toDate;
    }
    return matchName && matchStatus && matchDate;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / recordsPerPage);
  const start = (currentPage - 1) * recordsPerPage;
  const current = filtered.slice(start, start + recordsPerPage);

  useEffect(handleFilterChange, [searchText, selectedStatus, fromDate, toDate]);

  // Badge helpers
  const statusBadge = (status) => {
    const cfg = {
      pending: { icon: Clock, bg: "bg-yellow-100", fg: "text-yellow-800", label: "Pending" },
      approved: { icon: CheckCircle, bg: "bg-green-100", fg: "text-green-800", label: "Approved" },
      rejected: { icon: XCircle, bg: "bg-red-100", fg: "text-red-800", label: "Rejected" },
    }[status];
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.fg}`}>
        <Icon size={12} className="mr-1" />
        {cfg.label}
      </span>
    );
  };

  const leaveTypeBadge = (type) => {
    const cfg = {
      "Sick Leave": { bg: "bg-red-100", fg: "text-red-700" },
      Personal: { bg: "bg-blue-100", fg: "text-blue-700" },
      Emergency: { bg: "bg-orange-100", fg: "text-orange-700" },
      Vacation: { bg: "bg-green-100", fg: "text-green-700" },
    }[type] || { bg: "bg-gray-100", fg: "text-gray-700" };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${cfg.bg} ${cfg.fg}`}>
        {type}
      </span>
    );
  };

  // Custom date input
  const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
    <input
      ref={ref}
      onClick={onClick}
      value={value}
      readOnly
      placeholder="Select date"
      className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-orange-600 focus:outline-none cursor-pointer"
    />
  ));

  // Reject modal
  const RejectModal = ({ leave, onClose }) => {
    const [reason, setReason] = useState("");
    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-600" />
              Reject Leave Request
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X size={18} className="text-gray-400" />
            </button>
          </div>
          <div className="p-6">
            <div className="mb-4 space-y-2">
              <div><strong>Agent:</strong> {leave.agentName}</div>
              <div><strong>Dates:</strong> {leave.leaveDates}</div>
              <div><strong>Type:</strong> {leaveTypeBadge(leave.type)}</div>
              <div><strong>Reason:</strong></div>
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                {leave.reason}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-600 resize-none"
                rows="4"
                placeholder="Enter rejection reason..."
              />
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              disabled={!reason.trim()}
              onClick={() => {
                updateStatus(leave.id, "rejected", reason.trim(), leave.agentId);
                onClose();
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                reason.trim()
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm text-center border border-gray-200">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading leave requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm text-center max-w-md border border-gray-200">
          <XCircle size={48} className="text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <Calendar size={26} className="text-orange-600" />
            Leave Management
          </h1>
          <p className="text-gray-600 text-sm mt-1">Manage agent leave requests</p>
        </div>

        {/* Filters */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search agent..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-600"
              />
            </div>

            {/* From Date */}
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
              <DatePicker
                selected={fromDate}
                onChange={(date) => setFromDate(date)}
                customInput={<CustomDateInput />}
                dateFormat="dd/MM/yyyy"
                isClearable
                placeholderText="From Date"
              />
            </div>

            {/* To Date */}
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
              <DatePicker
                selected={toDate}
                onChange={(date) => setToDate(date)}
                customInput={<CustomDateInput />}
                dateFormat="dd/MM/yyyy"
                isClearable
                placeholderText="To Date"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-600 bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Found <span className="font-medium text-orange-600">{filtered.length}</span> leave requests
            {searchText && <span> matching "{searchText}"</span>}
            {selectedStatus !== "all" && <span> with {selectedStatus} status</span>}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-gray-600">
                  <th className="px-6 py-3 text-left font-medium">Agent Name</th>
                  <th className="px-6 py-3 text-left font-medium">Leave Dates</th>
                  <th className="px-6 py-3 text-left font-medium">Type</th>
                  <th className="px-6 py-3 text-left font-medium">Reason</th>
                  <th className="px-6 py-3 text-left font-medium">Status</th>
                  <th className="px-6 py-3 text-left font-medium">Rejection Reason</th>
                  <th className="px-6 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {current.length ? (
                  current.map((leave) => (
                    <tr key={leave.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <User size={14} className="text-orange-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{leave.agentName}</div>
                            <div className="text-xs text-gray-500">Agent</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-gray-700">{leave.leaveDates}</td>
                      <td className="px-6 py-3">{leaveTypeBadge(leave.type)}</td>
                      <td className="px-6 py-3 text-gray-600 max-w-xs truncate">{leave.reason}</td>
                      <td className="px-6 py-3">{statusBadge(leave.status)}</td>
                      <td className="px-6 py-3 text-gray-600 max-w-xs truncate">
                        {leave.rejectionReason || "-"}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(leave.id, leave.agentId)}
                            className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 flex items-center gap-1"
                          >
                            <Check size={12} />
                            Approve
                          </button>
                          <button
                            onClick={() => setShowRejectModal(leave)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 flex items-center gap-1"
                          >
                            <X size={12} />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="font-medium">No leave requests found</p>
                      <p className="text-sm">Try adjusting your search criteria</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-medium">{start + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(start + recordsPerPage, filtered.length)}</span> of{" "}
                  <span className="font-medium">{filtered.length}</span> results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded text-sm font-medium flex items-center gap-1 ${
                      currentPage === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-orange-600 text-white hover:bg-orange-700"
                    }`}
                  >
                    <ChevronLeft size={14} />
                    Previous
                  </button>

                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`w-8 h-8 rounded text-sm font-medium ${
                          currentPage === index + 1
                            ? "bg-orange-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded text-sm font-medium flex items-center gap-1 ${
                      currentPage === totalPages
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-orange-600 text-white hover:bg-orange-700"
                    }`}
                  >
                    Next
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reject Modal */}
        {showRejectModal && (
          <RejectModal
            leave={showRejectModal}
            onClose={() => setShowRejectModal(null)}
          />
        )}
      </div>
    </div>
  );
};

export default AgentLeave;
