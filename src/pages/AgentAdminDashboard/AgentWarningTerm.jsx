import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import apiClient from '../../apis/apiClient/apiClient';
import { toast } from 'react-toastify';

const AgentWarningTerm = () => {
  // State management
  const [allAgents, setAllAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('warnings');

  // Form states - changed severity default to lowercase
  const [warningReason, setWarningReason] = useState('');
  const [severity, setSeverity] = useState('minor');
  const [terminateReason, setTerminateReason] = useState('');
  const [terminateDate, setTerminateDate] = useState(new Date());

  /* ------------------------- data fetching ------------------------- */
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/admin/agent/getAll');
        setAllAgents(res.data.agents);
        if (res.data.agents.length) setSelectedAgentId(res.data.agents[0].id);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to fetch agents');
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  useEffect(() => {
    if (selectedAgentId) {
      const agent = allAgents.find(a => a.id === selectedAgentId);
      setCurrentAgent(agent);
      setWarnings(agent?.warnings || []);
    }
  }, [selectedAgentId, allAgents]);

  /* ------------------------- handlers ------------------------- */
const addWarning = async () => {
  if (!warningReason || !selectedAgentId) {
    toast.error('Please enter a warning reason');
    return;
  }
  try {
    const response = await apiClient.post(
      `/admin/agent/${selectedAgentId}/give-warning`,
      { reason: warningReason, severity }
    );



    
    const updatedAgent = response.data.agent; // the full agent with new warning

    
setAllAgents(prevAgents =>
      prevAgents.map(a =>
        a.id === selectedAgentId
          ? { ...a, warnings: updatedAgent.warnings } // update only warnings array
          : a
      )
    );
    setWarningReason('');
    toast.success('Warning issued successfully');
  } catch (err) {
    console.log(err);
    toast.error(err.response?.data?.message || 'Failed to issue warning');
  }
};


  const terminateAgent = async () => {
    if (!terminateReason || !selectedAgentId) {
      toast.error('Please enter a termination reason');
      return;
    }
    try {
      const toastId = toast.loading('Processing termination...');
      const { data } = await apiClient.post(
        `/admin/agent/${selectedAgentId}/terminate`,
        {
          reason: terminateReason,
          letter: `Termination letter for ${currentAgent?.name}`,
          terminationDate: terminateDate
        }
      );
      setAllAgents(allAgents.map(a => (a.id === selectedAgentId ? data.agent : a)));
      setTerminateReason('');
      toast.success('Agent terminated successfully', { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to terminate agent');
    }
  };

  const deleteWarning = async (warningId) => {
    try {
      const toastId = toast.loading('Removing warning...');
      await apiClient.delete(`/admin/agent/${selectedAgentId}/warnings/${warningId}`);
      setWarnings(warnings.filter(w => w.id !== warningId));
      toast.success('Warning removed successfully', { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove warning');
    }
  };

  /* ------------------------- UI helpers ------------------------- */
  const getSeverityBadge = (sev = 'minor') => {
    const key = sev.toLowerCase();
    const cfg = {
      minor:    { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-400' },
      major:    { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
      critical: { bg: 'bg-red-100',   text: 'text-red-800',   dot: 'bg-red-500'    }
    }[key] || cfg.minor;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
        <span className={`w-2 h-2 mr-2 rounded-full ${cfg.dot}`}></span>
        {key.charAt(0).toUpperCase() + key.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (status) =>
    status === 'terminated' ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
        Terminated
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        Active
      </span>
    );

  const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-orange-600 focus:outline-none"
    >
      {value}
    </button>
  ));

  // SVG Icons
  const UserIcon = () => (
    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const AlertIcon = () => (
    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );

  const BanIcon = () => (
    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  );

  const PlusIcon = () => (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  );

  const RotateIcon = () => (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );

  const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );

  /* ------------------------- render ------------------------- */
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          {/* ---------- Header ---------- */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-8 py-6 border-b border-orange-200">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <UserIcon />
              Agent Warning & Termination Management
            </h1>
            <p className="text-gray-600 mt-1">Manage agent warnings and termination processes</p>
          </div>

          <div className="p-8">
            {/* ---------- Agent selection ---------- */}
            <div className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Agent
              </label>
              <select
                value={selectedAgentId || ''}
                onChange={e => setSelectedAgentId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {allAgents.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.email}) {a.termination?.terminated ? '(Terminated)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* ---------- Agent info card ---------- */}
            {currentAgent && (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white border border-gray-200 rounded-lg p-5 mb-8 shadow-sm">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold text-gray-800">{currentAgent.name}</h2>
                    {getStatusBadge(currentAgent.termination?.terminated ? 'terminated' : 'active')}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <p className="text-gray-600"><span className="font-medium">Email:</span> {currentAgent.email}</p>
                    <p className="text-gray-600"><span className="font-medium">Phone:</span> {currentAgent.phone || 'N/A'}</p>
                    <p className="text-gray-600"><span className="font-medium">Warnings:</span> {warnings.length}</p>
                    {currentAgent.termination?.terminated && (
                      <p className="text-red-600">
                        <span className="font-medium">Terminated on:</span> {new Date(currentAgent.termination.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                
                {!currentAgent.termination?.terminated && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setActiveTab('warnings')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'warnings' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}
                    >
                      Issue Warning
                    </button>
                    <button 
                      onClick={() => setActiveTab('termination')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'termination' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}
                    >
                      Terminate
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* ---------- Warning history ---------- */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <AlertIcon />
                  Warning History
                  <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full ml-2">
                    {warnings.length}
                  </span>
                </h3>
                
                {warnings.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {warnings.map(w => (
                      <div key={w.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-sm text-gray-500">
                            {new Date(w.issuedAt).toLocaleDateString()} at {new Date(w.issuedAt).toLocaleTimeString()}
                          </div>
                          <button 
                            onClick={() => deleteWarning(w.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            title="Delete warning"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                        <p className="text-gray-800 mb-2">{w.reason}</p>
                        <div className="flex justify-between items-center">
                          {getSeverityBadge(w.severity)}
                          <span className="text-xs text-gray-500">By: {w.issuedBy?.name || 'System'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    No warnings issued yet
                  </div>
                )}
              </div>

              {/* ---------- Action panel ---------- */}
              <div className="space-y-6">
                {/* Issue warning form */}
                {activeTab === 'warnings' && !currentAgent?.termination?.terminated && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <AlertIcon />
                      Issue New Warning
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Warning Reason
                        </label>
                        <textarea
                          value={warningReason}
                          onChange={e => setWarningReason(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Provide detailed reason for this warning..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Severity Level
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => setSeverity('minor')}
                            className={`py-2 rounded-lg text-sm font-medium ${severity === 'minor' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 'bg-gray-100 text-gray-700'}`}
                          >
                            Minor
                          </button>
                          <button
                            onClick={() => setSeverity('major')}
                            className={`py-2 rounded-lg text-sm font-medium ${severity === 'major' ? 'bg-orange-100 text-orange-800 border border-orange-300' : 'bg-gray-100 text-gray-700'}`}
                          >
                            Major
                          </button>
                          <button
                            onClick={() => setSeverity('critical')}
                            className={`py-2 rounded-lg text-sm font-medium ${severity === 'critical' ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-gray-100 text-gray-700'}`}
                          >
                            Critical
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={addWarning}
                        disabled={!warningReason || loading}
                        className={`w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center ${
                          !warningReason || loading
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-orange-600 text-white hover:bg-orange-700'
                        }`}
                      >
                        <PlusIcon />
                        Issue Warning
                      </button>
                    </div>
                  </div>
                )}

                {/* Termination form */}
                {activeTab === 'termination' && !currentAgent?.termination?.terminated && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <BanIcon />
                      Terminate Agent
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Termination Date
                        </label>
                        <DatePicker
                          selected={terminateDate}
                          onChange={setTerminateDate}
                          minDate={new Date()}
                          customInput={<CustomDateInput />}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Termination Reason
                        </label>
                        <textarea
                          value={terminateReason}
                          onChange={e => setTerminateReason(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="Provide detailed reason for termination..."
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={terminateAgent}
                          disabled={!terminateReason || loading}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${
                            !terminateReason || loading
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-red-600 text-white hover:bg-red-700'
                          }`}
                        >
                          Terminate Agent
                        </button>
                        <button
                          onClick={() => {
                            setTerminateReason('');
                            setTerminateDate(new Date());
                          }}
                          className="px-4 py-2.5 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <RotateIcon />
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Termination notice */}
                {currentAgent?.termination?.terminated && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <BanIcon />
                      Agent Termination Notice
                    </h3>
                    <div className="space-y-3">
                      <p className="text-red-700 font-medium">This agent has been terminated.</p>
                      <p className="text-gray-700"><span className="font-medium">Termination Date:</span> {new Date(currentAgent.termination.date).toLocaleDateString()}</p>
                      <p className="text-gray-700"><span className="font-medium">Reason:</span> {currentAgent.termination.reason}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentWarningTerm;