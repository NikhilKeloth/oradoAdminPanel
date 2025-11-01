import React, { useState, useEffect } from 'react';
import { User, Search, RefreshCw, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import apiClient from '../../apis/apiClient/apiClient';
import { toast } from 'react-toastify';

import { Link } from 'react-router-dom';

export default function AgentList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch agents from API
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/admin/agent/getAll');
        console.log('Fetched agents:', res.data);
        setAgents(res.data.agents || res.data);
      } catch (err) {
        console.error('Error fetching agents:', err);
        setError(err.response?.data?.message || 'Failed to fetch agents');
        toast.error('Failed to load agents');
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  // Filter agents based on search term
  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.phone.includes(searchTerm)
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAgents.slice(indexOfFirstItem, indexOfLastItem);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Get status badge
  const getStatusBadge = (status) => {
    const config = {
      approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
    }[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Pagination controls
  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Retry function
  const handleRetry = () => {
    window.location.reload();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm text-center border border-gray-200">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading agents...</p>
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
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Agents</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
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
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <User size={26} className="text-orange-600" />
            Delivery Agents
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage and view all delivery agents
          </p>
        </div>

        {/* Search */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 mb-6">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-600"
            />
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Found <span className="font-medium text-orange-600">{filteredAgents.length}</span> agents
            {totalPages > 1 && (
              <span> • Page {currentPage} of {totalPages}</span>
            )}
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-gray-600">
                  <th className="px-6 py-3 text-left font-medium">Agent</th>
                  <th className="px-6 py-3 text-left font-medium">Contact</th>
                  <th className="px-6 py-3 text-left font-medium">Status</th>
                  <th className="px-6 py-3 text-left font-medium">Warnings</th>
                  <th className="px-6 py-3 text-left font-medium">Termination</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentItems.length > 0 ? (
                  currentItems.map((agent) => (
                    <tr 
                      key={agent.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      
                    >

                      
                      <td className="px-6 py-3">

                          <Link 
      to={`/admin/agent-slider/agent/details/${agent.id}`}
      >  
      
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <User size={16} className="text-orange-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{agent.name}</div>
                            <div className="text-xs text-gray-500">ID: {agent.id}</div>
                          </div>
                        </div>


                        </Link>
                      </td>
                      <td className="px-6 py-3">
                        <div className="text-gray-700">{agent.phone}</div>
                        <div className="text-xs text-gray-500">{agent.email}</div>
                      </td>
                      <td className="px-6 py-3">
                        {getStatusBadge(agent.status)}
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-gray-600">
                          {agent.warnings?.length || 0} warnings
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          agent.termination?.terminated 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {agent.termination?.terminated ? 'Terminated' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <User size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="font-medium">No agents found</p>
                      <p className="text-sm">Try adjusting your search criteria</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Desktop Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(indexOfLastItem, filteredAgents.length)}</span> of{" "}
                  <span className="font-medium">{filteredAgents.length}</span> results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPrevPage}
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
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 rounded text-sm font-medium ${
                          currentPage === page
                            ? "bg-orange-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={goToNextPage}
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

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {currentItems.length > 0 ? (
            currentItems.map((agent) => (
              <div
                key={agent.id}
                className="bg-white shadow-sm border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => window.location.href = `/admin/agent-dashboard/agent/details`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <User size={18} className="text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{agent.name}</h3>
                      <p className="text-sm text-gray-500">ID: {agent.id}</p>
                    </div>
                  </div>
                  {getStatusBadge(agent.status)}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone:</span>
                    <span className="text-gray-700">{agent.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email:</span>
                    <span className="text-gray-700 truncate ml-2">{agent.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Warnings:</span>
                    <span className="text-gray-700">{agent.warnings?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      agent.termination?.terminated 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {agent.termination?.terminated ? 'Terminated' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-12 text-center">
              <User size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="font-medium text-gray-500">No agents found</p>
              <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
            </div>
          )}

          {/* Mobile Pagination */}
          {totalPages > 1 && (
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Page <span className="font-medium">{currentPage}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded text-sm font-medium flex items-center gap-1 ${
                      currentPage === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-orange-600 text-white hover:bg-orange-700"
                    }`}
                  >
                    <ChevronLeft size={14} />
                    Prev
                  </button>

                  <div className="text-sm text-gray-600">
                    {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredAgents.length)} of {filteredAgents.length}
                  </div>

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded text-sm font-medium flex items-center gap-1 ${
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
      </div>
    </div>
  );
}
