import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaUserTimes, FaCalendarCheck, FaHistory, FaCheckCircle, FaClock, FaTimes, FaEye } from 'react-icons/fa';
import { getAgentDisciplinarySummary } from '../../apis/adminApis/agentApi'; // Import your API function
import { useParams } from 'react-router-dom';

const AgentWarningsApprovalsTerminationsDash = () => {
  const { agentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [disciplinaryData, setDisciplinaryData] = useState(null);

  // Fetch disciplinary data
  useEffect(() => {
    const fetchDisciplinaryData = async () => {
      try {
        setLoading(true);
        const response = await getAgentDisciplinarySummary(agentId);
        
        if (response.success) {
          setDisciplinaryData(response.data);
        } else {
          setError(response.message || 'Failed to fetch disciplinary data');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    if (agentId) {
      fetchDisciplinaryData();
    }
  }, [agentId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading disciplinary data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Error Loading Data</h3>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!disciplinaryData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Data Available</h3>
          <p className="text-gray-600">No disciplinary data found for this agent.</p>
        </div>
      </div>
    );
  }

  const { 
    agentName, 
    phoneNumber, 
    email, 
    joinDate, 
    activeMonitoring, 
    warnings, 
    leaves, 
    termination 
  } = disciplinaryData;

  const getSeverityColor = (severity) => {
    const colors = {
      'critical': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
      'major': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
      'minor': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
      'High': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
      'Medium': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
      'Low': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    };
    return colors[severity] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
      'Approved': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
      'Processed': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
      'Rejected': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    };
    return colors[status] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Pending': FaClock,
      'Approved': FaCheckCircle,
      'Processed': FaCheckCircle,
      'Rejected': FaTimes,
    };
    return icons[status] || FaClock;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="w-full mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-orange-600/10 rounded-full transform translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-orange-400/10 to-orange-600/10 rounded-full transform -translate-x-12 translate-y-12"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-orange-400 to-orange-600 p-4 rounded-2xl shadow-lg">
                    <FaExclamationTriangle className="text-white text-2xl" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                      {agentName}'s Disciplinary Record
                    </h1>
                    <p className="text-gray-600 text-base md:text-lg">
                      Track disciplinary actions, approvals, and employment history
                    </p>
                  </div>
                </div>
                <div className="hidden md:flex items-center space-x-2 bg-orange-100 px-4 py-2 rounded-full">
                  <FaExclamationTriangle className="text-orange-600 text-sm" />
                  <span className="text-orange-700 font-semibold text-sm">Active Monitoring</span>
                </div>
              </div>
              
              {/* Agent Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-medium">{phoneNumber}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium">{email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">Join Date:</span>
                  <span className="font-medium">{formatDate(joinDate)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-100/50 rounded-full transform translate-x-8 -translate-y-8"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-100 p-3 rounded-xl">
                  <FaExclamationTriangle className="text-orange-600 text-lg" />
                </div>
                <span className="text-2xl font-bold text-gray-800">{activeMonitoring.totalWarnings}</span>
              </div>
              <h3 className="text-gray-700 font-medium">Total Warnings</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-100/50 rounded-full transform translate-x-8 -translate-y-8"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-100 p-3 rounded-xl">
                  <FaCalendarCheck className="text-orange-600 text-lg" />
                </div>
                <span className="text-2xl font-bold text-gray-800">{activeMonitoring.totalApprovals}</span>
              </div>
              <h3 className="text-gray-700 font-medium">Total Approvals</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-100/50 rounded-full transform translate-x-8 -translate-y-8"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-100 p-3 rounded-xl">
                  <FaClock className="text-orange-600 text-lg" />
                </div>
                <span className="text-2xl font-bold text-gray-800">{activeMonitoring.pendingApprovals}</span>
              </div>
              <h3 className="text-gray-700 font-medium">Pending Approvals</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-100/50 rounded-full transform translate-x-8 -translate-y-8"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-100 p-3 rounded-xl">
                  <FaUserTimes className="text-orange-600 text-lg" />
                </div>
                <span className="text-2xl font-bold text-gray-800">{activeMonitoring.terminations}</span>
              </div>
              <h3 className="text-gray-700 font-medium">Terminations</h3>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Warnings Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-orange-400 to-orange-600 p-3 rounded-xl">
                <FaExclamationTriangle className="text-white text-lg" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Warning History</h2>
            </div>

            <div className="space-y-4">
              {warnings && warnings.length > 0 ? (
                warnings.map((warning, index) => {
                  const severityColor = getSeverityColor(warning.severity);
                  return (
                    <div key={index} className="group border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-12 h-12 bg-orange-50 rounded-full transform translate-x-6 -translate-y-6 group-hover:scale-150 transition-transform duration-700"></div>
                      
                      <div className="relative">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <p className="text-gray-800 font-medium mb-2">{warning.reason}</p>
                            <p className="text-sm text-gray-600">{formatDate(warning.issuedAt)}</p>
                          </div>
                          <div className={`${severityColor.bg} ${severityColor.border} border px-3 py-1 rounded-full`}>
                            <span className={`${severityColor.text} font-semibold text-xs capitalize`}>
                              {warning.severity}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <button className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-2 rounded-full transition-all duration-300">
                            <FaEye className="text-sm" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-orange-400 to-orange-600 group-hover:w-full transition-all duration-500"></div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaCheckCircle className="text-green-600 text-2xl" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-600 mb-2">No Warnings</h3>
                  <p className="text-gray-500">This agent has a clean warning record.</p>
                </div>
              )}
            </div>
          </div>

          {/* Leaves Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-orange-400 to-orange-600 p-3 rounded-xl">
                <FaCalendarCheck className="text-white text-lg" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Leave History</h2>
            </div>

            <div className="space-y-4">
              {leaves && leaves.length > 0 ? (
                leaves.map((leave, index) => {
                  const statusColor = getStatusColor(leave.status);
                  const StatusIcon = getStatusIcon(leave.status);
                  return (
                    <div key={index} className="group border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-12 h-12 bg-orange-50 rounded-full transform translate-x-6 -translate-y-6 group-hover:scale-150 transition-transform duration-700"></div>
                      
                      <div className="relative">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <p className="text-gray-800 font-medium mb-1 capitalize">{leave.leaveType}</p>
                            <p className="text-sm text-gray-600 mb-1">{leave.reason || 'No reason provided'}</p>
                            <p className="text-sm text-gray-600">
                              {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                            </p>
                          </div>
                          <div className={`${statusColor.bg} ${statusColor.border} border px-3 py-1 rounded-full flex items-center space-x-2`}>
                            <StatusIcon className={`${statusColor.text} text-xs`} />
                            <span className={`${statusColor.text} font-semibold text-xs`}>{leave.status}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <button className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-2 rounded-full transition-all duration-300">
                            <FaEye className="text-sm" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-orange-400 to-orange-600 group-hover:w-full transition-all duration-500"></div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaCheckCircle className="text-green-600 text-2xl" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-600 mb-2">No Leave Records</h3>
                  <p className="text-gray-500">This agent has no leave history.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Termination History Section */}
        <div className="mt-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-orange-400 to-orange-600 p-3 rounded-xl">
                <FaHistory className="text-white text-lg" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Termination History</h2>
            </div>

            {termination.terminated ? (
              <div className="space-y-4">
                <div className="group border border-red-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 relative overflow-hidden bg-red-50">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-red-100 rounded-full transform translate-x-6 -translate-y-6 group-hover:scale-150 transition-transform duration-700"></div>
                  
                  <div className="relative">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <p className="text-red-800 font-medium mb-2">Termination Record</p>
                        <p className="text-sm text-red-600 mb-1">
                          <strong>Reason:</strong> {termination.reason}
                        </p>
                        <p className="text-sm text-red-600">
                          <strong>Terminated on:</strong> {formatDate(termination.terminatedAt)}
                        </p>
                      </div>
                      <div className="bg-red-100 border border-red-200 px-3 py-1 rounded-full">
                        <span className="text-red-700 font-semibold text-xs">TERMINATED</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button className="text-red-600 hover:text-red-700 hover:bg-red-100 p-2 rounded-full transition-all duration-300">
                        <FaEye className="text-sm" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-red-400 to-red-600 group-hover:w-full transition-all duration-500"></div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheckCircle className="text-green-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-600 mb-2">No Termination History</h3>
                <p className="text-gray-500">{termination.message}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentWarningsApprovalsTerminationsDash;