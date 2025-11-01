import React, { useState } from 'react';
import AnalyticsDashboardSwitcher from './AnalyticsDashboardSwitcher';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Users, UserPlus, Activity, UserX, TrendingUp, ShoppingCart, Award, Calendar, BarChart3, ChevronDown } from 'lucide-react';

const UserAnalytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Separate time periods for each section
  const [overviewPeriod, setOverviewPeriod] = useState('Last Month');
  const [cardsPeriod, setCardsPeriod] = useState('Last Month');
  const [activityPeriod, setActivityPeriod] = useState('Last Month');
  const [itemsPeriod, setItemsPeriod] = useState('Last Month');

  // Separate date picker states for each section
  const [cardsShowDatePicker, setCardsShowDatePicker] = useState(null);
  const [overviewShowDatePicker, setOverviewShowDatePicker] = useState(null);
  const [activityShowDatePicker, setActivityShowDatePicker] = useState(null);
  const [itemsShowDatePicker, setItemsShowDatePicker] = useState(null);
  
  // Separate date ranges for each section
  const [cardsDateRange, setCardsDateRange] = useState({
    from: new Date(2025, 6, 7),
    to: new Date(2025, 6, 14)
  });
  const [overviewDateRange, setOverviewDateRange] = useState({
    from: new Date(2025, 6, 7),
    to: new Date(2025, 6, 14)
  });
  const [activityDateRange, setActivityDateRange] = useState({
    from: new Date(2025, 6, 7),
    to: new Date(2025, 6, 14)
  });
  const [itemsDateRange, setItemsDateRange] = useState({
    from: new Date(2025, 6, 7),
    to: new Date(2025, 6, 14)
  });
  
  // Separate calendar states for each section
  const [cardsCurrentMonth, setCardsCurrentMonth] = useState(new Date().getMonth());
  const [cardsCurrentYear, setCardsCurrentYear] = useState(new Date().getFullYear());
  const [overviewCurrentMonth, setOverviewCurrentMonth] = useState(new Date().getMonth());
  const [overviewCurrentYear, setOverviewCurrentYear] = useState(new Date().getFullYear());
  const [activityCurrentMonth, setActivityCurrentMonth] = useState(new Date().getMonth());
  const [activityCurrentYear, setActivityCurrentYear] = useState(new Date().getFullYear());
  const [itemsCurrentMonth, setItemsCurrentMonth] = useState(new Date().getMonth());
  const [itemsCurrentYear, setItemsCurrentYear] = useState(new Date().getFullYear());

  // Mock data for different periods
  const mockData = {
    'Today': {
      inactiveUsers: [
        { period: '12AM', count: 15 },
        { period: '3AM', count: 10 },
        { period: '6AM', count: 8 },
        { period: '9AM', count: 12 },
        { period: '12PM', count: 18 },
        { period: '3PM', count: 22 },
        { period: '6PM', count: 15 },
        { period: '9PM', count: 10 }
      ],
      signups: [
        { period: '12AM', count: 5 },
        { period: '3AM', count: 3 },
        { period: '6AM', count: 7 },
        { period: '9AM', count: 15 },
        { period: '12PM', count: 22 },
        { period: '3PM', count: 18 },
        { period: '6PM', count: 12 },
        { period: '9PM', count: 8 }
      ],
      activeUsers: [
        { period: '12AM', count: 120 },
        { period: '3AM', count: 80 },
        { period: '6AM', count: 150 },
        { period: '9AM', count: 420 },
        { period: '12PM', count: 780 },
        { period: '3PM', count: 950 },
        { period: '6PM', count: 820 },
        { period: '9PM', count: 580 }
      ]
    },
    'Last Week': {
      inactiveUsers: [
        { period: 'Mon', count: 120 },
        { period: 'Tue', count: 98 },
        { period: 'Wed', count: 115 },
        { period: 'Thu', count: 89 },
        { period: 'Fri', count: 76 },
        { period: 'Sat', count: 65 },
        { period: 'Sun', count: 82 }
      ],
      signups: [
        { period: 'Mon', count: 45 },
        { period: 'Tue', count: 52 },
        { period: 'Wed', count: 38 },
        { period: 'Thu', count: 61 },
        { period: 'Fri', count: 48 },
        { period: 'Sat', count: 39 },
        { period: 'Sun', count: 44 }
      ],
      activeUsers: [
        { period: 'Mon', count: 1250 },
        { period: 'Tue', count: 1180 },
        { period: 'Wed', count: 1320 },
        { period: 'Thu', count: 1450 },
        { period: 'Fri', count: 1580 },
        { period: 'Sat', count: 1620 },
        { period: 'Sun', count: 1380 }
      ]
    },
    'Last Month': {
      inactiveUsers: [
        { period: 'Week 1', count: 580 },
        { period: 'Week 2', count: 620 },
        { period: 'Week 3', count: 540 },
        { period: 'Week 4', count: 490 }
      ],
      signups: [
        { period: 'Week 1', count: 285 },
        { period: 'Week 2', count: 320 },
        { period: 'Week 3', count: 298 },
        { period: 'Week 4', count: 342 }
      ],
      activeUsers: [
        { period: 'Week 1', count: 8500 },
        { period: 'Week 2', count: 9200 },
        { period: 'Week 3', count: 9800 },
        { period: 'Week 4', count: 10200 }
      ]
    },
    'Last Year': {
      inactiveUsers: [
        { period: 'Jan', count: 2200 },
        { period: 'Feb', count: 1980 },
        { period: 'Mar', count: 2100 },
        { period: 'Apr', count: 1850 },
        { period: 'May', count: 1920 },
        { period: 'Jun', count: 2050 },
        { period: 'Jul', count: 1780 },
        { period: 'Aug', count: 1650 },
        { period: 'Sep', count: 1820 },
        { period: 'Oct', count: 1900 },
        { period: 'Nov', count: 2150 },
        { period: 'Dec', count: 2000 }
      ],
      signups: [
        { period: 'Jan', count: 1200 },
        { period: 'Feb', count: 1350 },
        { period: 'Mar', count: 1180 },
        { period: 'Apr', count: 1420 },
        { period: 'May', count: 1280 },
        { period: 'Jun', count: 1380 },
        { period: 'Jul', count: 1520 },
        { period: 'Aug', count: 1680 },
        { period: 'Sep', count: 1450 },
        { period: 'Oct', count: 1620 },
        { period: 'Nov', count: 1750 },
        { period: 'Dec', count: 1580 }
      ],
      activeUsers: [
        { period: 'Jan', count: 28000 },
        { period: 'Feb', count: 32000 },
        { period: 'Mar', count: 35000 },
        { period: 'Apr', count: 38000 },
        { period: 'May', count: 41000 },
        { period: 'Jun', count: 44000 },
        { period: 'Jul', count: 47000 },
        { period: 'Aug', count: 50000 },
        { period: 'Sep', count: 48000 },
        { period: 'Oct', count: 52000 },
        { period: 'Nov', count: 55000 },
        { period: 'Dec', count: 58000 }
      ]
    }
  };

  const uninstallData = {
    'Today': [
      { period: '12AM', count: 2 },
      { period: '3AM', count: 1 },
      { period: '6AM', count: 0 },
      { period: '9AM', count: 3 },
      { period: '12PM', count: 5 },
      { period: '3PM', count: 4 },
      { period: '6PM', count: 2 },
      { period: '9PM', count: 1 }
    ],
    'Last Week': [
      { period: 'Mon', count: 15 },
      { period: 'Tue', count: 12 },
      { period: 'Wed', count: 18 },
      { period: 'Thu', count: 9 },
      { period: 'Fri', count: 14 },
      { period: 'Sat', count: 8 },
      { period: 'Sun', count: 11 }
    ],
    'Last Month': [
      { period: 'Week 1', count: 85 },
      { period: 'Week 2', count: 72 },
      { period: 'Week 3', count: 68 },
      { period: 'Week 4', count: 54 }
    ],
    'Last Year': [
      { period: 'Jan', count: 320 },
      { period: 'Feb', count: 280 },
      { period: 'Mar', count: 310 },
      { period: 'Apr', count: 290 },
      { period: 'May', count: 270 },
      { period: 'Jun', count: 250 },
      { period: 'Jul', count: 230 },
      { period: 'Aug', count: 210 },
      { period: 'Sep', count: 240 },
      { period: 'Oct', count: 260 },
      { period: 'Nov', count: 300 },
      { period: 'Dec', count: 280 }
    ]
  };

  const topCustomers = {
    'Today': [
      { name: 'Rajesh Kumar', orders: 8, amount: 3250, avatar: 'RK' },
      { name: 'Priya Sharma', orders: 6, amount: 2800, avatar: 'PS' },
      { name: 'Amit Patel', orders: 5, amount: 1950, avatar: 'AP' },
      { name: 'Sneha Gupta', orders: 4, amount: 1400, avatar: 'SG' },
      { name: 'Vikram Singh', orders: 3, amount: 980, avatar: 'VS' }
    ],
    'Last Week': [
      { name: 'Rajesh Kumar', orders: 45, amount: 15250, avatar: 'RK' },
      { name: 'Priya Sharma', orders: 38, amount: 12800, avatar: 'PS' },
      { name: 'Amit Patel', orders: 42, amount: 11950, avatar: 'AP' },
      { name: 'Sneha Gupta', orders: 35, amount: 10400, avatar: 'SG' },
      { name: 'Vikram Singh', orders: 33, amount: 9800, avatar: 'VS' }
    ],
    'Last Month': [
      { name: 'Rajesh Kumar', orders: 185, amount: 65250, avatar: 'RK' },
      { name: 'Priya Sharma', orders: 168, amount: 52800, avatar: 'PS' },
      { name: 'Amit Patel', orders: 152, amount: 41950, avatar: 'AP' },
      { name: 'Sneha Gupta', orders: 135, amount: 35400, avatar: 'SG' },
      { name: 'Vikram Singh', orders: 123, amount: 29800, avatar: 'VS' }
    ],
    'Last Year': [
      { name: 'Rajesh Kumar', orders: 845, amount: 285250, avatar: 'RK' },
      { name: 'Priya Sharma', orders: 738, amount: 212800, avatar: 'PS' },
      { name: 'Amit Patel', orders: 642, amount: 181950, avatar: 'AP' },
      { name: 'Sneha Gupta', orders: 535, amount: 150400, avatar: 'SG' },
      { name: 'Vikram Singh', orders: 433, count: 129800, avatar: 'VS' }
    ]
  };

  const topItems = {
    'Today': [
      { name: 'Butter Chicken', orders: 25, revenue: 3750 },
      { name: 'Biryani', orders: 18, revenue: 2520 },
      { name: 'Paneer Tikka', orders: 15, revenue: 2100 },
      { name: 'Dosa', orders: 12, revenue: 1200 },
      { name: 'Pizza Margherita', orders: 10, revenue: 1500 }
    ],
    'Last Week': [
      { name: 'Butter Chicken', orders: 1250, revenue: 187500 },
      { name: 'Biryani', orders: 1180, revenue: 165200 },
      { name: 'Paneer Tikka', orders: 980, revenue: 137200 },
      { name: 'Dosa', orders: 890, revenue: 89000 },
      { name: 'Pizza Margherita', orders: 750, revenue: 112500 }
    ],
    'Last Month': [
      { name: 'Butter Chicken', orders: 5250, revenue: 787500 },
      { name: 'Biryani', orders: 4180, revenue: 585200 },
      { name: 'Paneer Tikka', orders: 3980, revenue: 557200 },
      { name: 'Dosa', orders: 2890, revenue: 289000 },
      { name: 'Pizza Margherita', orders: 2750, revenue: 412500 }
    ],
    'Last Year': [
      { name: 'Butter Chicken', orders: 15250, revenue: 2287500 },
      { name: 'Biryani', orders: 14180, revenue: 1985200 },
      { name: 'Paneer Tikka', orders: 10980, revenue: 1537200 },
      { name: 'Dosa', orders: 8890, revenue: 889000 },
      { name: 'Pizza Margherita', orders: 7750, revenue: 1162500 }
    ]
  };

  const pieData = {
    'Today': [
      { name: 'Active Users', value: 5800, color: '#FF6B35' },
      { name: 'Inactive Users', value: 1200, color: '#FFA500' },
      { name: 'New Signups', value: 850, color: '#FFD700' }
    ],
    'Last Week': [
      { name: 'Active Users', value: 58000, color: '#FF6B35' },
      { name: 'Inactive Users', value: 12000, color: '#FFA500' },
      { name: 'New Signups', value: 8500, color: '#FFD700' }
    ],
    'Last Month': [
      { name: 'Active Users', value: 258000, color: '#FF6B35' },
      { name: 'Inactive Users', value: 52000, color: '#FFA500' },
      { name: 'New Signups', value: 38500, color: '#FFD700' }
    ],
    'Last Year': [
      { name: 'Active Users', value: 1580000, color: '#FF6B35' },
      { name: 'Inactive Users', value: 312000, color: '#FFA500' },
      { name: 'New Signups', value: 208500, color: '#FFD700' }
    ]
  };

  const cardStats = {
    'Today': {
      activeUsers: { value: '5,842', change: 2.5 },
      newSignups: { value: '854', change: 1.2 },
      inactiveUsers: { value: '1,204', change: -0.3 },
      uninstalls: { value: '89', change: -1.8 }
    },
    'Last Week': {
      activeUsers: { value: '58,429', change: 12.5 },
      newSignups: { value: '8,547', change: 8.2 },
      inactiveUsers: { value: '12,043', change: -5.3 },
      uninstalls: { value: '897', change: -12.8 }
    },
    'Last Month': {
      activeUsers: { value: '258,429', change: 15.5 },
      newSignups: { value: '38,547', change: 12.2 },
      inactiveUsers: { value: '52,043', change: -8.3 },
      uninstalls: { value: '3,897', change: -15.8 }
    },
    'Last Year': {
      activeUsers: { value: '1,580,429', change: 22.5 },
      newSignups: { value: '208,547', change: 18.2 },
      inactiveUsers: { value: '312,043', change: -12.3 },
      uninstalls: { value: '28,897', change: -18.8 }
    }
  };

  const currentCardsData = cardStats[cardsPeriod];
  const currentOverviewData = mockData[overviewPeriod];
  const currentUninstallData = uninstallData[overviewPeriod];
  const currentPieData = pieData[overviewPeriod];
  const currentActivityData = topCustomers[activityPeriod];
  const currentItemsData = topItems[itemsPeriod];

  const DatePicker = ({ type, section }) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Get the appropriate state based on section
    const getStateForSection = () => {
      switch (section) {
        case 'cards':
          return {
            currentMonth: cardsCurrentMonth,
            currentYear: cardsCurrentYear,
            dateRange: cardsDateRange,
            setCurrentMonth: setCardsCurrentMonth,
            setCurrentYear: setCardsCurrentYear,
            setDateRange: setCardsDateRange,
            setShowDatePicker: setCardsShowDatePicker
          };
        case 'overview':
          return {
            currentMonth: overviewCurrentMonth,
            currentYear: overviewCurrentYear,
            dateRange: overviewDateRange,
            setCurrentMonth: setOverviewCurrentMonth,
            setCurrentYear: setOverviewCurrentYear,
            setDateRange: setOverviewDateRange,
            setShowDatePicker: setOverviewShowDatePicker
          };
        case 'activity':
          return {
            currentMonth: activityCurrentMonth,
            currentYear: activityCurrentYear,
            dateRange: activityDateRange,
            setCurrentMonth: setActivityCurrentMonth,
            setCurrentYear: setActivityCurrentYear,
            setDateRange: setActivityDateRange,
            setShowDatePicker: setActivityShowDatePicker
          };
        case 'items':
          return {
            currentMonth: itemsCurrentMonth,
            currentYear: itemsCurrentYear,
            dateRange: itemsDateRange,
            setCurrentMonth: setItemsCurrentMonth,
            setCurrentYear: setItemsCurrentYear,
            setDateRange: setItemsDateRange,
            setShowDatePicker: setItemsShowDatePicker
          };
        default:
          return {};
      }
    };

    const {
      currentMonth,
      currentYear,
      dateRange,
      setCurrentMonth,
      setCurrentYear,
      setDateRange,
      setShowDatePicker
    } = getStateForSection();

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
      <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 z-50 w-72">
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

  const TimePeriodSelector = ({ period, setPeriod, section }) => {
    // Get the appropriate state based on section
    const getStateForSection = () => {
      switch (section) {
        case 'cards':
          return {
            showDatePicker: cardsShowDatePicker,
            setShowDatePicker: setCardsShowDatePicker,
            dateRange: cardsDateRange
          };
        case 'overview':
          return {
            showDatePicker: overviewShowDatePicker,
            setShowDatePicker: setOverviewShowDatePicker,
            dateRange: overviewDateRange
          };
        case 'activity':
          return {
            showDatePicker: activityShowDatePicker,
            setShowDatePicker: setActivityShowDatePicker,
            dateRange: activityDateRange
          };
        case 'items':
          return {
            showDatePicker: itemsShowDatePicker,
            setShowDatePicker: setItemsShowDatePicker,
            dateRange: itemsDateRange
          };
        default:
          return {};
      }
    };

    const { showDatePicker, setShowDatePicker, dateRange } = getStateForSection();

    return (
      <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <div className="flex flex-wrap gap-2">
            {['Today', 'Last Week', 'Last Month', 'Last Year'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                  period === p
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:scale-105'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600 font-medium">From:</span>
            <div className="relative">
              <input
                type="text"
                value={formatDate(dateRange.from)}
                onClick={() => setShowDatePicker(showDatePicker === 'from' ? null : 'from')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm w-28 cursor-pointer hover:border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                readOnly
              />
              {showDatePicker === 'from' && <DatePicker type="from" section={section} />}
            </div>
            <span className="text-gray-600 font-medium">To:</span>
            <div className="relative">
              <input
                type="text"
                value={formatDate(dateRange.to)}
                onClick={() => setShowDatePicker(showDatePicker === 'to' ? null : 'to')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm w-28 cursor-pointer hover:border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                readOnly
              />
              {showDatePicker === 'to' && <DatePicker type="to" section={section} />}
            </div>
            {/* <button
              onClick={() => setShowDatePicker(null)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:border-orange-300"
            >
              <Calendar className="w-4 h-4" />
              <span className="font-medium">Calendar</span>
            </button> */}
          </div>
        </div>
      </div>
    );
  };

  const StatCard = ({ title, value, change, icon: Icon, color, bgColor }) => (
    <div className={`${bgColor} rounded-2xl p-6 shadow-lg border border-gray-100 transform hover:scale-105 transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
          <p className={`text-sm mt-2 flex items-center ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            <TrendingUp className="w-4 h-4 mr-1" />
            {change >= 0 ? '+' : ''}{change}% this period
          </p>
        </div>
        <div className={`${color} p-4 rounded-full`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-700">{label}</p>
          <p className="text-orange-600 font-semibold">
            {payload[0].dataKey}: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* Dashboard switch component button */}
        <AnalyticsDashboardSwitcher />

        {/* Header */}
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-orange-500 mb-1 md:mb-2">
              User Analytics Dashboard
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Track user behavior and engagement metrics
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-6">
          <TimePeriodSelector 
            period={cardsPeriod} 
            setPeriod={setCardsPeriod} 
            section="cards"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard
              title="Active Users"
              value={currentCardsData.activeUsers.value}
              change={currentCardsData.activeUsers.change}
              icon={Users}
              color="bg-gradient-to-r from-orange-500 to-red-500"
              bgColor="bg-gradient-to-r from-orange-50 to-red-50"
            />
            <StatCard
              title="New Signups"
              value={currentCardsData.newSignups.value}
              change={currentCardsData.newSignups.change}
              icon={UserPlus}
              color="bg-gradient-to-r from-green-500 to-emerald-500"
              bgColor="bg-gradient-to-r from-green-50 to-emerald-50"
            />
            <StatCard
              title="Inactive Users"
              value={currentCardsData.inactiveUsers.value}
              change={currentCardsData.inactiveUsers.change}
              icon={UserX}
              color="bg-gradient-to-r from-red-500 to-pink-500"
              bgColor="bg-gradient-to-r from-red-50 to-pink-50"
            />
            <StatCard
              title="Uninstalls"
              value={currentCardsData.uninstalls.value}
              change={currentCardsData.uninstalls.change}
              icon={Activity}
              color="bg-gradient-to-r from-purple-500 to-indigo-500"
              bgColor="bg-gradient-to-r from-purple-50 to-indigo-50"
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto mb-6 bg-white rounded-lg p-1 shadow-sm">
          {['overview', 'activity', 'items'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 md:px-6 md:py-3 rounded-md font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="mb-6">
            <TimePeriodSelector 
              period={overviewPeriod} 
              setPeriod={setOverviewPeriod} 
              section="overview"
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* User Growth Chart */}
              <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg">
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">User Growth Trends</h3>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={currentOverviewData.activeUsers}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="period" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#FF6B35" 
                        fill="url(#colorGradient)" 
                        strokeWidth={3}
                      />
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#FF6B35" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* User Distribution Pie Chart */}
              <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg">
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">User Distribution</h3>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={currentPieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {currentPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Signups vs Inactive Users */}
              <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg">
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Signups vs Inactive Users</h3>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={currentOverviewData.signups.map((item, index) => ({
                      ...item,
                      inactive: currentOverviewData.inactiveUsers[index]?.count || 0
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="period" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        name="Signups"
                        dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="inactive" 
                        stroke="#EF4444" 
                        strokeWidth={3}
                        name="Inactive Users"
                        dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Uninstallations Chart */}
              <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg">
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">App Uninstallations</h3>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentUninstallData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="period" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip />
                      <Bar 
                        dataKey="count" 
                        fill="url(#barGradient)" 
                        radius={[4, 4, 0, 0]}
                      />
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.6}/>
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="mb-6">
            <TimePeriodSelector 
              period={activityPeriod} 
              setPeriod={setActivityPeriod} 
              section="activity"
            />
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg">
              <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">Top Customer Activity</h3>
              <div className="space-y-3 md:space-y-4">
                {currentActivityData.map((customer, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 md:p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 md:space-x-4 mb-2 sm:mb-0">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                        {customer.avatar}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm md:text-base">{customer.name}</h4>
                        <p className="text-gray-600 text-xs md:text-sm">Customer #{index + 1}</p>
                      </div>
                    </div>
                    <div className="w-full sm:w-auto">
                      <div className="flex items-center justify-between sm:justify-end space-x-3 md:space-x-6">
                        <div className="text-center">
                          <p className="text-lg md:text-2xl font-bold text-orange-600">{customer.orders}</p>
                          <p className="text-xs md:text-sm text-gray-600">Orders</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg md:text-2xl font-bold text-green-600">₹{customer.amount}</p>
                          <p className="text-xs md:text-sm text-gray-600">Amount</p>
                        </div>
                        <Award className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="mb-6">
            <TimePeriodSelector 
              period={itemsPeriod} 
              setPeriod={setItemsPeriod} 
              section="items"
            />
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg">
              <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">Most Ordered Items</h3>
              <div className="space-y-3 md:space-y-4">
                {currentItemsData.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 md:p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 md:space-x-4 mb-2 sm:mb-0">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm md:text-lg">{item.name}</h4>
                        <p className="text-gray-600 text-xs md:text-sm">Popular item</p>
                      </div>
                    </div>
                    <div className="w-full sm:w-auto">
                      <div className="flex items-center justify-between sm:justify-end space-x-3 md:space-x-6">
                        <div className="text-center">
                          <p className="text-lg md:text-2xl font-bold text-orange-600">{item.orders}</p>
                          <p className="text-xs md:text-sm text-gray-600">Orders</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg md:text-2xl font-bold text-green-600">₹{item.revenue.toLocaleString()}</p>
                          <p className="text-xs md:text-sm text-gray-600">Revenue</p>
                        </div>
                        <ShoppingCart className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAnalytics;