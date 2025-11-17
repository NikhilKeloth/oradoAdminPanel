import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useRoutes } from 'react-router-dom';
import AgentRatings from './AgentRatings';
import AgentDeliveryDash from './AgentDeliveryDash';
import AgentEarningsDash from './AgentEarningsDash';
import { Calendar, ChevronDown } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import AgentAdminRemarksDash from './AgentAdminRemarksDash';
import AgentWarningsApprovalsTerminationsDash from './AgentWarningsApprovalsTerminationsDash';
import AgentMilestoneDash from './AgentMilestoneDash';
import { getAgentBasicDetails, getAgentCurrentTask, getAgentLeaves, getAgentTodaySummary } from '../../apis/adminApis/agentApi';
import { useParams } from 'react-router-dom';
const dummyAgents = [
  { 
    id: '101', 
    fullName: 'Alice Johnson', 
    image: '', 
    phoneNumber: '9876543210', 
    email: 'alice@example.com', 
    status: 'Active', 
    registrationDate: '2022-05-15',
    lastActive: '2023-06-20 14:30',
    address: '123 Main St, Bangalore, KA',
    vehicle: 'Bike - KA01AB1234',
    rating: 4.8,
    totalDeliveries: 342,
    dutyHours: {
      lifetime: 2456,
      thisMonth: 176,
      today: 8
    },
    currentDutyTime: '4h 30m',
    attendance: {
      monthly: 92.5,
      lifetime: 95.2
    },
    leaveRecords: [
      { date: '2023-05-10', type: 'Casual', days: 1 },
      { date: '2023-04-15', type: 'Sick', days: 2 },
      { date: '2023-03-05', type: 'Emergency', days: 1 },
      { date: '2023-02-18', type: 'Casual', days: 3 },
      { date: '2023-01-25', type: 'Sick', days: 1 },
      { date: '2022-12-10', type: 'Emergency', days: 2 },
      { date: '2022-11-05', type: 'Casual', days: 1 },
      { date: '2022-10-20', type: 'Sick', days: 4 }
    ],
    nextDuty: '2023-06-21 09:00'
  },
];

const statusColors = {
  'Active': 'bg-green-50 text-green-700 border-green-200',
  'On-Duty': 'bg-blue-50 text-blue-700 border-blue-200',
  'On-Leave': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Terminated': 'bg-red-50 text-red-700 border-red-200',
  'Suspended': 'bg-orange-50 text-orange-700 border-orange-200',
  'Online': 'bg-green-50 text-green-700 border-green-200',
  'Offline': 'bg-gray-50 text-gray-700 border-gray-200'
};

const statusIcons = {
  'Active': '🟢',
  'On-Duty': '🚴',
  'On-Leave': '🏖️',
  'Terminated': '⛔',
  'Suspended': '⚠️',
  'Online': '🟢',
  'Offline': '⚪'
};

