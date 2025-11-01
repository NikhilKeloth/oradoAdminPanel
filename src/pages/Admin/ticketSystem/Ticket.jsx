import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  X, 
  Search, 
  Filter, 
  ChevronDown, 
  User, 
  Calendar, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Mail,
  Settings,
  Download,
  RefreshCw,
  MoreHorizontal,
  Users,
  TrendingUp,
  Zap,
  Shield
} from 'lucide-react';
import axios from 'axios';
import LoadingForAdmins from '../AdminUtils/LoadingForAdmins';
import apiClient from '../../../apis/apiClient/apiClient';
import { Send, Plus } from 'lucide-react';





// Create this new component in your Ticket.js file
const TicketReplySection = ({ ticket, onReplySubmit }) => {
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    
    try {
      setIsReplying(true);
      await onReplySubmit(ticket._id, replyMessage);
      setReplyMessage('');
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="mt-6 border-t border-gray-100 pt-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Replies ({ticket.replies?.length || 0})</h4>
      
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
        {ticket.replies?.length > 0 ? (
          ticket.replies.map((reply, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg ${reply.sender === 'admin' ? 'bg-blue-50' : 'bg-gray-50'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-xs font-medium ${reply.sender === 'admin' ? 'text-blue-700' : 'text-gray-700'}`}>
                  {reply.sender === 'admin' ? 'Admin' : 'Customer'}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(reply.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-800">{reply.message}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 italic">No replies yet</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-2">
        <div className="flex items-start space-x-2">
          <textarea
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            placeholder="Type your reply..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
            rows={3}
          />
          <button
            type="submit"
            disabled={isReplying || !replyMessage.trim()}
            className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-orange-400 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};












const Ticket = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    sort: "newest",
    search: "",
    assignedTo: "all",
  });

  // Fetch tickets from API
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");

      const response = await apiClient.get(
        "/tickets/admin/getall",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTickets(response.data.tickets);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load tickets. Please try again later."
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);


  // Add this inside your Ticket component, with your other handlers
const handleAddReply = async (ticketId, message) => {
  try {
    const token = localStorage.getItem('adminToken');
    
    const response = await apiClient.post(
      `/tickets/admin/ticket/${ticketId}/reply`,
      { message },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Update the local state with the new reply
    setTickets(prevTickets => 
      prevTickets.map(ticket => 
        ticket._id === ticketId 
          ? { ...ticket, replies: response.data.ticket.replies } 
          : ticket
      )
    );
    
    return response.data;
  } catch (err) {
    console.error('Error adding reply:', err);
    throw err;
  }
};

  // Update ticket status
  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');

      const response = await apiClient.patch(
        `/tickets/admin/ticket/${ticketId}/status`,
        { status: newStatus },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedStatus = response.data.status;

      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket._id === ticketId ? { ...ticket, status: updatedStatus } : ticket
        )
      );
      fetchTickets();
    } catch (err) {
      console.error('Error updating ticket status:', err);
    }
  };

  // Bulk actions
  const handleBulkStatusUpdate = async (newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // Update each selected ticket
      await Promise.all(
        selectedTickets.map(ticketId => 
          apiClient.patch(
            `/tickets/admin/ticket/${ticketId}/status`,
            { status: newStatus },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            }
          )
        )
      );
      
      // Refresh the ticket list
      fetchTickets();
      setSelectedTickets([]);
    } catch (err) {
      console.error('Error bulk updating ticket statuses:', err);
    }
  };

  // Filter and sort tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus = filters.status === "all" || ticket.status === filters.status;
    const matchesPriority = filters.priority === "all" || ticket.priority === filters.priority;
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(filters.search.toLowerCase()) ||
      ticket.message.toLowerCase().includes(filters.search.toLowerCase()) ||
      (ticket.user?.name && ticket.user.name.toLowerCase().includes(filters.search.toLowerCase()));
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    return filters.sort === "newest"
      ? new Date(b.createdAt) - new Date(a.createdAt)
      : new Date(a.createdAt) - new Date(b.createdAt);
  });

  const statusConfig = {
    open: {
      icon: AlertCircle,
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200",
      label: "Open",
      dot: "bg-red-500"
    },
    in_progress: {
      icon: Clock,
      color: "text-blue-700",
      bg: "bg-blue-50",
      border: "border-blue-200",
      label: "In Progress",
      dot: "bg-blue-500"
    },
    resolved: {
      icon: CheckCircle2,
      color: "text-green-700",
      bg: "bg-green-50",
      border: "border-green-200",
      label: "Resolved",
      dot: "bg-green-500"
    },
    closed: {
      icon: X,
      color: "text-gray-700",
      bg: "bg-gray-50",
      border: "border-gray-200",
      label: "Closed",
      dot: "bg-gray-500"
    },
  };

  const priorityConfig = {
    high: { 
      color: "bg-gradient-to-r from-red-500 to-red-600 text-white", 
      label: "High Priority",
      icon: Zap
    },
    medium: {
      color: "bg-gradient-to-r from-orange-500 to-orange-600 text-white",
      label: "Medium Priority",
      icon: Shield
    },
    low: { 
      color: "bg-gradient-to-r from-green-500 to-green-600 text-white", 
      label: "Low Priority",
      icon: TrendingUp
    },
  };

  const StatusBadge = ({ status }) => {
    const config = statusConfig[status];
    const Icon = config?.icon || Mail;
    return (
      <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${config?.color} ${config?.bg} ${config?.border} border shadow-sm`}>
        <div className={`w-2 h-2 rounded-full ${config?.dot} mr-2`}></div>
        <Icon size={12} className="mr-1" />
        {config?.label || status}
      </div>
    );
  };

  const PriorityBadge = ({ priority }) => {
    const config = priorityConfig[priority];
    const Icon = config?.icon || Shield;
    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${config?.color}`}>
        <Icon size={12} className="mr-1" />
        {config?.label || priority}
      </span>
    );
  };

  if (loading) {
    return (
      <LoadingForAdmins/>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-200 max-w-md">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Error Loading Tickets</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <button 
                onClick={fetchTickets}
                className="mt-4 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Enhanced Header with Gradient */}
      <div className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-20">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Support Center
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage customer support tickets efficiently
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={fetchTickets}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                <Download className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: "Total Tickets",
              value: tickets.length,
              gradient: "from-blue-500 to-blue-600",
              icon: MessageSquare,
              change: "+12%",
              changeType: "increase"
            },
            {
              label: "Open Tickets",
              value: tickets.filter((t) => t.status === "open").length,
              gradient: "from-red-500 to-red-600",
              icon: AlertCircle,
              change: "+8%",
              changeType: "increase"
            },
            {
              label: "In Progress",
              value: tickets.filter((t) => t.status === "in_progress").length,
              gradient: "from-orange-500 to-orange-600",
              icon: Clock,
              change: "-5%",
              changeType: "decrease"
            },
            {
              label: "Resolved",
              value: tickets.filter((t) => t.status === "resolved").length,
              gradient: "from-green-500 to-green-600",
              icon: CheckCircle2,
              change: "+15%",
              changeType: "increase"
            },
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      stat.changeType === 'increase' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-4 rounded-2xl bg-gradient-to-r ${stat.gradient} shadow-lg`}>
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search tickets, customers, or messages..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm transition-colors"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-6 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </button>
            </div>

            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                      <option value="all">All Statuses</option>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={filters.priority}
                      onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    >
                      <option value="all">All Priorities</option>
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={filters.sort}
                      onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => setFilters({
                        status: "all",
                        priority: "all",
                        sort: "newest",
                        search: "",
                        assignedTo: "all",
                      })}
                      className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {selectedTickets.length > 0 && (
            <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Users className="h-4 w-4 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-orange-800">
                    {selectedTickets.length} ticket(s) selected
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleBulkStatusUpdate("resolved")}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => handleBulkStatusUpdate("closed")}
                    className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close Tickets
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Tickets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedTickets.length > 0 ? (
            sortedTickets.map((ticket) => (
              <div key={ticket._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 h-4 w-4"
                        checked={selectedTickets.includes(ticket._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTickets([...selectedTickets, ticket._id]);
                          } else {
                            setSelectedTickets(selectedTickets.filter((id) => id !== ticket._id));
                          }
                        }}
                      />
                      <div className="p-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl">
                        <MessageSquare className="h-5 w-5 text-orange-600" />
                      </div>
                    </div>
                    <button className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{ticket.subject}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{ticket.message}</p>
                  </div>

                  <div className="flex items-center space-x-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{ticket.user?.name || 'Unknown User'}</div>
                        <div className="text-xs text-gray-500">{ticket.user?.email || 'No email provided'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <PriorityBadge priority={ticket.priority} />
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <StatusBadge status={ticket.status} />
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <select
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        value={ticket.status}
                        onChange={(e) => handleStatusUpdate(ticket._id, e.target.value)}
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  {ticket.assignedTo && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center text-xs text-gray-500">
                        <User className="h-3 w-3 mr-1" />
                        Assigned to <span className="font-medium ml-1">{ticket.assignedTo}</span>
                      </div>
                    </div>
                  )}
                    <TicketReplySection 
        ticket={ticket} 
        onReplySubmit={handleAddReply}
      />
    
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
                <button
                  onClick={() => setFilters({
                    status: "all", priority: "all", sort: "newest", search: "", assignedTo: "all"
                  })}
                  className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Pagination */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">{sortedTickets.length}</span> of{" "}
            <span className="font-medium text-gray-900">{tickets.length}</span> tickets
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            <button className="px-3 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              1
            </button>
            <button className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              2
            </button>
            <button className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              3
            </button>
            <button className="flex items-center px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ticket;