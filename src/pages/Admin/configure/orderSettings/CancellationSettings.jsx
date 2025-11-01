import { useState } from 'react';

const CancellationPolicyPage = () => {
  const [isCustomReason, setIsCustomReason] = useState(true);
  const [reasons, setReasons] = useState([]);
  const [newReason, setNewReason] = useState('');
  const [showAddPolicyModal, setShowAddPolicyModal] = useState(false);
  const [policies, setPolicies] = useState([
    { name: 'new poly', createdBy: 'Admin', status: 'Active' }
  ]);
  const [newPolicy, setNewPolicy] = useState({
    name: '',
    pending: { enabled: false, fixed: '', percent: '' },
    accepted: { enabled: false, rules: [{ fixed: '', percent: '', threshold: '' }] },
    dispatched: { enabled: false, fixed: '', percent: '' }
  });

  const handleAddReason = (e) => {
    e.preventDefault();
    if (newReason.trim()) {
      setReasons([...reasons, newReason]);
      setNewReason('');
    }
  };

  const handleAddPolicy = () => {
    setPolicies([...policies, { ...newPolicy, createdBy: 'Admin', status: 'Active' }]);
    setShowAddPolicyModal(false);
    setNewPolicy({
      name: '',
      pending: { enabled: false, fixed: '', percent: '' },
      accepted: { enabled: false, rules: [{ fixed: '', percent: '', threshold: '' }] },
      dispatched: { enabled: false, fixed: '', percent: '' }
    });
  };

  const addAcceptedRule = () => {
    setNewPolicy({
      ...newPolicy,
      accepted: {
        ...newPolicy.accepted,
        rules: [...newPolicy.accepted.rules, { fixed: '', percent: '', threshold: '' }]
      }
    });
  };

  return (
    <div className="container mx-auto p-4">
      {/* Cancellation Reasons Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#E3E7EA"/>
                <path d="M14.2917 16.346C14.1963 16.4332 14.0502 16.4334 13.9546 16.3465L12.6645 15.1724C12.5554 15.0732 12.5554 14.9016 12.6646 14.8025L12.6963 14.7736C12.7917 14.687 12.9373 14.6871 13.0326 14.7737L14.4405 15.9994C14.5358 16.0862 14.6816 16.0862 14.7769 15.9994L16.4257 14.6441C16.5224 14.5561 16.6706 14.5575 16.7656 14.6472L16.8044 14.6838C17.0101 14.7836 17.0087 15.052 16.8015 15.1501L14.2917 16.346ZM9.159 13.5496C9.0636 13.6365 8.9178 13.6365 8.8225 13.5497L8.7906 13.5206C8.6815 13.4215 8.6815 13.25 8.7906 13.1508L9.3209 12.6682C9.43 12.569 9.43 12.3975 9.3209 12.2984L8.7907 11.8158C8.6816 11.7166 8.6817 11.5451 8.7909 11.4459L8.8225 11.4171C8.9179 11.3305 9.0636 11.3305 9.1589 11.4172L9.7593 11.9636C9.8546 12.0504 10.0005 12.0504 10.0958 11.9636L10.6962 11.4171C10.7916 11.3305 10.9373 11.3305 11.0326 11.4171L11.0645 11.4459C11.1735 11.545 11.1735 11.7165 11.0645 11.8156L10.5342 12.2982C10.4252 12.3974 10.4252 12.5689 10.5342 12.668L11.0645 13.1506C11.1735 13.2498 11.1735 13.4215 11.0645 13.5207L11.0326 13.5494C10.9373 13.6361 10.7916 13.636 10.6962 13.5494L10.0959 13.003C10.0005 12.9163 9.8546 12.9162 9.7593 13.0029L9.159 13.5496ZM7.9462 16.2128C7.6764 16.2128 7.4514 16.1307 7.2711 15.9666C7.0908 15.8025 6.9994 15.5978 7 15.3523V8.5486C7 8.3035 7.0904 8.0989 7.2711 7.9348C7.4518 7.7707 7.6768 7.6885 7.9462 7.6883H8.7319C9.0013 7.6883 9.2263 7.4642 9.2263 7.1881V6.75C9.2263 6.4739 9.4513 6.25 9.7207 6.25H9.8625C10.132 6.25 10.357 6.4739 10.357 6.75V7.1881C10.357 7.4642 10.582 7.6883 10.8514 7.6883H13.5513C13.8208 7.6883 14.0458 7.4642 14.0458 7.1881V6.75C14.0458 6.4739 14.2708 6.25 14.5402 6.25H14.6369C14.9063 6.25 15.1313 6.4739 15.1313 6.75V7.1881C15.1313 7.4642 15.3563 7.6883 15.6257 7.6883H16.4226C16.692 7.6883 16.917 7.8524 17.0977 15.9666L14.2917 16.346Z" fill="#111827" stroke="#111827" strokeWidth="0.1"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold">Cancellation</h2>
          </div>
          <label className="switch custom-switch">
            <input type="checkbox" className="sr-only" />
            <span className="slider round"></span>
          </label>
        </div>

        <section className="mb-8">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/4 mb-4 md:mb-0">
              <label className="font-medium">Enter Cancellation Reason</label>
            </div>
            <div className="md:w-3/4">
              <p className="text-gray-600 mb-4">
                You can enable either of two types of cancellation reason. Custom, where custom can provide their own reason for cancelling the order or you can define multiple reasons and the customer can choose one of them.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="mb-4">
                  <div className="flex items-center">
                    <label className="font-medium mr-4">Custom</label>
                    <label className="switch custom-switch">
                      <input 
                        type="checkbox" 
                        checked={isCustomReason}
                        onChange={() => setIsCustomReason(!isCustomReason)}
                      />
                      <span className="slider round"></span>
                    </label>
                    <label className="font-medium ml-4">Pre-defined</label>
                  </div>
                </div>
                <form onSubmit={handleAddReason} className="flex flex-col md:flex-row items-center">
                  <div className="md:w-2/3 mb-2 md:mb-0 md:pr-2">
                    <input
                      type="text"
                      maxLength="40"
                      value={newReason}
                      onChange={(e) => setNewReason(e.target.value)}
                      className="w-full p-2 border rounded"
                      placeholder="Enter Cancellation Reason"
                    />
                  </div>
                  <div className="md:w-1/3">
                    <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                      Add
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Cancellation Policies Section */}
        <section className="border-t pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="md:w-1/4 mb-4 md:mb-0">
              <h3 className="font-medium">Cancellation Policies</h3>
            </div>
            <div className="md:w-2/4 text-gray-600 mb-4 md:mb-0">
              <p>
                Enable users on your platform to cancel an order. Here you can add the cancellation policy defining the cancellation amount to be deducted at different level(i.e when the order is still pending or ongoing or dispatched).
              </p>
            </div>
            <div className="md:w-1/4 text-right">
              <button 
                onClick={() => setShowAddPolicyModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Add a new Policy
              </button>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center">
              <div className="md:w-1/4"></div>
              <div className="md:w-2/3 flex items-center">
                <label className="mr-2">Allow customers to cancel Orders</label>
                <label className="switch custom-switch">
                  <input type="checkbox" />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center">
              <div className="md:w-1/4"></div>
              <div className="md:w-2/3">
                <label>Allow restaurants to override cancellation policy to give individual restaurants the power to define their own cancellation policy.</label>
              </div>
              <div className="md:w-1/12">
                <label className="switch custom-switch">
                  <input type="checkbox" />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Policies Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 text-left w-1/4">Policy Name</th>
                  <th className="py-3 px-4 text-left w-1/4">Created By</th>
                  <th className="py-3 px-4 text-left w-1/4">Status</th>
                  <th className="py-3 px-4 text-left w-1/4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((policy, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 px-4">
                      <a className="text-blue-500 font-medium">{policy.name}</a>
                    </td>
                    <td className="py-3 px-4">{policy.createdBy}</td>
                    <td className="py-3 px-4">
                      <span className="text-green-500">Active</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="relative inline-block text-left">
                        <button className="text-gray-500 hover:text-gray-700">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                          </svg>
                        </button>
                        <div className="hidden origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                          <div className="py-1">
                            <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Edit</button>
                            <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Delete</button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Add Policy Modal */}
      {showAddPolicyModal && (
        <div className="fixed inset-0 bgOp flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-screen overflow-y-auto">
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium">Cancellation Policy</h3>
            </div>

            <div className="p-4 overflow-y-auto" style={{ maxHeight: '70vh' }}>
              <form className="space-y-4">
                {/* Policy Name */}
                <div className="flex flex-col md:flex-row">
                  <label className="md:w-1/4 font-medium mb-2 md:mb-0">
                    Policy Name<span className="text-red-500">*</span>
                  </label>
                  <div className="md:w-3/4">
                    <input
                      type="text"
                      value={newPolicy.name}
                      onChange={(e) => setNewPolicy({...newPolicy, name: e.target.value})}
                      className="w-full p-2 border rounded"
                      placeholder="Enter Policy name"
                    />
                  </div>
                </div>
                <hr className="my-4" />

                {/* Pending Order */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="font-medium">Order Pending</label>
                  </div>
                  <div className="flex items-center mb-4">
                    <label className="mr-2">Allow Customers to Cancel Order</label>
                    <label className="switch custom-switch">
                      <input
                        type="checkbox"
                        checked={newPolicy.pending.enabled}
                        onChange={() => setNewPolicy({
                          ...newPolicy,
                          pending: {...newPolicy.pending, enabled: !newPolicy.pending.enabled}
                        })}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-1">
                        Fixed Charges<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={newPolicy.pending.fixed}
                        onChange={(e) => setNewPolicy({
                          ...newPolicy,
                          pending: {...newPolicy.pending, fixed: e.target.value}
                        })}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">
                        % Charges<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={newPolicy.pending.percent}
                        onChange={(e) => setNewPolicy({
                          ...newPolicy,
                          pending: {...newPolicy.pending, percent: e.target.value}
                        })}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                </div>
                <hr className="my-4" />

                {/* Accepted Order */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="font-medium">Order Accepted</label>
                  </div>
                  <div className="flex items-center mb-4">
                    <label className="mr-2">Allow Customers to Cancel Order</label>
                    <label className="switch custom-switch">
                      <input
                        type="checkbox"
                        checked={newPolicy.accepted.enabled}
                        onChange={() => setNewPolicy({
                          ...newPolicy,
                          accepted: {...newPolicy.accepted, enabled: !newPolicy.accepted.enabled}
                        })}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                    <div>
                      <label className="block font-medium mb-1">
                        Fixed Charges<span className="text-red-500">*</span>
                      </label>
                    </div>
                    <div>
                      <label className="block font-medium mb-1">
                        % Charges<span className="text-red-500">*</span>
                      </label>
                    </div>
                    <div>
                      <label className="block font-medium mb-1">
                        Threshold<span className="text-red-500">*</span>
                      </label>
                    </div>
                  </div>

                  {newPolicy.accepted.rules.map((rule, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <input
                          type="number"
                          value={rule.fixed}
                          onChange={(e) => {
                            const updatedRules = [...newPolicy.accepted.rules];
                            updatedRules[index].fixed = e.target.value;
                            setNewPolicy({
                              ...newPolicy,
                              accepted: {...newPolicy.accepted, rules: updatedRules}
                            });
                          }}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={rule.percent}
                          onChange={(e) => {
                            const updatedRules = [...newPolicy.accepted.rules];
                            updatedRules[index].percent = e.target.value;
                            setNewPolicy({
                              ...newPolicy,
                              accepted: {...newPolicy.accepted, rules: updatedRules}
                            });
                          }}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={rule.threshold}
                          onChange={(e) => {
                            const updatedRules = [...newPolicy.accepted.rules];
                            updatedRules[index].threshold = e.target.value;
                            setNewPolicy({
                              ...newPolicy,
                              accepted: {...newPolicy.accepted, rules: updatedRules}
                            });
                          }}
                          className="w-full p-2 border rounded"
                          placeholder="(After the order is confirmed this rule will be used.)"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addAcceptedRule}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Add Time Based Cancellations
                  </button>
                </div>
                <hr className="my-4" />

                {/* Dispatched Order */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="font-medium">Order Dispatched</label>
                  </div>
                  <div className="flex items-center mb-4">
                    <label className="mr-2">Allow Customers to Cancel Order</label>
                    <label className="switch custom-switch">
                      <input
                        type="checkbox"
                        checked={newPolicy.dispatched.enabled}
                        onChange={() => setNewPolicy({
                          ...newPolicy,
                          dispatched: {...newPolicy.dispatched, enabled: !newPolicy.dispatched.enabled}
                        })}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-1">
                        Fixed Charges<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={newPolicy.dispatched.fixed}
                        onChange={(e) => setNewPolicy({
                          ...newPolicy,
                          dispatched: {...newPolicy.dispatched, fixed: e.target.value}
                        })}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">
                        % Charges<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={newPolicy.dispatched.percent}
                        onChange={(e) => setNewPolicy({
                          ...newPolicy,
                          dispatched: {...newPolicy.dispatched, percent: e.target.value}
                        })}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => setShowAddPolicyModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPolicy}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tailwind CSS for switches */}
      <style jsx>{`
        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }
        
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 24px;
        }
        
        .slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        
        input:checked + .slider {
          background-color: #3b82f6;
        }
        
        input:checked + .slider:before {
          transform: translateX(26px);
        }
      `}</style>
    </div>
  );
};

export default CancellationPolicyPage;