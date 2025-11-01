import { useState, useEffect } from "react";
import {
  Plus,
  Check,
  User,
  Clock,
  MapPin,
  Truck,
  Package,
  Phone,
  Info,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import apiClient from "../../apis/apiClient/apiClient";
import TaskCard from "./TaskCard";
const DispatchSidebar = ({ onOrderSelect, dispatchOrders, onRefresh, isCollapsed, onToggleCollapse }) => {
  const [activeTab, setActiveTab] = useState("unassigned");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [availableAgents, setAvailableAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentError, setAssignmentError] = useState(null);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);

  // Group orders based on assignment status
  const groupedTasks = {
    unassigned: dispatchOrders.filter(
      (order) => !order.assignedAgent && order.orderStatus !== "delivered"
    ),
    assigned: dispatchOrders.filter(
      (order) => order.assignedAgent && order.orderStatus !== "delivered"
    ),
    completed: dispatchOrders.filter(
      (order) => order.orderStatus === "delivered"
    ),
  };

  const fetchAvailableAgents = async () => {
    setIsLoadingAgents(true);
    try {
      const res = await apiClient.get("/admin/agent/list");
      if (res.data.messageType === "success") {
        const availableAgents = res.data.data.filter(
          (agent) =>
            agent.status === "Free" && agent.currentStatus === "AVAILABLE"
        );
        setAvailableAgents(availableAgents);
      }
    } catch (err) {
      console.error("Failed to fetch agents", err);
    } finally {
      setIsLoadingAgents(false);
    }
  };

  const openAssignModal = (order) => {
    setSelectedOrder(order);
    fetchAvailableAgents();
    setShowAssignModal(true);
    setSelectedAgent("");
    setAssignmentError(null);
  };


  const [showAllocationDetails, setShowAllocationDetails] = useState(false);












  const assignAgent = async () => {

    if (!selectedAgent) {
      setAssignmentError("Please select an agent");
      return;
    }

    setIsAssigning(true);
    setAssignmentError(null);

    try {
      const res = await apiClient.post("/admin/agent/manual-assign", {
        orderId: selectedOrder._id,
        agentId: selectedAgent,
      });

      if (res.data.messageType === "success") {
        toast.success("Agent assigned successfully!");
        setShowAssignModal(false);
        onRefresh(); // Refresh the orders list
      } else {
        setAssignmentError(res.data.message || "Failed to assign agent");
      }
    } catch (err) {
      setAssignmentError("Failed to connect to server");
    } finally {
      setIsAssigning(false);
    }
  };

  const getTabCount = (tab) => groupedTasks[tab]?.length || 0;

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
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatAllocationMethod = (method) => {
    return method
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const TaskStatusBadge = ({ status }) => {
    const statusConfig = {
      unassigned: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: <Clock className="h-3 w-3" />,
      },
      assigned: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: <User className="h-3 w-3" />,
      },
      accepted: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: <Check className="h-3 w-3" />,
      },
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: <Clock className="h-3 w-3" />,
      },
      rejected: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: <X className="h-3 w-3" />,
      },
      "in progress": {
        bg: "bg-purple-100",
        text: "text-purple-800",
        icon: <Truck className="h-3 w-3" />,
      },
    };

    return (
      <div
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          statusConfig[status.toLowerCase()]?.bg || "bg-gray-100"
        } ${statusConfig[status.toLowerCase()]?.text || "text-gray-800"}`}
      >
        {statusConfig[status.toLowerCase()]?.icon}
        <span className="ml-1 capitalize">{status}</span>
      </div>
    );
  };

// const TaskCard = ({ task, status, onSelect, isSelected }) => {
//   const [showDetails, setShowDetails] = useState(false);
//   const [showAllocationDetails, setShowAllocationDetails] = useState(false);
//   const [timeRemaining, setTimeRemaining] = useState(null);

//   useEffect(() => {
//     // Calculate initial time remaining when component mounts or task changes
//     if (task.allocationProgress?.currentCandidate?.assignedAt) {
//       const assignedAt = new Date(task.allocationProgress.currentCandidate.assignedAt);
//       const now = new Date();
//       const elapsed = Math.floor((now - assignedAt) / 1000);
//       const expirySec = 120; // Default 2 minutes expiry
//       const remaining = Math.max(0, expirySec - elapsed);
//       setTimeRemaining(remaining);
//     }
//   }, [task]);

//   useEffect(() => {
//     // Set up interval to update time remaining every second
//     let interval;
//     if (timeRemaining !== null && timeRemaining > 0) {
//       interval = setInterval(() => {
//         setTimeRemaining(prev => {
//           if (prev <= 1) {
//             clearInterval(interval);
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000);
//     }

//     return () => {
//       if (interval) clearInterval(interval);
//     };
//   }, [timeRemaining]);

//   const handleClick = () => {
//     onSelect(task);
//   };
  
//   const getAgentName = (agent) => {
//     if (!agent) return "N/A";
//     return agent.fullName || agent.name || "Assigned Agent";
//   };

//   const renderStatusIcon = (status) => {
//     switch(status) {
//       case 'timed_out':
//         return <Clock className="h-4 w-4 text-red-500" />;
//       case 'pending':
//         return <Clock className="h-4 w-4 text-yellow-500" />;
//       case 'accepted':
//         return <Check className="h-4 w-4 text-green-500" />;
//       case 'rejected':
//         return <X className="h-4 w-4 text-red-500" />;
//       default:
//         return <div className="h-4 w-4 border border-gray-300 rounded" />;
//     }
//   };

//   // Format time difference for display
//   const formatTimeDiff = (start, end) => {
//     if (!start || !end) return "";
//     const diff = (new Date(end) - new Date(start)) / 1000;
//     return `${Math.round(diff)}s`;
//   };

//   // Get current allocation attempt number
//   const getCurrentAttempt = (allocationProgress) => {
//     if (!allocationProgress) return "";
//     const { candidates = [] } = allocationProgress;
//     const attempted = candidates.filter(c => 
//       ['accepted', 'rejected', 'timed_out'].includes(c.status)
//     ).length;
//     return `Attempt ${attempted + 1} of ${candidates.length}`;
//   };

//   // Format time remaining for display
//   const formatTimeRemaining = (seconds) => {
//     if (seconds === null) return "";
//     return `${seconds}s remaining`;
//   };

//   return (
//     <div
//       className={`border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 ${
//         isSelected ? "bg-blue-50" : ""
//       }`}
//       onClick={handleClick}
//     >
//       <div className="flex items-start p-4">
//         {/* Left Action Button */}
//         <div className="flex flex-col items-center mr-3">
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               status === "unassigned" ? openAssignModal(task) : null;
//             }}
//             className={`flex items-center justify-center h-10 w-10 rounded-full ${
//               status === "unassigned"
//                 ? "bg-blue-500 hover:bg-blue-600 cursor-pointer"
//                 : "bg-green-500 hover:bg-green-600 cursor-default"
//             } text-white transition-colors duration-200`}
//           >
//             {status === "unassigned" ? (
//               <Plus className="h-5 w-5" />
//             ) : (
//               <Check className="h-5 w-5" />
//             )}
//           </button>
//           <span className="text-xs text-gray-500 mt-1 text-center">
//             {status === "unassigned"
//               ? "Assign Agent"
//               : getAgentName(task.assignedAgent)}
//           </span>
//         </div>

//         {/* Task Details */}
//         <div className="flex-1">
//           <div className="flex justify-between items-start mb-1">
//             <div className="font-medium text-gray-900">
//               Order #{task._id.slice(-6).toUpperCase()}
//               <span className="ml-2 text-xs font-normal text-gray-500">
//                 {formatTime(task.orderTime)}
//               </span>
//             </div>
//             <div className="flex items-center space-x-2">
//               <TaskStatusBadge
//                 status={task.agentAssignmentStatus || status}
//               />
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setShowDetails(!showDetails);
//                 }}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <Info className="h-4 w-4" />
//               </button>
//             </div>
//           </div>

//           <div className="text-xs mb-2">
//             <span
//               className={`inline-flex items-center px-2 py-0.5 rounded ${getOrderStatusColor(
//                 task.orderStatus
//               )}`}
//             >
//               {formatOrderStatus(task.orderStatus)}
//             </span>
//             <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-800">
//               {formatAllocationMethod(task.allocationMethod)}
//             </span>
//           </div>

//           {/* Allocation Progress Section */}
//           {status === "unassigned" && task.allocationProgress && (
//             <div className="mt-2 border border-gray-200 rounded-md">
//               <div 
//                 className="flex items-center justify-between p-2 bg-gray-50 cursor-pointer"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setShowAllocationDetails(!showAllocationDetails);
//                 }}
//               >

                
//                 <div className="text-sm font-medium">
//                   Allocation Progress: {getCurrentAttempt(task.allocationProgress)}
//                 </div>
//                 {showAllocationDetails ? (
//                   <ChevronUp className="h-4 w-4 text-gray-500" />
//                 ) : (
//                   <ChevronDown className="h-4 w-4 text-gray-500" />
//                 )}
//               </div>
              
//               {showAllocationDetails && (
//                 <div className="p-2 text-xs">
//                   {task.allocationProgress.currentCandidate && (
//                     <div className={`mb-2 p-2 rounded ${
//                       timeRemaining > 10 ? 'bg-yellow-50' : 'bg-red-50'
//                     }`}>
//                       <div className="font-medium">Current:</div>
//                       <div className="flex items-start mt-1">
//                         <div className="mt-1 mr-2">
//                           <Clock className={`h-4 w-4 ${
//                             timeRemaining > 10 ? 'text-yellow-500' : 'text-red-500'
//                           }`} />
//                         </div>
//                         <div className="flex-1">
//                           <div className="font-medium">
//                             {task.allocationProgress.currentCandidate.fullName}
//                           </div>
//                           <div className={
//                             timeRemaining > 10 ? 'text-yellow-600' : 'text-red-600'
//                           }>
//                             ⏳ Waiting ({formatTimeRemaining(timeRemaining)})
//                           </div>
//                           <div className="text-gray-500 text-xs">
//                             Assigned: {formatTime(task.allocationProgress.currentCandidate.assignedAt)}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}
                  
//                   <div className="space-y-2">
//                     {task.allocationProgress.candidates.map((candidate, index) => (
//                       <div key={index} className="flex items-start">
//                         <div className="mt-1 mr-2">
//                           {renderStatusIcon(candidate.status)}
//                         </div>
//                         <div className="flex-1">
//                           <div className="font-medium">{candidate.fullName}</div>
//                           {candidate.status === 'rejected' && (
//                             <div className="text-red-500">
//                               ❌ Rejected ({formatTimeDiff(candidate.assignedAt, candidate.respondedAt)}) - {candidate.rejectionReason || 'No reason provided'}
//                             </div>
//                           )}
//                           {candidate.status === 'timed_out' && (
//                             <div className="text-red-500">
//                               ⏱ Timed out ({formatTimeDiff(candidate.assignedAt, candidate.respondedAt)})
//                             </div>
//                           )}
//                           {candidate.status === 'accepted' && (
//                             <div className="text-green-500">
//                               ✅ Accepted ({formatTimeDiff(candidate.assignedAt, candidate.respondedAt)})
//                             </div>
//                           )}
//                           <div className="text-gray-500 text-xs">
//                             Assigned: {formatTime(candidate.assignedAt)}
//                             {candidate.respondedAt && ` | Responded: ${formatTime(candidate.respondedAt)}`}
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
                  
//                   <div className="mt-2 pt-2 border-t border-gray-200 text-center text-xs">
//                     {task.allocationProgress.currentCandidate 
//                       ? formatTimeRemaining(timeRemaining)
//                       : `Total attempts: ${task.allocationProgress.candidates.length}`}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//           {/* Rest of the TaskCard component remains the same... */}
//           {/* Pickup Section */}
//           <div className="flex items-start space-x-2 mb-2 mt-2">
//             <div className="h-6 w-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
//               <MapPin className="h-3 w-3" />
//             </div>
//             <div className="flex-1">
//               <div className="text-sm font-medium text-gray-900">
//                 {task.restaurantName || "Restaurant Name"}
//               </div>
//               <div className="text-xs text-gray-500">
//                 {formatAddress(task.pickupLocation?.address)}
//               </div>
//             </div>
//           </div>

//           {/* Delivery Section */}
//           <div className="flex items-start space-x-2 mt-2">
//             <div className="h-6 w-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
//               <Package className="h-3 w-3" />
//             </div>
//             <div className="flex-1">
//               <div className="text-sm font-medium text-gray-900">
//                 Delivery Location
//               </div>
//               <div className="text-xs text-gray-500">
//                 {formatAddress(task.dropLocation?.address)}
//               </div>
//             </div>
//           </div>

//           {/* Additional Details */}
//           {showDetails && (
//             <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs">
//               <div className="grid grid-cols-2 gap-2">
//                 <div>
//                   <div className="font-medium text-gray-700">Order ID:</div>
//                   <div className="text-gray-500">{task._id}</div>
//                 </div>
//                 <div>
//                   <div className="font-medium text-gray-700">
//                     Total Amount:
//                   </div>
//                   <div className="text-gray-500">
//                     ₹
//                     {task.items.reduce(
//                       (sum, item) => sum + item.totalPrice,
//                       0
//                     )}
//                   </div>
//                 </div>
//                 <div>
//                   <div className="font-medium text-gray-700">
//                     Payment Method:
//                   </div>
//                   <div className="text-gray-500 capitalize">
//                     {task.paymentMethod}
//                   </div>
//                 </div>
//                 <div>
//                   <div className="font-medium text-gray-700">
//                     Allocation Method:
//                   </div>
//                   <div className="text-gray-500">
//                     {formatAllocationMethod(task.allocationMethod)}
//                   </div>
//                 </div>
//                 {status !== "unassigned" && task.assignedAgent && (
//                   <>
//                     <div>
//                       <div className="font-medium text-gray-700">Agent:</div>
//                       <div className="text-gray-500">
//                         {getAgentName(task.assignedAgent)}
//                       </div>
//                     </div>
//                     <div>
//                       <div className="font-medium text-gray-700">
//                         Agent Phone:
//                       </div>
//                       <div className="text-gray-500">
//                         {task.assignedAgent.phoneNumber || "N/A"}
//                       </div>
//                     </div>
//                   </>
//                 )}
//               </div>
//               <div className="mt-2">
//                 <div className="font-medium text-gray-700">Items:</div>
//                 <ul className="list-disc list-inside">
//                   {task.items.map((item, index) => (
//                     <li key={index}>
//                       {item.quantity}x {item.name} (₹{item.totalPrice})
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };





  return (
    <div className={`${isCollapsed ? 'w-12' : 'w-96'} bg-white border-r border-gray-200 flex flex-col h-full shadow-sm transition-all duration-300 ease-in-out`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          {!isCollapsed && (
            <>
              <h2 className="text-lg font-semibold text-gray-900">
                Dispatch Tasks
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={onRefresh}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Refresh
                </button>
                <span className="text-xs text-gray-500 self-center">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </>
          )}
          <button
            onClick={onToggleCollapse}
            className={`${isCollapsed ? 'mx-auto' : 'ml-2'} p-1 rounded-md hover:bg-gray-100 transition-colors duration-200`}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>
        {!isCollapsed && (
          <p className="text-xs text-gray-500 mt-1">
            Manage delivery agent assignments
          </p>
        )}
      </div>

      {/* Tabs */}
      {!isCollapsed && (
        <div className="flex border-b border-gray-200">
          {["unassigned", "assigned", "completed"].map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 py-3 text-sm font-medium relative ${
                activeTab === key
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center justify-center">
                <span className="capitalize">{key}</span>
                <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {getTabCount(key)}
                </span>
              </div>
              {activeTab === key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isCollapsed && groupedTasks[activeTab]?.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <Truck className="h-10 w-10 text-gray-400 mb-3" />
          <h3 className="text-sm font-medium text-gray-900">
            No {activeTab} tasks
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === "unassigned"
              ? "All orders have been assigned"
              : activeTab === "assigned"
              ? "No orders currently in progress"
              : "No completed orders yet"}
          </p>
          <button
            onClick={onRefresh}
            className="mt-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Refresh list
          </button>
        </div>
      )}

      {/* Task List */}
      {!isCollapsed && groupedTasks[activeTab]?.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-200 bg-gray-50">
            Showing {groupedTasks[activeTab].length} {activeTab} orders
          </div>
          <div className="divide-y divide-gray-200">
            {groupedTasks[activeTab].map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                status={activeTab}
                onSelect={onOrderSelect}
                isSelected={selectedOrder?._id === task._id}
                openAssignModal={openAssignModal}
              />
            ))}
          </div>
        </div>
      )}

      {/* Assign Agent Modal */}
      {showAssignModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Assign Delivery Agent
          </h3>
          <button
            onClick={() => {
              setShowAssignModal(false);
              setAssignmentError(null);
            }}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">
            Order:{" "}
            <span className="font-medium">
              #{selectedOrder?._id?.slice(-6).toUpperCase()}
            </span>
          </p>
          <p className="text-sm text-gray-500">
            Restaurant:{" "}
            <span className="font-medium">
              {selectedOrder?.restaurantName}
            </span>
          </p>
          
          {/* Delivery Address Section */}
          <div className="mt-3 p-3 bg-gray-50 rounded-md">
            <div className="flex items-start">
              <MapPin className="h-4 w-4 text-blue-500 mt-0.5 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-700">Delivery Address:</p>
                <p className="text-sm text-gray-600">
                  {selectedOrder?.dropLocation?.address ? 
                    formatAddress(selectedOrder.dropLocation.address) : 
                    "Address not available"}
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-3">
            Allocation Method:{" "}
            <span className="font-medium">
              {formatAllocationMethod(selectedOrder?.allocationMethod)}
            </span>
          </p>
        </div>

        <div className="mb-4">
          <label
            htmlFor="agent"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Select Agent
          </label>
          {isLoadingAgents ? (
            <div className="py-2 text-center text-gray-500">
              Loading available agents...
            </div>
          ) : (
            <select
              id="agent"
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Select an agent --</option>
              {console.log(availableAgents)}
              {availableAgents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({agent.phone})
                </option>
              ))}
            </select>
          )}
        </div>

        {assignmentError && (
          <div className="mb-4 text-sm text-red-600">
            {assignmentError}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              setShowAssignModal(false);
              setAssignmentError(null);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={assignAgent}
            disabled={isAssigning}
            className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${
              isAssigning
                ? "bg-blue-400"
                : "bg-blue-600 hover:bg-blue-700"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {isAssigning ? "Assigning..." : "Assign Agent"}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default DispatchSidebar;