export default function AgentDetails() {
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllLeaves, setShowAllLeaves] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);

    const [todaySummary, setTodaySummary] = useState(null)
  const agentId = useParams().agentId;


  // New state for tab component navigation differnet different
  const [activeTab, setActiveTab] = useState('delivery');
  const [leave, setLeave] = useState([]);
  // Tab configuration to see diff diff components 
  const tabs = [
    { id: 'delivery', label: 'Delivery Stats', component: <AgentDeliveryDash currentTask={currentTask}  todaySummary={todaySummary} /> },
    { id: 'earnings', label: 'Earnings', component: <AgentEarningsDash /> },
    { id: 'reports', label: 'Reports', component: <AgentWarningsApprovalsTerminationsDash /> },
    // { id: 'milestone', label: 'Agent Milestone', component: <AgentMilestoneDash /> },
    // { id: 'ratings', label: 'Ratings & Reviews', component: <AgentRatings /> },
    // { id: 'remarks', label: 'Admin Remarks', component: <AgentAdminRemarksDash /> },
  ];
  
  
  // Date picker state for Duty & Attendance section
  const [showDatePicker, setShowDatePicker] = useState(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(2025, 6, 7),
    to: new Date(2025, 6, 14)
  });
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchAgentDetails = async () => {
      try {
        const response = await getAgentBasicDetails(agentId);
        console.log("Fetched agent details:", response);
        setLoading(false);
        setAgent(response.data);
      } catch (err) {
        console.error("Error fetching agent details:", err);
      }
    };

    const fetchAgentLeves = async () => {
      try {
        const response = await getAgentLeaves(agentId);
        console.log("Fetched agent leave records:", response);
        setLeave(response.data);
      } catch (error) {
        console.error("Error fetching agent leave records:", error);
      }
    };



      const fetchTodaySummary = async () => {
      try {
        setLoading(true);
        const response = await getAgentTodaySummary(agentId);
        
        if (response.success) {
          setTodaySummary(response.summary);
        } else {
          setError(response.message || 'Failed to fetch today summary');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };
     fetchTodaySummary();




    fetchAgentLeves(); // <-- This is the correct function name
    fetchAgentDetails();

    // Fetch current task for the agent
    const getCurrentTask = async () => {
      try {
      const response = await getAgentCurrentTask(agentId);

      setCurrentTask(response.data);

      console.log('Fetched current task:', response.data);
      } catch (error) {
      console.error('Error fetching current task:', error);
      }
    };

    getCurrentTask();
  }, []);

  // Date Picker Component
  const DatePicker = ({ type }) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const generateCalendar = (month, year) => {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDay = new Date(year, month, 1).getDay();
      const days = [];
      
      for (let i = 0; i < firstDay; i++) {
        days.push(null);
      }
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
      }
      return days;
    };

    const days = generateCalendar(currentMonth, currentYear);

    const handleDateClick = (day) => {
      if (day) {
        const selectedDate = new Date(currentYear, currentMonth, day);
        if (type === 'from') {
          setDateRange({...dateRange, from: selectedDate});
        } else {
          setDateRange({...dateRange, to: selectedDate});
        }
        setShowDatePicker(null);
      }
    };

    const changeMonth = (increment) => {
      let newMonth = currentMonth + increment;
      let newYear = currentYear;
      
      if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      }
      
      setCurrentMonth(newMonth);
      setCurrentYear(newYear);
    };

    const isSelected = (day) => {
      if (!day) return false;
      const date = new Date(currentYear, currentMonth, day);
      if (type === 'from') {
        return date.getTime() === dateRange.from.getTime();
      } else {
        return date.getTime() === dateRange.to.getTime();
      }
    };

    const isInRange = (day) => {
      if (!day) return false;
      const date = new Date(currentYear, currentMonth, day);
      return date >= dateRange.from && date <= dateRange.to;
    };

    return (
      <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 z-50 w-72">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => changeMonth(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronDown className="w-4 h-4 rotate-90" />
          </button>
          <span className="text-sm font-semibold text-gray-700">
            {months[currentMonth]} {currentYear}
          </span>
          <button 
            onClick={() => changeMonth(1)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronDown className="w-4 h-4 -rotate-90" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 p-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div
              key={index}
              onClick={() => handleDateClick(day)}
              className={`text-center text-sm p-2 cursor-pointer rounded-lg transition-all duration-200 ${
                isSelected(day) ? 'bg-orange-500 text-white font-semibold' : 
                isInRange(day) ? 'bg-orange-100 text-orange-600' :
                day ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300'
              }`}
            >
              {day || ''}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Agent Not Found</h2>
          <p className="text-gray-600">The agent with ID doesn't exist in our records.</p>
          <button className="mt-4 inline-block px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            Back to Agents
          </button>
        </div>
      </div>
    );
  }

  const displayedLeaves = showAllLeaves ? leave : leave.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto space-y-6"
      >
        {/* Header with back button */}
<div className="flex items-center">
  <Link to="/oradoadmin/admin/agent-slider/agent/list">
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center text-orange-600 font-medium hover:text-orange-700 transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
      </svg>
      Back to Agents
    </motion.button>
  </Link>
</div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 sm:p-6 text-white">
            <div className="flex flex-col md:flex-row items-center">
              <div className="relative mb-4 md:mb-0 md:mr-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white flex items-center justify-center shadow-lg overflow-hidden border-4 border-white"
                >
                  <img 
                    src={agent.image || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} 
                    alt={agent.fullName}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </div>
              
              <div className="text-center md:text-left">
                <motion.h1 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl sm:text-2xl md:text-3xl font-bold mb-1"
                >
                  {agent.fullName}
                </motion.h1>
                <motion.p 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-orange-100 mb-2 text-sm sm:text-base"
                >
                  Agent ID: {agent.id}
                </motion.p>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${statusColors[agent.status] || 'bg-gray-100 text-gray-800'} bg-white`}
                >
                  {agent.status}
                </motion.span>
              </div>
            </div>
          </div>

          {/* Agent Information Section */}
          <div className="p-4 sm:p-6 md:p-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">Agent Information</h2>
            
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-50 rounded-lg p-4 sm:p-6"
              >
                <h3 className="font-semibold text-gray-800 mb-6 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Personal Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <DetailItem label="Full Name" value={agent.fullName} />
                  {/* <DetailItem label="Agent ID" value={agent.id} /> */}
                  <DetailItem label="Phone" value={agent.phoneNumber} />
                  <DetailItem label="Email" value={agent.email} />
                  {/* <DetailItem label="Registration Date" value={new Date(agent.registrationDate).toLocaleDateString()} /> */}
                  <DetailItem label="Status" value={
                    <span className={`px-4 py-2 -ml-3 rounded-full text-sm font-semibold border ${statusColors[agent.status] || 'bg-gray-100 text-gray-800'}`}>
                      {agent.status}
                    </span>
                  } />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

  {/* Separate Duty & Attendance Card */}
<motion.div 
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.5 }}
  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
>
        </motion.div>
      

{/* ---- component navigation starts here ----- */}

     {/* Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="relative">
            <div className="flex overflow-x-auto scrollbar-hide">
              <div className="flex space-x-1 px-2 py-2 sm:px-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                      activeTab === tab.id 
                        ? 'text-white' 
                        : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                    }`}
                  >
                    {activeTab === tab.id && (
                      <motion.span
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-sm z-0"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center">
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Active Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {tabs.find(tab => tab.id === activeTab)?.component}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="flex flex-col space-y-3">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <div className="text-base font-semibold text-gray-900">{value || '-'}</div>
    </div>
  );
}