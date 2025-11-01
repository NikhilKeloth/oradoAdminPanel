import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AgentStatusPanel = ({ 
  onAgentSelect, 
  agents = [],
  isCollapsed,
  onToggleCollapse
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const getAgentStatus = (agent) => {
    const { status, availabilityStatus } = agent.agentStatus || {};
    
    if (availabilityStatus === "UNAVAILABLE") {
      return "Inactive";
    }
    if (status === "AVAILABLE") {
      return "Free";
    }
    return "Busy";
  };

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.phoneNumber?.includes(searchQuery);
    
    const status = getAgentStatus(agent);
    const matchesTab = 
      activeTab === "All" || 
      activeTab === status;
    
    return matchesSearch && matchesTab;
  });

  const statusCounts = agents.reduce((acc, agent) => {
    const status = getAgentStatus(agent);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, { Free: 0, Busy: 0, Inactive: 0 });

  // Calculate total count for "All" tab
  statusCounts.All = agents.length;

  return (
    <div className={`${isCollapsed ? 'w-12' : 'w-80'} bg-white shadow-lg rounded-lg overflow-hidden flex flex-col h-full transition-all duration-300 ease-in-out`}>
      {/* Header */}
      <div className="bg-indigo-600 px-4 py-3 flex items-center justify-between">
        <button
          onClick={onToggleCollapse}
          className={`${isCollapsed ? 'mx-auto' : 'mr-2'} p-1 rounded-md hover:bg-indigo-500 transition-colors duration-200`}
          title={isCollapsed ? "Expand panel" : "Collapse panel"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 text-white" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-white" />
          )}
        </button>
        {!isCollapsed && (
          <>
            <h2 className="font-bold text-lg text-white">Agent Status</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search agents..."
                className="pl-8 pr-4 py-1 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                className="absolute left-2.5 top-1.5 h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </>
        )}
      </div>

      {/* Tabs */}
      {!isCollapsed && (
        <div className="flex border-b">
          {["All", "Free", "Busy", "Inactive"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-medium text-center ${
                activeTab === tab
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab} ({statusCounts[tab] || 0})
            </button>
          ))}
        </div>
      )}

      {/* Agent List */}
      {!isCollapsed && (
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {filteredAgents.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-600">
                {activeTab === "All" 
                  ? "No agents found" 
                  : `No ${activeTab.toLowerCase()} agents found`}
              </p>
              <p className="text-xs text-gray-500">Try changing your search query</p>
            </div>
          ) : (
            filteredAgents.map((agent) => {
              const status = getAgentStatus(agent);
              const statusColors = {
                Free: { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-500" },
                Busy: { bg: "bg-yellow-100", text: "text-yellow-800", dot: "bg-yellow-500" },
                Inactive: { bg: "bg-gray-100", text: "text-gray-800", dot: "bg-gray-400" }
              };
              
              return (
                <div
                  key={agent._id}
                  className="flex items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onAgentSelect(agent)}
                >
                  <div className="relative">
            
             
                   {agent?.profilePicture
   ? (
            <img
              src={agent.profilePicture}
              alt={`${agent.fullName}'s profile`}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
              {agent.fullName?.charAt(0) || "A"}
            </div>
          )}
                    <span
                      className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${statusColors[status].dot}`}
                    ></span>
                  </div>

                  <div className="ml-3 flex-1">
                    <p className="font-medium text-gray-900">
                      {agent.fullName || `Agent ${agent._id?.slice(0, 4) || "N/A"}`}
                    </p>
                    <p className="text-sm text-gray-500">{agent.phoneNumber || "No phone"}</p>
                    {agent.currentOrder && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="text-xs bg-blue-50 text-blue-600 px-1 rounded">
                          Order: #{agent.currentOrder?.orderNumber || "Active"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${statusColors[status].bg} ${statusColors[status].text}`}
                    >
                      {status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Footer */}
      {!isCollapsed && (
        <div className="px-4 py-2 border-t bg-gray-50 text-xs text-gray-500">
          Showing {filteredAgents.length} {filteredAgents.length === 1 ? "agent" : "agents"}
        </div>
      )}
    </div>
  );
};

export default AgentStatusPanel;