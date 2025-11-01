import { useEffect, useState, useCallback } from "react";
import apiClient from "../apis/apiClient/apiClient";
import DeliveryMap from "../components/AgentAdminDashboard/DeliveryMap";
import TopbarFilter from "../components/AgentAdminDashboard/TopbarFilter";
import DispatchSidebar from "../components/AgentAdminDashboard/DispatchSidebar";
import AgentStatusPanel from "../components/AgentAdminDashboard/AgentStatusPanel";
import socket from "../services/socket";
import { toast } from "react-toastify";

const AdminAgentDashboardLayout = () => {
  const [agents, setAgents] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterParams, setFilterParams] = useState({ period: "today" });
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [orderLocations, setOrderLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  const [dispatchOrders, setDispatchOrders] = useState([]);
  const [flyToAgentId, setFlyToAgentId] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAgentPanelCollapsed, setIsAgentPanelCollapsed] = useState(false);
  // Initialize socket connection and listeners
  useEffect(() => {
    socket.connect();
  
    const adminId = localStorage.getItem("userId");
    if (!adminId) {
      console.error("❌ No admin ID found in session storage");
      setError("Authentication error: Please log in again");
      return;
    }
  
    // --- Socket Event Handlers ---
    const handleConnect = () => {
      console.log("🔌 Socket connected");
      setSocketConnected(true);
      console.log(`🔄 Joining admin room for user: ${adminId}`);
      socket.emit("join-room", { userId: adminId, userType: "admin" });
    };
  
    const handleDisconnect = () => {
      console.log("🔌 Socket disconnected");
      setSocketConnected(false);
    };
  
  const handleAgentLocation = (data) => {
    console.log("📍 Agent location update received:", data);
    const { agentId, lat, lng, deviceInfo } = data;
    if (!agentId || typeof lat !== "number" || typeof lng !== "number") return;

    // Update agent location without triggering map fly-to
    setAgents((prevAgents) =>
      prevAgents.map((agent) =>
        agent._id === agentId
          ? {
              ...agent,
              location: [lng, lat],
              lastUpdated: new Date(),
              deviceInfo: deviceInfo || agent.deviceInfo,
            }
          : agent
      )
    );
  };
  
    const handleAgentAvailabilityUpdate = (data) => {
      const { agentId, availabilityStatus } = data;
      if (!agentId || !["AVAILABLE", "UNAVAILABLE"].includes(availabilityStatus))
        return;
  
      setAgents((prevAgents) =>
        prevAgents.map((agent) =>
          agent._id === agentId
            ? {
                ...agent,
                agentStatus: { ...agent.agentStatus, availabilityStatus },
                lastUpdated: new Date(),
              }
            : agent
        )
      );
    };
  
    const handleAgentStatusUpdate = (data) => {
      const { agentId, status, availabilityStatus, currentOrder } = data;
      setAgents((prevAgents) =>
        prevAgents.map((agent) =>
          agent._id === agentId
            ? {
                ...agent,
                agentStatus: {
                  status: status || agent.agentStatus.status,
                  availabilityStatus:
                    availabilityStatus || agent.agentStatus.availabilityStatus,
                },
                currentOrder: currentOrder || agent.currentOrder,
                lastStatusUpdate: new Date(),
              }
            : agent
        )
      );
    };
  
    const handleNewOrder = (orderData) => {
      const transformedOrder = {
        _id: orderData.orderId,
        dropLocation: {
          coordinates: {
            lat: orderData.deliveryLocation.coordinates[1],
            lng: orderData.deliveryLocation.coordinates[0],
          },
          address: {
            street: (orderData.address || "").split(", ")[0] || "",
            city: (orderData.address || "").split(", ")[1] || "",
            state: (orderData.address || "").split(", ")[2] || "",
            pincode: "",
            country: "India",
          },
        },
        pickupLocation: {
          lat: orderData.restaurantLocation.coordinates[1],
          lng: orderData.restaurantLocation.coordinates[0],
        },
        restaurantName: orderData.restaurantName,
        assignedAgent: null,
        agentAssignmentStatus: orderData.agentAssignmentStatus,
        orderStatus: orderData.orderStatus,
        orderTime: orderData.orderTime,
        paymentMethod: orderData.paymentMethod,
        allocationMethod: "one_by_one",
        items: orderData.orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          totalPrice: item.price * item.quantity,
          image: item.image,
          _id: item._id,
        })),
      };
  
      setDispatchOrders((prevOrders) => [transformedOrder, ...prevOrders]);
      setOrderLocations((prevLocations) => [
        {
          _id: orderData.orderId,
          location: orderData.deliveryLocation,
          status: orderData.orderStatus,
        },
        ...prevLocations,
      ]);
    };
  
    const handleSocketError = (err) => {
      console.error("Socket error:", err);
      setError("Realtime connection issue - some updates may be delayed");
    };
  
    // --- Register listeners ---
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("admin:updateLocation", handleAgentLocation);
    socket.on("admin:agentStatusUpdate", handleAgentStatusUpdate);
    socket.on("admin:agentAvailabilityUpdate", handleAgentAvailabilityUpdate);
    socket.on("new_order", handleNewOrder);
    socket.on("error", handleSocketError);
  
    // --- Cleanup on unmount ---
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("admin:updateLocation", handleAgentLocation);
      socket.off("admin:agentStatusUpdate", handleAgentStatusUpdate);
      socket.off(
        "admin:agentAvailabilityUpdate",
        handleAgentAvailabilityUpdate
      );
      socket.off("new_order", handleNewOrder);
      socket.off("error", handleSocketError);
      socket.disconnect();
    };
  }, []); // ✅ Run only once
  
  // Fetch initial agents and order locations
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch agents
        const agentsRes = await apiClient.get("/admin/agent/list-status");

        const formattedAgents = agentsRes.data.data.map((agent) => ({
          ...agent,
          location: agent.location?.coordinates || [0, 0],
          // Ensure agentStatus has both status and availabilityStatus
          agentStatus: {
            status: agent.agentStatus?.status || "OFFLINE",
            availabilityStatus:
              agent.agentStatus?.availabilityStatus || "UNAVAILABLE",
          },
        }));
        setAgents(formattedAgents);

        // Fetch order locations
        const params = new URLSearchParams();
        params.append("period", filterParams.period);
        if (filterParams.from) params.append("from", filterParams.from);
        if (filterParams.to) params.append("to", filterParams.to);
        if (filterParams.startTime) params.append("startTime", filterParams.startTime);
        if (filterParams.endTime) params.append("endTime", filterParams.endTime);

        const locationsRes = await apiClient.get(
          `/admin/orders/locations?${params.toString()}`
        );

        if (locationsRes.status === 200) {
          setOrderLocations(locationsRes.data.data);
          setDispatchOrders(locationsRes.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterParams]);

  // Refresh data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const params = new URLSearchParams();
      params.append("period", filterParams.period);
      if (filterParams.from) params.append("from", filterParams.from);
      if (filterParams.to) params.append("to", filterParams.to);
      if (filterParams.startTime) params.append("startTime", filterParams.startTime);
      if (filterParams.endTime) params.append("endTime", filterParams.endTime);

      apiClient
        .get(`/admin/orders/locations?${params.toString()}`)
        .then((res) => {
          if (res.status === 200) {
            setDispatchOrders(res.data.data);
          }
        })
        .catch((err) => console.error("Error refreshing data:", err));
    }, 30000);

    return () => clearInterval(interval);
  }, [filterParams]);







  const handleRefresh = async () => {
  try {
 
 
    
    const params = new URLSearchParams();
    params.append("period", filterParams.period);
    if (filterParams.from) params.append("from", filterParams.from);
    if (filterParams.to) params.append("to", filterParams.to);
    if (filterParams.startTime) params.append("startTime", filterParams.startTime);
    if (filterParams.endTime) params.append("endTime", filterParams.endTime);

    // Refresh both orders and agents
    const [ordersRes, agentsRes] = await Promise.all([
      apiClient.get(`/admin/orders/locations?${params.toString()}`),
      apiClient.get("/admin/agent/list-status")
    ]);

    if (ordersRes.status === 200) {
      setDispatchOrders(ordersRes.data.data);
      setOrderLocations(ordersRes.data.data);
    }

    if (agentsRes.status === 200) {
      const formattedAgents = agentsRes.data.data.map((agent) => ({
        ...agent,
        location: agent.location?.coordinates || [0, 0],
        agentStatus: {
          status: agent.agentStatus?.status || "OFFLINE",
          availabilityStatus:
            agent.agentStatus?.availabilityStatus || "UNAVAILABLE",
        },
      }));
      setAgents(formattedAgents);
    }


    // Show success feedback
    toast.success("Data refreshed successfully", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (err) {
    console.error("Refresh failed:", err);

    
    toast.error("Refresh failed. Please try again.", {
      position: "top-right",
      autoClose: 5000,
    });
  } finally {

  }
};

  const handleFilterChange = useCallback((filterData) => {
    setFilterParams(filterData);
  }, []);

  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
  };

  const handleAgentSelect = (agent) => {
    console.log("🎯 Agent selected for fly-to:", agent);
    setFlyToAgentId(agent._id);
    // Clear the fly-to after a short delay to allow the map to fly
    setTimeout(() => {
      setFlyToAgentId(null);
    }, 2000);
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleToggleAgentPanel = () => {
    setIsAgentPanelCollapsed(!isAgentPanelCollapsed);
  };

  return (
    <div className="flex flex-col h-screen overflow-y-auto">
      <TopbarFilter onFilterChange={handleFilterChange} />

      {!socketConnected && (
        <div className="bg-yellow-100 text-yellow-800 p-2 text-center">
          Realtime updates disconnected - showing last known positions
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <DispatchSidebar
          onOrderSelect={handleOrderSelect}
          selectedOrder={selectedOrder}
          dispatchOrders={dispatchOrders}
          onRefresh={handleRefresh}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 min-h-0 relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex items-center justify-center text-red-500">
                {error}
              </div>
            ) : (
              <DeliveryMap
                key={`map-${isSidebarCollapsed}-${isAgentPanelCollapsed}`}
                orderLocations={orderLocations}
                agents={agents}
                selectedAgent={selectedAgent}
                selectedOrder={selectedOrder}
                isLive={socketConnected}
                flyToAgentId={flyToAgentId}
                onFilterChange={() =>{}}
                isSidebarCollapsed={isSidebarCollapsed}
                isAgentPanelCollapsed={isAgentPanelCollapsed}
              />
            )}
          </div>
        </div>

        <AgentStatusPanel
          onAgentSelect={handleAgentSelect}
          agents={agents}
          socketConnected={socketConnected}
          isCollapsed={isAgentPanelCollapsed}
          onToggleCollapse={handleToggleAgentPanel}
        />
      </div>
    </div>
  );
};

export default AdminAgentDashboardLayout;
