import React, { useState, useEffect } from 'react';
import { 
  Eye, FileText, User, ChevronRight, X, Check, 
  ChevronLeft, Phone, Search, Filter, Package, RefreshCw, AlertCircle 
} from 'lucide-react';
import axios from 'axios';
import apiClient from '../../apis/apiClient/apiClient';
import { toast } from 'react-toastify';

const AgentKYCApproval = () => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [showDocumentModal, setShowDocumentModal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const recordsPerPage = 10;
  const [allAgents, setAllAgents] = useState([]);

  // Fetch agents from API
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/admin/agent/getAll', {
          params: {
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
            search: searchText || undefined
          }
        });
        
        // Map the API response to the expected format
        setAllAgents(response.data.agents.map(agent => ({
          id: agent.id || agent._id,
          name: agent.name || agent.email,
          phoneNumber: agent.phone || 'Not provided',
          email: agent.email,
          phone: agent.phone,
          status: agent.status || 'pending',
          documents: {
            license: agent.documents?.license || null,
            insurance: agent.documents?.insurance || null,
            rcBook: agent.documents?.rcBook || null,
            pollutionCertificate: agent.documents?.pollutionCertificate || null,
            submittedAt: agent.documents?.submittedAt || null
          },
          createdAt: agent.createdAt,
          updatedAt: agent.updatedAt,
          approvedAt: agent.approvedAt,
          rejectedAt: agent.rejectedAt,
          approvedBy: agent.approvedBy,
          rejectedBy: agent.rejectedBy,
          rejectionReason: agent.rejectionReason
        })));
      } catch (err) {
        console.error('Error fetching agents:', err);
        setError(err.response?.data?.message || 'Failed to fetch agents');
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [searchText, selectedStatus]);

  // Filter agents based on search and status
  const filteredAgents = allAgents.filter(agent => {
    const matchesSearch = searchText === '' || 
      agent.name.toLowerCase().includes(searchText.toLowerCase()) ||
      agent.phoneNumber.includes(searchText) ||
      agent.email.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || agent.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredAgents.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentAgents = filteredAgents.slice(indexOfFirstRecord, indexOfLastRecord);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, selectedStatus]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const getStatusBadge = (status) => {
    const configs = {
      pending: { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-800',
        label: 'Pending' 
      },
      approved: { 
        bg: 'bg-green-100', 
        text: 'text-green-800',
        label: 'Approved' 
      },
      rejected: { 
        bg: 'bg-red-100', 
        text: 'text-red-800',
        label: 'Rejected' 
      }
    };
    const config = configs[status];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const handleApprove = async (agentId) => {
    try {
      await apiClient.patch(`/admin/agent/${agentId}/approve`);
      setAllAgents(prevAgents =>
        prevAgents.map(agent =>
          agent.id === agentId ? { ...agent, status: 'approved' } : agent
        )
      );
      toast.success('Agent approved successfully!');
      setSelectedAgent(null);
    } catch (err) {
      console.error('Error approving agent:', err);
      toast.error(err.response?.data?.message || 'Failed to approve agent');
    }
  };

  const handleReject = async (agentId) => {
    try {
      await apiClient.patch(`/admin/agent/${agentId}/reject`, { rejectionReason: remarks });
      setAllAgents(prevAgents =>
        prevAgents.map(agent =>
          agent.id === agentId ? { ...agent, status: 'rejected' } : agent
        )
      );
      toast.success('Agent rejected successfully!');
      setSelectedAgent(null);
      setRemarks('');
    } catch (err) {
      console.error('Error rejecting agent:', err);
      toast.error(err.response?.data?.message || 'Failed to reject agent');
    }
  };

  const DocumentModal = ({ doc, docType, agent, onClose }) => (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FileText size={18} className="text-orange-600" />
            {docType} - {agent?.name}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={18} className="text-gray-400" />
          </button>
        </div>
        <div className="p-6">
          {doc ? (
            <div className="text-center">
              <img 
                src={doc} 
                alt={`${docType} document`}
                className="mx-auto rounded-lg shadow-sm max-w-full h-auto border border-gray-200"
                style={{ maxHeight: '400px' }}
              />
              <p className="text-gray-700 font-medium mt-4">{docType}</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No {docType} document uploaded</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const ReviewModal = ({ agent, onClose }) => (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Package size={18} className="text-orange-600" />
            KYC Review - {agent.name}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Agent Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <User size={18} className="text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{agent.name}</h3>
                <p className="text-gray-600 flex items-center gap-1">
                  <Phone size={14} />
                  {agent.phone}
                </p>
              </div>
            </div>
            <div className="flex justify-start">
              {getStatusBadge(agent.status)}
            </div>
          </div>

          {/* Documents */}
          <div className="mb-6">
            <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText size={16} className="text-orange-600" />
              Vehicle Documents
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['license', 'insurance', 'rcBook', 'pollutionCertificate'].map((docType) => {
                const docConfig = {
                  license: { name: 'Driving License' },
                  insurance: { name: 'Insurance' },
                  rcBook: { name: 'RC Book' },
                  pollutionCertificate: { name: 'Pollution Certificate' }
                }[docType];
                
                return (
                  <div key={docType} className="bg-white border border-gray-200 rounded-lg p-3">
                    <h5 className="font-medium text-gray-800 mb-2">
                      {docConfig.name}
                    </h5>
                    <button
                      onClick={() => setShowDocumentModal({ 
                        doc: agent.documents[docType], 
                        type: docConfig.name, 
                        agent 
                      })}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        agent.documents[docType]
                          ? 'bg-orange-600 text-white hover:bg-orange-700'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!agent.documents[docType]}
                    >
                      {agent.documents[docType] ? 'View Document' : 'Not Uploaded'}
                    </button>
                  </div>
                );
              })}
            </div>

            {agent.documents.submittedAt && (
              <div className="text-xs text-gray-500 mt-3">
                Submitted on: {new Date(agent.documents.submittedAt).toLocaleString()}
              </div>
            )}
          </div>

          {/* Remarks */}
          {agent.status !== 'approved' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks {agent.status === 'rejected' ? '(Required)' : '(Optional)'}
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder={agent.status === 'pending' ? 'Enter notes...' : 'Enter rejection reason...'}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-600 resize-none"
                rows="3"
                required={agent.status === 'rejected'}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => handleReject(agent.id)}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
            >
              <X size={16} />
              {agent.status === 'approved' ? 'Revoke Approval' : 'Reject'}
            </button>
            {agent.status !== 'approved' && (
              <button
                onClick={() => handleApprove(agent.id)}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <Check size={16} />
                Approve
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm text-center border border-gray-200">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading KYC applications...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm text-center max-w-md border border-gray-200">
          <AlertCircle size={48} className="text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={16} />
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <Package size={26} className="text-orange-600" />
                Agent KYC Approvals
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Review and approve delivery partner applications
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center text-orange-600 hover:text-orange-700 font-medium gap-1"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-600"
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
          
          <div className="mt-4 text-sm text-gray-600">
            Found <span className="font-medium text-orange-600">{filteredAgents.length}</span> applications
            {searchText && <span> matching "{searchText}"</span>}
            {selectedStatus !== 'all' && <span> with {selectedStatus} status</span>}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-gray-600">
                  <th className="px-6 py-3 text-left font-medium">Agent</th>
                  <th className="px-6 py-3 text-left font-medium">Contact</th>
                  <th className="px-6 py-3 text-left font-medium">Documents</th>
                  <th className="px-6 py-3 text-left font-medium">Status</th>
                  <th className="px-6 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentAgents.length > 0 ? (
                  currentAgents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <User size={16} className="text-orange-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{agent.name}</div>
                            <div className="text-xs text-gray-500">ID: {agent.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="text-gray-700">{agent.phoneNumber}</div>
                        <div className="text-xs text-gray-500">{agent.email}</div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="space-y-1">
                          {Object.entries(agent.documents).map(([key, value]) => {
                            if (key !== 'submittedAt') {
                              return (
                                <div key={key} className="flex items-center text-xs">
                                  <span className={`w-2 h-2 rounded-full mr-2 ${value ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        {getStatusBadge(agent.status)}
                      </td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => setSelectedAgent(agent)}
                          className="bg-orange-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-orange-700 transition flex items-center gap-1"
                        >
                          {agent.status === 'approved' ? 'View' : 'Review'}
                          <ChevronRight size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <Package size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="font-medium">No applications found</p>
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
                  Showing <span className="font-medium">{indexOfFirstRecord + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastRecord, filteredAgents.length)}</span> of{' '}
                  <span className="font-medium">{filteredAgents.length}</span> results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevPage}
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
                    onClick={handleNextPage}
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

        {/* Modals */}
        {selectedAgent && (
          <ReviewModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
        )}

        {showDocumentModal && (
          <DocumentModal
            doc={showDocumentModal.doc}
            docType={showDocumentModal.type}
            agent={showDocumentModal.agent}
            onClose={() => setShowDocumentModal(null)}
          />
        )}
      </div>
    </div>
  );
};

export default AgentKYCApproval;
