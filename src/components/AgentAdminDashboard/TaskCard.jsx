import { useState, useEffect } from "react";
import {
  Plus,
  Check,
  User,
  Clock,
  MapPin,
  Package,
  Info,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const TaskCard = ({ task, status, onSelect, isSelected, openAssignModal }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showAllocationDetails, setShowAllocationDetails] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    if (task.allocationProgress?.currentCandidate) {
      const candidate = task.allocationProgress.currentCandidate;
      
      if (candidate.expiresIn !== undefined) {
        setTimeRemaining(candidate.expiresIn);
      } else if (candidate.notifiedAt) {
        const notifiedAt = new Date(candidate.notifiedAt);
        const now = new Date();
        const elapsed = Math.floor((now - notifiedAt) / 1000);
        const totalTime = candidate.totalTime || 120; // Fallback to 2 minutes
        const remaining = Math.max(0, totalTime - elapsed);
        setTimeRemaining(remaining);
      }
    } else {
      setTimeRemaining(null);
    }
  }, [task]);

  useEffect(() => {
    let interval;
    if (timeRemaining !== null && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeRemaining]);


  const handleClick = () => {
    onSelect(task);
  };

  const getAgentName = (agent) => {
    if (!agent) return "N/A";
    return agent.fullName || agent.name || "Assigned Agent";
  };

  const formatTime = (time) =>
    new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatAddress = (address) => {
    if (!address) return "Address not available";
    if (typeof address === "string") return address;
    if (address.street) {
      return `${address.street.split(",")[0]}, ${address.city}`;
    }
    return "Address not available";
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case "accepted_by_restaurant":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-yellow-100 text-yellow-800";
      case "ready_for_pickup":
        return "bg-purple-100 text-purple-800";
      case "out_for_delivery":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatOrderStatus = (status) => {
    return status
      ? status
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      : "";
  };

  const formatAllocationMethod = (method) => {
    return method
      ? method
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      : "";
  };

  const formatTimeDiff = (start, end) => {
    if (!start || !end) return "";
    const diff = (new Date(end) - new Date(start)) / 1000;
    return `${Math.round(diff)}s`;
  };

  const getCurrentAttempt = (allocationProgress) => {
    if (!allocationProgress) return "";
    const { candidates = [] } = allocationProgress;
    const attempted = candidates.filter(c => 
      ['accepted', 'rejected', 'timed_out'].includes(c.status)
    ).length;
    return `Attempt ${attempted + 1} of ${candidates.length}`;
  };

  const formatTimeRemaining = (seconds) => {
    if (seconds === null || seconds === undefined) return "Not started";
    if (seconds <= 0) return "Expired";
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

 const calculateProgressPercentage = () => {
  const candidate = task.allocationProgress?.currentCandidate;
  if (!candidate || timeRemaining === null || timeRemaining === undefined) return 0;
  if (timeRemaining <= 0) return 100;
  
  const totalTime = candidate.totalTime || 
    (task.allocationMethod === 'one_by_one' ? 200 :
     task.allocationMethod === 'send_to_all' ? 60 :
     task.allocationMethod === 'fifo' ? 90 : 120);
  
  return Math.min(100, Math.round(((totalTime - timeRemaining) / totalTime) * 100));
};
const renderProgressBar = (percentage, timeRemaining) => {
  const safePercentage = Math.max(0, Math.min(100, Number(percentage) || 0));
  const filledSquares = Math.round(safePercentage / 5);
  const emptySquares = 20 - filledSquares;

  // Get total time from candidate or fallback
  const candidate = task.allocationProgress?.currentCandidate;
  const totalTime = candidate?.totalTime || 
    (task.allocationMethod === 'one_by_one' ? 200 :
     task.allocationMethod === 'send_to_all' ? 60 :
     task.allocationMethod === 'fifo' ? 90 : 120);

  // Calculate percentage remaining (more accurate than absolute seconds)
  const percentageRemaining = (timeRemaining / totalTime) * 100;

  let progressColor;
  if (timeRemaining === null || timeRemaining === undefined) {
    progressColor = 'bg-gray-400'; // Not started
  } else if (timeRemaining <= 0) {
    progressColor = 'bg-red-500'; // Expired
  } else if (percentageRemaining < 25) {  // Last 25%
    progressColor = 'bg-red-500'; // Critical
  } else if (percentageRemaining < 50) {  // 25-50%
    progressColor = 'bg-yellow-500'; // Warning
  } else {
    progressColor = 'bg-blue-500'; // Normal (>50%)
  }

  return (
    <div className="flex items-center">
      <div className="flex">
        {[...Array(filledSquares)].map((_, i) => (
          <div key={`filled-${i}`} className={`w-2 h-2 mx-px ${progressColor}`}></div>
        ))}
        {[...Array(emptySquares)].map((_, i) => (
          <div key={`empty-${i}`} className="w-2 h-2 bg-gray-200 mx-px"></div>
        ))}
      </div>
      <span className="text-xs ml-2 w-16">
        {timeRemaining !== null && timeRemaining !== undefined 
          ? `${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')}`
          : '--:--'}
      </span>
    </div>
  );
};
 const renderAllocationProgress = () => {
  const isSendToAll = task.allocationMethod === 'send_to_all';
  
  return (
    <div className="mt-2 border border-gray-200 rounded-md overflow-hidden">
      <div 
        className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer"
        onClick={() => setShowAllocationDetails(!showAllocationDetails)}
      >
        <div className="text-sm font-medium">
          {isSendToAll ? 'Broadcast Mode' : 'Allocation Progress'}: {getCurrentAttempt(task.allocationProgress)}
        </div>
        {showAllocationDetails ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </div>
      
      {showAllocationDetails && (
        <div className="divide-y divide-gray-200">
          {/* Header for Send to All mode */}
          {isSendToAll && (
            <div className="p-3 bg-blue-50 text-sm">
              {task.allocationProgress.candidates.some(c => c.status === 'sent') 
                ? "All agents have been notified. Waiting for the first acceptance..."
                : "Preparing to notify agents..."}
            </div>
          )}

          {/* Active Candidates Section */}
          <div className="p-3">
            <div className="text-xs font-semibold text-gray-700 mb-2">
              {isSendToAll ? 'Active Candidates' : 'Current Candidate'}
            </div>
            <div className="space-y-3">
              {task.allocationProgress?.candidates
                ?.filter(c => c.status === 'sent' || (isSendToAll && c.isCurrentCandidate))
                .map((candidate, index) => (
                  <div key={index} className="p-2 bg-blue-50 rounded">
                    <div className="flex items-center">
                      <div className={`h-4 w-4 rounded-full mr-2 ${
                        candidate.status === 'accepted' ? 'bg-green-500' :
                        candidate.status === 'rejected' ? 'bg-red-500' :
                        'bg-yellow-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="font-medium">{candidate.fullName}</div>
                        <div className="mt-1">
                          {renderProgressBar(
                            calculateCandidateProgress(candidate),
                            getCandidateTimeRemaining(candidate)
                          )}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          ⏳ {formatTimeRemaining(getCandidateTimeRemaining(candidate))} remaining
                        </div>
                        <div className="text-xs text-gray-600">
                          Notified: {formatTime(candidate.notifiedAt)}
                        </div>
                        <div className={`text-xs mt-1 ${
                          candidate.status === 'accepted' ? 'text-green-600' :
                          candidate.status === 'rejected' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          Status: {getStatusDisplay(candidate.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Previous Candidates Section */}
          <div className="p-3">
            <div className="text-xs font-semibold text-gray-700 mb-2">
              {isSendToAll ? 'Responded Candidates' : 'Previous Candidates'}
            </div>
            <div className="space-y-3">
              {task.allocationProgress?.candidates
                ?.filter(c => ['accepted', 'rejected', 'timed_out'].includes(c.status))
                .map((candidate, index) => (
                  <div key={index} className="text-sm">
                    <div className="flex items-start">
                      {candidate.status === 'accepted' ? (
                        <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      ) : candidate.status === 'rejected' ? (
                        <X className="h-4 w-4 text-red-500 mr-2 mt-0.5" />
                      ) : (
                        <Clock className="h-4 w-4 text-red-500 mr-2 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{candidate.fullName}</div>
                        {candidate.status === 'accepted' && (
                          <div className="text-xs text-green-600 mt-1">
                            ✅ Accepted in {formatTimeDiff(candidate.notifiedAt, candidate.respondedAt)}
                          </div>
                        )}
                        {candidate.status === 'rejected' && (
                          <div className="text-xs text-red-600 mt-1">
                            ❌ Rejected in {formatTimeDiff(candidate.notifiedAt, candidate.respondedAt)}
                            {candidate.rejectionReason && ` - ${candidate.rejectionReason}`}
                          </div>
                        )}
                        {candidate.status === 'timed_out' && (
                          <div className="text-xs text-red-500 mt-1">
                            ⏱ Timed Out (No response)
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          Notified: {formatTime(candidate.notifiedAt)}
                          {candidate.respondedAt && ` | Responded: ${formatTime(candidate.respondedAt)}`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Summary Section */}
          <div className="p-3 bg-gray-50 text-center text-xs">
            <div className="font-medium">
              Total Candidates: {task.allocationProgress?.candidates?.length || 0} • 
              Responses: {task.allocationProgress?.candidates?.filter(c => ['accepted', 'rejected'].includes(c.status)).length || 0} • 
              Waiting: {task.allocationProgress?.candidates?.filter(c => c.status === 'sent').length || 0}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions for send-to-all mode
const calculateCandidateProgress = (candidate) => {
  if (!candidate.notifiedAt) return 0;
  
  const now = new Date();
  const notifiedAt = new Date(candidate.notifiedAt);
  const elapsed = Math.floor((now - notifiedAt) / 1000);
  const totalTime = candidate.totalTime || 60; // Default 60s for send-to-all
  
  return Math.min(100, Math.round((elapsed / totalTime) * 100));
};


const getCandidateTimeRemaining = (candidate) => {
  if (!candidate.notifiedAt) return null;
  
  const now = new Date();
  const notifiedAt = new Date(candidate.notifiedAt);
  const elapsed = Math.floor((now - notifiedAt) / 1000);
  const totalTime = candidate.totalTime || 60;
  
  return Math.max(0, totalTime - elapsed);
};

const getStatusDisplay = (status) => {
  switch(status) {
    case 'sent': return 'Waiting for response...';
    case 'accepted': return '✅ Accepted';
    case 'rejected': return '❌ Rejected';
    case 'timed_out': return '⌛ Timed Out';
    default: return 'Pending';
  }
};
  return (
    <div
      className={`border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 ${
        isSelected ? "bg-blue-50" : ""
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start p-4">
        {/* Left Action Button */}
        <div className="flex flex-col items-center mr-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              status === "unassigned" ? openAssignModal(task) : null;
            }}
            className={`flex items-center justify-center h-10 w-10 rounded-full ${
              status === "unassigned"
                ? "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                : "bg-green-500 hover:bg-green-600 cursor-default"
            } text-white transition-colors duration-200`}
          >
            {status === "unassigned" ? (
              <Plus className="h-5 w-5" />
            ) : (
              <Check className="h-5 w-5" />
            )}
          </button>
          <span className="text-xs text-gray-500 mt-1 text-center">
            {status === "unassigned"
              ? "Assign Agent"
              : getAgentName(task.assignedAgent)}
          </span>
        </div>

        {/* Task Details */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <div className="font-medium text-gray-900">
              Order #{task._id?.slice(-6).toUpperCase()}
              <span className="ml-2 text-xs font-normal text-gray-500">
                {formatTime(task.orderTime)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {status === "unassigned" ? (
                  <Clock className="h-3 w-3" />
                ) : status === "assigned" ? (
                  <User className="h-3 w-3" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
                <span className="ml-1 capitalize">{status}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(!showDetails);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="text-xs mb-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded ${getOrderStatusColor(
                task.orderStatus
              )}`}
            >
              {formatOrderStatus(task.orderStatus)}
            </span>
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-800">
              {formatAllocationMethod(task.allocationMethod)}
            </span>
          </div>

          {/* Allocation Progress Section */}
          {status === "unassigned" && task.allocationProgress && renderAllocationProgress()}

          {/* Pickup Section */}
          <div className="flex items-start space-x-2 mb-2 mt-2">
            <div className="h-6 w-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
              <MapPin className="h-3 w-3" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {task.restaurantName || "Restaurant Name"}
              </div>
              <div className="text-xs text-gray-500">
                {formatAddress(task.pickupLocation?.address)}
              </div>
            </div>
          </div>

          {/* Delivery Section */}
          <div className="flex items-start space-x-2 mt-2">
            <div className="h-6 w-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
              <Package className="h-3 w-3" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                Delivery Location
              </div>
              <div className="text-xs text-gray-500">
                {formatAddress(task.dropLocation?.address)}
              </div>
            </div>
          </div>

          {/* Additional Details */}
          {showDetails && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="font-medium text-gray-700">Order ID:</div>
                  <div className="text-gray-500">{task._id}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">
                    Total Amount:
                  </div>
                  <div className="text-gray-500">
                    ₹
                    {task.items?.reduce(
                      (sum, item) => sum + (item.totalPrice || 0),
                      0
                    ) || 0}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">
                    Payment Method:
                  </div>
                  <div className="text-gray-500 capitalize">
                    {task.paymentMethod}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">
                    Allocation Method:
                  </div>
                  <div className="text-gray-500">
                    {formatAllocationMethod(task.allocationMethod)}
                  </div>
                </div>
                {status !== "unassigned" && task.assignedAgent && (
                  <>
                    <div>
                      <div className="font-medium text-gray-700">Agent:</div>
                      <div className="text-gray-500">
                        {getAgentName(task.assignedAgent)}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700">
                        Agent Phone:
                      </div>
                      <div className="text-gray-500">
                        {task.assignedAgent.phoneNumber || "N/A"}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="mt-2">
                <div className="font-medium text-gray-700">Items:</div>
                <ul className="list-disc list-inside">
                  {task.items?.map((item, index) => (
                    <li key={index}>
                      {item.quantity}x {item.name} (₹{item.totalPrice})
                    </li>
                  )) || <li>No items listed</li>}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;