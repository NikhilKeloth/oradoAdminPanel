import React, { useEffect, useState } from "react";
import {
  Users,
  Trophy,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  Award,
  X,
  Check,
  Clock,
  Target,
  DollarSign,
  Gift,
  User,
} from "lucide-react";
import {
  createMilestone,
  deleteMilestone,
  getAllMilestones,
  updateMilestone,
} from "../../../apis/adminApis/milestoneApi";
import { getAgentMilestoneProgressSummary } from "../../../apis/adminApis/agentApi"; // Import the function

function App() {
  const [activeTab, setActiveTab] = useState("milestones");
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    level: "",
    totalDeliveries: "",
    onTimeDeliveries: "",
    totalEarnings: "",
    rewardName: "",
    rewardDescription: "",
    rewardImageUrl: "",
    status: "Active",
  });

  // Mock data
  const [milestones, setMilestones] = useState([
    {
      id: "1",
      level: 1,
      title: "100 On-Time Deliveries",
      description: "Complete 100 deliveries on time",
      conditions: { onTimeDeliveries: 100 },
      reward: {
        name: "T-Shirt",
        description: "Premium quality branded t-shirt",
        imageUrl: "/shirt.jpg",
      },
      status: "Active",
      levelBadgeUrl: "/badge1.png",
    },
    {
      id: "2",
      level: 2,
      title: "200 Total Deliveries",
      description: "Complete 200 total deliveries",
      conditions: { totalDeliveries: 200 },
      reward: {
        name: "Smartwatch",
        description: "Fitness tracking smartwatch",
        imageUrl: "/watch.jpg",
      },
      status: "Active",
      levelBadgeUrl: "/badge2.png",
    },
    {
      id: "3",
      level: 3,
      title: "₹50,000 Earnings",
      description: "Earn ₹50,000 total",
      conditions: { totalEarnings: 50000 },
      reward: {
        name: "Headphones",
        description: "Wireless noise-cancelling headphones",
        imageUrl: "/headphones.jpg",
      },
      status: "Active",
      levelBadgeUrl: "/badge3.png",
    },
  ]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [agentProgress, setAgentProgress] = useState([]); // State for agent progress data
  const [selectedConditions, setSelectedConditions] = useState({
    totalDeliveries: false,
    onTimeDeliveries: false,
    totalEarnings: false,
  });

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        setLoading(true);
        const response = await getAllMilestones(); // call backend
        console.log(response);
        setMilestones(response.milestones || []); // set data
      } catch (err) {
        console.error("Error fetching milestones:", err);
        setError(err.message || "Failed to fetch milestones");
      } finally {
        setLoading(false);
      }
    };

    const fetchAgentMilestoneProgressSummary = async () => {
      try {
        const response = await getAgentMilestoneProgressSummary();
        console.log("Agent milestone progress summary:", response.summary);
        // Transform the API response to match your component's expected format
        if (response ) {
          const transformedData = response.summary.map(agent => ({
            id: agent.agentId,
            agentName: agent.agentName || `Agent ${agent.agentId}`,
            level: agent.level || 1,
            milestoneId: agent.currentMilestoneId,
            milestoneTitle: agent.milestoneTitle || "Current Milestone",
            progress: {
              current: agent.progressCurrent || 0,
              target: agent.progressTarget || 100,
              type: agent.progressType || "total"
            },
            status: agent.status || "In Progress"
          }));
          setAgentProgress(transformedData);
        }
      } catch (err) {
        console.error("Error fetching agent milestone progress summary:", err);
        // You can set a fallback or show an error message
        showNotification("error", "Failed to load agent progress data");
      }
    };

    fetchMilestones();
    
    // Fetch agent progress when the progress tab is active or when component mounts
    if (activeTab === "progress") {
      fetchAgentMilestoneProgressSummary();
    }
  }, [activeTab]);

  // Fetch agent progress when switching to progress tab
  useEffect(() => {
    if (activeTab === "progress") {
      const fetchAgentProgress = async () => {
        try {
          const response = await getAgentMilestoneProgressSummary();
          console.log("Agent milestone progress summary:", response);
          if (response && response.data) {
            const transformedData = response.data.map(agent => ({
              id: agent.agentId,
              agentName: agent.agentName || `Agent ${agent.agentId}`,
              level: agent.currentLevel || 1,
              milestoneId: agent.currentMilestoneId,
              milestoneTitle: agent.currentMilestoneTitle || "Current Milestone",
              progress: {
                current: agent.progressCurrent || 0,
                target: agent.progressTarget || 100,
                type: agent.progressType || "total"
              },
              status: agent.status || "In Progress"
            }));
            setAgentProgress(transformedData);
          }
        } catch (err) {
          console.error("Error fetching agent milestone progress summary:", err);
          showNotification("error", "Failed to load agent progress data");
        }
      };
      
      fetchAgentProgress();
    }
  }, [activeTab]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteMilestone = async(id) => {
    try {
      if (
        window.confirm(
          "Are you sure you want to delete this milestone? This action cannot be undone."
        )
      ) {
        setMilestones((prev) => prev.filter((m) => m._id !== id));
        const response = await deleteMilestone(id); // call backend
        console.log(response)
        showNotification("success", "Milestone deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting milestone:", error);
      showNotification("error", "Failed to delete milestone");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getConditionDisplay = (conditions) => {
    const parts = [];

    if (conditions.totalDeliveries) {
      parts.push(`Total: ${conditions.totalDeliveries}`);
    }
    if (conditions.onTimeDeliveries) {
      parts.push(`On-Time: ${conditions.onTimeDeliveries}`);
    }
    if (conditions.totalEarnings) {
      parts.push(`Earnings: ₹${conditions.totalEarnings.toLocaleString()}`);
    }

    return parts.length > 0 ? parts.join(" | ") : "No conditions";
  };

  const getProgressDisplay = (progress) => {
    const percentage = (progress.current / progress.target) * 100;
    return { percentage, text: `${progress.current}/${progress.target}` };
  };

  // Handle condition checkbox changes
  const handleCheckboxChange = (condition) => {
    setSelectedConditions((prev) => ({
      ...prev,
      [condition]: !prev[condition],
    }));
  };

  // Reset form when opening/closing modal
  const resetForm = () => {
    setFormData({
      title: "",
      level: "",
      description: "",
      conditionType: "",
      totalDeliveries: "",
      onTimeDeliveries: "",
      totalEarnings: "",
      rewardName: "",
      rewardDescription: "",
      rewardImageUrl: "",
      status: "Active",
    });
    setSelectedConditions({
      totalDeliveries: false,
      onTimeDeliveries: false,
      totalEarnings: false,
    });
    setEditingMilestone(null);
    setShowMilestoneForm(false);
  };

  // Populate form when editing a milestone
  const populateFormForEdit = (milestone) => {
    setFormData({
      title: milestone.title,
      level: milestone.level,
      description: milestone.description,
      totalDeliveries: milestone.conditions.totalDeliveries || '',
      onTimeDeliveries: milestone.conditions.onTimeDeliveries || '',
      totalEarnings: milestone.conditions.totalEarnings || '',
      rewardName: milestone.reward.name,
      rewardDescription: milestone.reward.description,
      rewardImageUrl: milestone.reward.imageUrl,
      status: milestone.status
    });
    
    // Set selected conditions based on what's in the milestone
    setSelectedConditions({
      totalDeliveries: milestone.conditions.totalDeliveries != null,
      onTimeDeliveries: milestone.conditions.onTimeDeliveries != null,
      totalEarnings: milestone.conditions.totalEarnings != null,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.level || !formData.rewardName) {
      showNotification("error", "Please fill in all required fields");
      return;
    }

    // ✅ Collect conditions dynamically (multiple conditions allowed)
    const conditions = {};
    if (formData.totalDeliveries) {
      conditions.totalDeliveries = parseInt(formData.totalDeliveries);
    }
    if (formData.onTimeDeliveries) {
      conditions.onTimeDeliveries = parseInt(formData.onTimeDeliveries);
    }
    if (formData.totalEarnings) {
      conditions.totalEarnings = parseInt(formData.totalEarnings);
    }

    if (Object.keys(conditions).length === 0) {
      showNotification("error", "Please select at least one condition");
      return;
    }

    const milestoneData = {
      title: formData.title,
      description: formData.description,
      level: parseInt(formData.level),
      conditions,
      reward: {
        name: formData.rewardName,
        description: formData.rewardDescription,
        imageUrl: formData.rewardImageUrl,
      },
      status: formData.status,
    };

    try {
      let response;
      if (editingMilestone) {
        response = await updateMilestone(editingMilestone._id, milestoneData);
        setMilestones((prev) =>
          prev.map((m) =>
            m._id === editingMilestone._id ? response.milestone : m
          )
        );
        showNotification("success", "Milestone updated successfully!");
      } else {
        response = await createMilestone(milestoneData);
        setMilestones((prev) => [...prev, response.milestone]);
        showNotification("success", "Milestone created successfully!");
      }
      resetForm();
    } catch (error) {
      console.error("Error submitting milestone:", error);
      showNotification("error", error.message || "Something went wrong while saving milestone");
    }
  };  

  // Open modal for editing or creating
  const openModal = (milestone = null) => {
    if (milestone) {
      setEditingMilestone(milestone);
      populateFormForEdit(milestone);
    } else {
      setEditingMilestone(null);
      setFormData({
        title: "",
        level: "",
        description: "",
        conditionType: "",
        totalDeliveries: "",
        onTimeDeliveries: "",
        totalEarnings: "",
        rewardName: "",
        rewardDescription: "",
        rewardImageUrl: "",
        status: "Active",
      });
      setSelectedConditions({
        totalDeliveries: false,
        onTimeDeliveries: false,
        totalEarnings: false,
      });
    }
    setShowMilestoneForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-7 h-7 text-blue-600" />
            Admin Panel
          </h1>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
            notification.type === "success"
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <Check className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            {notification.message}
          </div>
        </div>
      )}

      <div className="px-6 py-6">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("milestones")}
              className={`px-6 py-4 font-medium text-sm transition-colors duration-200 flex items-center gap-2 ${
                activeTab === "milestones"
                  ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Trophy className="w-4 h-4" />
              Milestones
            </button>
            <button
              onClick={() => setActiveTab("progress")}
              className={`px-6 py-4 font-medium text-sm transition-colors duration-200 flex items-center gap-2 ${
                activeTab === "progress"
                  ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Users className="w-4 h-4" />
              Agent Progress
            </button>
          </div>

          <div className="p-6">
            {activeTab === "milestones" ? (
              <div className="space-y-6">
                {/* Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <button
                    onClick={() => openModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 w-fit"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Milestone
                  </button>

                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search milestones..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <Filter className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Milestones Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Level
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Conditions
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reward
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {milestones
                        .filter((milestone) =>
                          milestone.title
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                        )
                        .map((milestone) => (
                          <tr
                            key={milestone._id}
                            className="hover:bg-gray-50 transition-colors duration-150"
                          >
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                                <span className="font-medium text-gray-900">
                                  {milestone.level}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {milestone.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {milestone.description}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900 align-top">
                              <div className="flex  flex-col  flex-wrap gap-2">
                                {milestone.conditions.totalDeliveries  != null && (
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                    🚚 Total Deliveries: {milestone.conditions.totalDeliveries}
                                  </span>
                                )}
                                {milestone.conditions.onTimeDeliveries  != null && (
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                    ⏰ On-Time Deliveries: {milestone.conditions.onTimeDeliveries}
                                  </span>
                                )}
                                {milestone.conditions.totalEarnings  != null && (
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                    💰 Earnings Required: ₹{milestone.conditions.totalEarnings.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center">
                                <Gift className="w-4 h-4 text-purple-500 mr-2" />
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {milestone.reward.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {milestone.reward.description}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  milestone.active
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {milestone.status}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openModal(milestone)}
                                  className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors duration-150"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteMilestone(milestone._id)
                                  }
                                  className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors duration-150"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Agent Progress
                  </h2>

                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search agents..."
                        className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <Filter className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Agent Progress Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Agent Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Level
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Milestone Title
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Progress
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {agentProgress.map((agent) => {
                        const { percentage, text } = getProgressDisplay(
                          agent.progress
                        );
                        return (
                          <tr
                            key={agent.id}
                            className="hover:bg-gray-50 transition-colors duration-150"
                          >
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <User className="w-5 h-5 text-gray-400 mr-3" />
                                <span className="font-medium text-gray-900">
                                  {agent.agentName}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Trophy className="w-4 h-4 text-yellow-500 mr-2" />
                                <span className="font-medium text-gray-900">
                                  {agent.level}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900">
                              {agent.milestoneTitle}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center">
                                <div className="flex-1 mr-3">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">
                                      {text}
                                    </span>
                                    <span className="text-gray-500">
                                      {Math.round(percentage)}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                    <div
                                      className={`h-2 rounded-full transition-all duration-300 ${
                                        percentage === 100
                                          ? "bg-green-500"
                                          : "bg-blue-500"
                                      }`}
                                      style={{
                                        width: `${Math.min(percentage, 100)}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  agent.status === "Completed"
                                    ? "bg-green-100 text-green-800"
                                    : agent.status === "Rewarded"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {agent.status === "In Progress" && (
                                  <Clock className="w-3 h-3 mr-1" />
                                )}
                                {agent.status === "Completed" && (
                                  <Check className="w-3 h-3 mr-1" />
                                )}
                                {agent.status === "Rewarded" && (
                                  <Award className="w-3 h-3 mr-1" />
                                )}
                                {agent.status}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <button className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors duration-150">
                                  <Eye className="w-4 h-4" />
                                </button>
                                {agent.status === "Completed" && (
                                  <button
                                    onClick={() =>
                                      showNotification(
                                        "success",
                                        `Reward awarded to ${agent.agentName}!`
                                      )
                                    }
                                    className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors duration-150"
                                  >
                                    <Award className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Milestone Form Modal */}
      {showMilestoneForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {editingMilestone
                        ? "Edit Milestone"
                        : "Create New Milestone"}
                    </h2>
                    <p className="text-blue-100 text-sm">
                      {editingMilestone
                        ? "Update milestone details and conditions"
                        : "Set up a new milestone with rewards and conditions"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetForm}
                  className="text-white hover:text-blue-200 transition-colors duration-200 p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="max-h-[calc(95vh-120px)] overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-8">
                {/* Basic Information Section */}
                <div className="mb-8">
                  <div className="flex items-center mb-6">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Basic Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Milestone Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="e.g., 100 On-Time Deliveries"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Level <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Trophy className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="number"
                          name="level"
                          value={formData.level}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="1"
                          min="1"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      rows={3}
                      placeholder="Describe what agents need to achieve for this milestone..."
                    />
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-center mb-6">
                    <div className="bg-green-100 p-2 rounded-lg mr-3">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Achievement Conditions
                    </h3>
                    <span className="ml-3 text-sm text-gray-500">
                      (Select at least one)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Deliveries */}
                    <div
                      className={`bg-gray-50 p-6 rounded-xl border-2 transition-all duration-200 ${
                        selectedConditions.totalDeliveries
                          ? "border-blue-500"
                          : "border-transparent hover:border-blue-200"
                      }`}
                    >
                      <div className="flex items-center mb-4">
                        <input
                          type="checkbox"
                          checked={selectedConditions.totalDeliveries}
                          onChange={() => handleCheckboxChange("totalDeliveries")}
                          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <Target className="w-5 h-5 text-blue-500 ml-3 mr-2" />
                        <label className="font-medium text-gray-900">
                          Total Deliveries
                        </label>
                      </div>
                      <input
                        type="number"
                        name="totalDeliveries"
                        value={formData.totalDeliveries}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 200"
                        disabled={!selectedConditions.totalDeliveries}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Total number of deliveries completed
                      </p>
                    </div>

                    {/* On-Time Deliveries */}
                    <div
                      className={`bg-gray-50 p-6 rounded-xl border-2 transition-all duration-200 ${
                        selectedConditions.onTimeDeliveries
                          ? "border-green-500"
                          : "border-transparent hover:border-green-200"
                      }`}
                    >
                      <div className="flex items-center mb-4">
                        <input
                          type="checkbox"
                          checked={selectedConditions.onTimeDeliveries}
                          onChange={() => handleCheckboxChange("onTimeDeliveries")}
                          className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <Clock className="w-5 h-5 text-green-500 ml-3 mr-2" />
                        <label className="font-medium text-gray-900">
                          On-Time Deliveries
                        </label>
                      </div>
                      <input
                        type="number"
                        name="onTimeDeliveries"
                        value={formData.onTimeDeliveries}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., 100"
                        disabled={!selectedConditions.onTimeDeliveries}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Deliveries completed on or before time
                      </p>
                    </div>

                    {/* Total Earnings */}
                    <div
                      className={`bg-gray-50 p-6 rounded-xl border-2 transition-all duration-200 ${
                        selectedConditions.totalEarnings
                          ? "border-yellow-500"
                          : "border-transparent hover:border-yellow-200"
                      }`}
                    >
                      <div className="flex items-center mb-4">
                        <input
                          type="checkbox"
                          checked={selectedConditions.totalEarnings}
                          onChange={() => handleCheckboxChange("totalEarnings")}
                          className="h-5 w-5 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                        />
                        <DollarSign className="w-5 h-5 text-yellow-500 ml-3 mr-2" />
                        <label className="font-medium text-gray-900">
                          Total Earnings
                        </label>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          ₹
                        </span>
                        <input
                          type="number"
                          name="totalEarnings"
                          value={formData.totalEarnings}
                          onChange={handleInputChange}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          placeholder="e.g., 50000"
                          disabled={!selectedConditions.totalEarnings}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Total earnings accumulated
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reward Section */}
                <div className="mb-8">
                  <div className="flex items-center mb-6">
                    <div className="bg-purple-100 p-2 rounded-lg mr-3">
                      <Gift className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Reward Details
                    </h3>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reward Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="rewardName"
                          value={formData.rewardName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          placeholder="e.g., Premium T-Shirt"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reward Image URL
                        </label>
                        <input
                          type="url"
                          name="rewardImageUrl"
                          value={formData.rewardImageUrl}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          placeholder="https://example.com/reward-image.jpg"
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reward Description
                      </label>
                      <textarea
                        name="rewardDescription"
                        value={formData.rewardDescription}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                        rows={3}
                        placeholder="Describe the reward in detail..."
                      />
                    </div>

                    <div className="mt-6 p-4 bg-white rounded-lg border border-purple-200">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Reward Preview
                      </h4>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          {formData.rewardImageUrl ? (
                            <img
                              src={formData.rewardImageUrl}
                              alt="Reward"
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : (
                            <Gift className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {formData.rewardName || "Reward Name"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formData.rewardDescription ||
                              "Reward description will appear here"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Section */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="bg-gray-100 p-2 rounded-lg mr-3">
                      <Eye className="w-5 h-5 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Status
                    </h3>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="status"
                            checked={formData.status === "Active"}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                status: e.target.checked
                                  ? "Active"
                                  : "Inactive",
                              }))
                            }
                            className="sr-only"
                          />
                          <div className="relative w-12 h-6 bg-gray-300 rounded-full transition-colors duration-200">
                            <div
                              className={`absolute inset-0 rounded-full transition-colors duration-200 ${
                                formData.status === "Active"
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            ></div>
                            <div
                              className={`absolute inset-y-0 w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-200 ${
                                formData.status === "Active"
                                  ? "translate-x-6"
                                  : "translate-x-0"
                              }`}
                            ></div>
                          </div>
                          <span className="ml-3 font-medium text-gray-900">
                            Active Milestone
                          </span>
                        </label>
                        <p className="text-sm text-gray-500 mt-1">
                          Agents can work towards this milestone when active
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                            formData.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {formData.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 -mx-8 -mb-8">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      <span className="text-red-500">*</span> Required fields
                    </div>
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-3 text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg font-medium transition-all duration-200 hover:shadow-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 flex items-center space-x-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>
                          {editingMilestone
                            ? "Update Milestone"
                            : "Create Milestone"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;