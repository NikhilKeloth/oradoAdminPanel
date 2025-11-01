import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Users, Store, DollarSign, TrendingUp, Clock, MapPin, ChevronDown, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import AnalyticsDashboardSwitcher from './AnalyticsDashboardSwitcher';
import { SummaryTable } from './SummaryTable';

import Heatmap from '../../../components/admin/analytics/HeatMap';
import DeliveryHeatmap from '../../../components/admin/analytics/DeliveryHeatmap';
import MapComponent from '../../../components/admin/analytics/MapComponent';
import SalesGraph from './SalesGraph';
import PeakHoursChart from './PeakHoursChart';
import TopMerchantsByRevenue from './TopMerchantsByRevenue';
import MostOrderedAreas from './MostOrderedAreas';
import {getOrdersSummary} from "../../../apis/adminApis/orderApi"
import OrderSummary from './OrderSummary';
import { Link } from 'react-router-dom';

const OrderAnalytics = () => {
  // Separate state for each section
  const [cardsPeriod, setCardsPeriod] = useState('month');
  const [chartsPeriod, setChartsPeriod] = useState('Last Month');
  const [summaryPeriod, setSummaryPeriod] = useState('Last Month');
  
  // Separate date picker states for each section
  const [cardsShowDatePicker, setCardsShowDatePicker] = useState(null);
  const [chartsShowDatePicker, setChartsShowDatePicker] = useState(null);
  const [summaryShowDatePicker, setSummaryShowDatePicker] = useState(null);
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState()

  // peak hours and weak hours
  const [showPeakHours, setShowPeakHours] = useState(true);
const [showWeakHours, setShowWeakHours] = useState(true);

  // Separate date ranges for each section
  const [cardsDateRange, setCardsDateRange] = useState({
    from: new Date(2025, 6, 7),
    to: new Date(2025, 6, 14)
  });
  const [chartsDateRange, setChartsDateRange] = useState({
    from: new Date(2025, 6, 7),
    to: new Date(2025, 6, 14)
  });
  const [summaryDateRange, setSummaryDateRange] = useState({
    from: new Date(2025, 6, 7),
    to: new Date(2025, 6, 14)
  });

    const [tableData, setTableData] = useState([
     {
    date: '2023-05-01',
    totalOrders: 42,
    completedOrders: 38,
    cancelledOrders: 4,
    revenue: 1250.75,
    averageDeliveryTime: 35
  },
  {
    date: '2023-05-02',
    totalOrders: 56,
    completedOrders: 52,
    cancelledOrders: 4,
    revenue: 1680.50,
    averageDeliveryTime: 32
  },
  {
    date: '2023-05-03',
    totalOrders: 38,
    completedOrders: 35,
    cancelledOrders: 3,
    revenue: 1145.25,
    averageDeliveryTime: 40
  },
  {
    date: '2023-05-04',
    totalOrders: 61,
    completedOrders: 57,
    cancelledOrders: 4,
    revenue: 1895.80,
    averageDeliveryTime: 30
  },
  {
    date: '2023-05-05',
    totalOrders: 78,
    completedOrders: 72,
    cancelledOrders: 6,
    revenue: 2450.30,
    averageDeliveryTime: 45
  },
  {
    date: '2023-05-06',
    totalOrders: 85,
    completedOrders: 80,
    cancelledOrders: 5,
    revenue: 2650.75,
    averageDeliveryTime: 50
  },
  {
    date: '2023-05-07',
    totalOrders: 72,
    completedOrders: 68,
    cancelledOrders: 4,
    revenue: 2180.40,
    averageDeliveryTime: 38
  },
  {
    date: '2023-05-08',
    totalOrders: 48,
    completedOrders: 45,
    cancelledOrders: 3,
    revenue: 1420.60,
    averageDeliveryTime: 35
  },
  {
    date: '2023-05-09',
    totalOrders: 53,
    completedOrders: 50,
    cancelledOrders: 3,
    revenue: 1595.25,
    averageDeliveryTime: 33
  },
  {
    date: '2023-05-10',
    totalOrders: 65,
    completedOrders: 62,
    cancelledOrders: 3,
    revenue: 2050.90,
    averageDeliveryTime: 42
  },
  {
    date: '2023-05-11',
    totalOrders: 70,
    completedOrders: 67,
    cancelledOrders: 3,
    revenue: 2250.75,
    averageDeliveryTime: 40
  },
  {
    date: '2023-05-12',
    totalOrders: 92,
    completedOrders: 87,
    cancelledOrders: 5,
    revenue: 2950.20,
    averageDeliveryTime: 55
  },
  {
    date: '2023-05-13',
    totalOrders: 88,
    completedOrders: 84,
    cancelledOrders: 4,
    revenue: 2780.50,
    averageDeliveryTime: 48
  },
  {
    date: '2023-05-14',
    totalOrders: 76,
    completedOrders: 72,
    cancelledOrders: 4,
    revenue: 2350.60,
    averageDeliveryTime: 43
  },
  {
    date: '2023-05-15',
    totalOrders: 58,
    completedOrders: 55,
    cancelledOrders: 3,
    revenue: 1820.40,
    averageDeliveryTime: 37
  },
  {
    date: '2023-05-16',
    totalOrders: 62,
    completedOrders: 59,
    cancelledOrders: 3,
    revenue: 1950.75,
    averageDeliveryTime: 39
  },
  {
    date: '2023-05-17',
    totalOrders: 55,
    completedOrders: 52,
    cancelledOrders: 3,
    revenue: 1720.30,
    averageDeliveryTime: 36
  },
  {
    date: '2023-05-18',
    totalOrders: 68,
    completedOrders: 65,
    cancelledOrders: 3,
    revenue: 2150.80,
    averageDeliveryTime: 41
  },
  {
    date: '2023-05-19',
    totalOrders: 82,
    completedOrders: 78,
    cancelledOrders: 4,
    revenue: 2580.90,
    averageDeliveryTime: 47
  },
  {
    date: '2023-05-20',
    totalOrders: 95,
    completedOrders: 91,
    cancelledOrders: 4,
    revenue: 3050.25,
    averageDeliveryTime: 52
  },
  {
    date: '2023-05-21',
    totalOrders: 87,
    completedOrders: 83,
    cancelledOrders: 4,
    revenue: 2750.60,
    averageDeliveryTime: 49
  }
  ]);


 const [isModalOpen, setIsModalOpen] = useState(false);

const mockOrdersData = [
  {
    id: 1,
    longitude: -73.9857,
    latitude: 40.7484,
    address: "Empire State Building, New York",
    date: "2023-06-15T10:30:00Z"
  },
  {
    id: 2,
    longitude: -73.9857,
    latitude: 40.7484,
    address: "Empire State Building, New York",
    date: "2023-06-15T11:15:00Z"
  },
  {
    id: 3,
    longitude: -74.0445,
    latitude: 40.6892,
    address: "Statue of Liberty, New York",
    date: "2023-06-15T12:00:00Z"
  },
  {
    id: 4,
    longitude: -118.2437,
    latitude: 34.0522,
    address: "Los Angeles Downtown",
    date: "2023-06-15T09:00:00Z"
  },
  {
    id: 5,
    longitude: -118.2437,
    latitude: 34.0522,
    address: "Los Angeles Downtown",
    date: "2023-06-15T10:30:00Z"
  },
  {
    id: 6,
    longitude: -118.2437,
    latitude: 34.0522,
    address: "Los Angeles Downtown",
    date: "2023-06-15T14:00:00Z"
  },
  {
    id: 7,
    longitude: -87.6298,
    latitude: 41.8781,
    address: "Chicago Downtown",
    date: "2023-06-15T13:30:00Z"
  },
  {
    id: 8,
    longitude: -122.4194,
    latitude: 37.7749,
    address: "San Francisco Downtown",
    date: "2023-06-15T11:00:00Z"
  },
  {
    id: 9,
    longitude: -122.4194,
    latitude: 37.7749,
    address: "San Francisco Downtown",
    date: "2023-06-15T15:00:00Z"
  },
  {
    id: 10,
    longitude: -77.0369,
    latitude: 38.9072,
    address: "Washington DC Downtown",
    date: "2023-06-15T16:00:00Z"
  },
  // Add more data points as needed
];
  



useEffect(()=>{


const fetchOrdersSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getOrdersSummary({ period: cardsPeriod });
        // setData(response.data);
        console.log(response.data)
      } catch (err) {
        setError(err.message || 'Failed to fetch orders summary');
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersSummary()
console.log(cardsPeriod,"cards preond")
},[cardsPeriod])








  
  // Mock data for January 15, 2024 orders
const mockOrders = [
  {
    id: 'ORD-1001',
    status: 'Completed',
    merchantName: 'Burger Palace',
    customerName: 'John Smith',
    amount: 24.99,
    paymentStatus: 'Paid',
    paymentMethod: 'Credit Card',
    deliveryMode: 'Home Delivery',
    orderPreparationTime: 25,
    deviceType: 'Mobile',
    date: '2023-05-15T12:30:00Z'
  },
  {
    id: 'ORD-1002',
    status: 'Cancelled',
    merchantName: 'Pizza Heaven',
    customerName: 'Sarah Johnson',
    amount: 32.50,
    paymentStatus: 'Unpaid',
    paymentMethod: 'Cash',
    deliveryMode: 'Pickup',
    orderPreparationTime: 15,
    deviceType: 'Desktop',
    date: '2023-05-15T13:45:00Z'
  },
  {
    id: 'ORD-1003',
    status: 'In Progress',
    merchantName: 'Sushi World',
    customerName: 'Michael Chen',
    amount: 45.75,
    paymentStatus: 'Paid',
    paymentMethod: 'Mobile Wallet',
    deliveryMode: 'Home Delivery',
    orderPreparationTime: 30,
    deviceType: 'Tablet',
    date: '2023-05-15T14:20:00Z'
  },
  {
    id: 'ORD-1004',
    status: 'Preparing',
    merchantName: 'Taco Fiesta',
    customerName: 'Emily Rodriguez',
    amount: 18.99,
    paymentStatus: 'Paid',
    paymentMethod: 'Debit Card',
    deliveryMode: 'Pickup',
    orderPreparationTime: 20,
    deviceType: 'Mobile',
    date: '2023-05-15T15:10:00Z'
  },
  {
    id: 'ORD-1005',
    status: 'Out for Delivery',
    merchantName: 'Noodle House',
    customerName: 'David Kim',
    amount: 28.40,
    paymentStatus: 'Paid',
    paymentMethod: 'Credit Card',
    deliveryMode: 'Home Delivery',
    orderPreparationTime: 35,
    deviceType: 'Desktop',
    date: '2023-05-15T16:30:00Z'
  },
  {
    id: 'ORD-1006',
    status: 'Completed',
    merchantName: 'Salad Bar',
    customerName: 'Jessica Wong',
    amount: 15.25,
    paymentStatus: 'Paid',
    paymentMethod: 'Mobile Wallet',
    deliveryMode: 'Pickup',
    orderPreparationTime: 10,
    deviceType: 'Mobile',
    date: '2023-05-15T17:45:00Z'
  },
  {
    id: 'ORD-1007',
    status: 'In Progress',
    merchantName: 'Burger Palace',
    customerName: 'Robert Taylor',
    amount: 22.99,
    paymentStatus: 'Paid',
    paymentMethod: 'Credit Card',
    deliveryMode: 'Home Delivery',
    orderPreparationTime: 25,
    deviceType: 'Tablet',
    date: '2023-05-15T18:20:00Z'
  },
  {
    id: 'ORD-1008',
    status: 'Preparing',
    merchantName: 'Pizza Heaven',
    customerName: 'Lisa Brown',
    amount: 29.99,
    paymentStatus: 'Paid',
    paymentMethod: 'Debit Card',
    deliveryMode: 'Pickup',
    orderPreparationTime: 20,
    deviceType: 'Mobile',
    date: '2023-05-15T19:05:00Z'
  },
  {
    id: 'ORD-1009',
    status: 'Completed',
    merchantName: 'Sushi World',
    customerName: 'Daniel Park',
    amount: 52.30,
    paymentStatus: 'Paid',
    paymentMethod: 'Credit Card',
    deliveryMode: 'Home Delivery',
    orderPreparationTime: 40,
    deviceType: 'Desktop',
    date: '2023-05-15T20:15:00Z'
  },
  {
    id: 'ORD-1010',
    status: 'Cancelled',
    merchantName: 'Taco Fiesta',
    customerName: 'Amanda Garcia',
    amount: 19.50,
    paymentStatus: 'Unpaid',
    paymentMethod: 'Cash',
    deliveryMode: 'Pickup',
    orderPreparationTime: 15,
    deviceType: 'Mobile',
    date: '2023-05-15T21:00:00Z'
  },
  {
    id: 'ORD-1011',
    status: 'Out for Delivery',
    merchantName: 'Noodle House',
    customerName: 'Kevin Lee',
    amount: 26.75,
    paymentStatus: 'Paid',
    paymentMethod: 'Mobile Wallet',
    deliveryMode: 'Home Delivery',
    orderPreparationTime: 30,
    deviceType: 'Tablet',
    date: '2023-05-15T22:10:00Z'
  },
  {
    id: 'ORD-1012',
    status: 'Completed',
    merchantName: 'Salad Bar',
    customerName: 'Olivia Martin',
    amount: 14.99,
    paymentStatus: 'Paid',
    paymentMethod: 'Debit Card',
    deliveryMode: 'Pickup',
    orderPreparationTime: 10,
    deviceType: 'Mobile',
    date: '2023-05-15T23:30:00Z'
  }
];





  
  // Separate calendar states for each section
  const [cardsCurrentMonth, setCardsCurrentMonth] = useState(new Date().getMonth());
  const [cardsCurrentYear, setCardsCurrentYear] = useState(new Date().getFullYear());
  const [chartsCurrentMonth, setChartsCurrentMonth] = useState(new Date().getMonth());
  const [chartsCurrentYear, setChartsCurrentYear] = useState(new Date().getFullYear());
  const [summaryCurrentMonth, setSummaryCurrentMonth] = useState(new Date().getMonth());
  const [summaryCurrentYear, setSummaryCurrentYear] = useState(new Date().getFullYear());

  // Generate dummy data
  const generateDummyData = () => {
    const salesData = [
      { day: 'Mon', sales: 850, orders: 45 },
      { day: 'Tue', sales: 1200, orders: 62 },
      { day: 'Wed', sales: 980, orders: 38 },
      { day: 'Thu', sales: 1450, orders: 72 },
      { day: 'Fri', sales: 1680, orders: 89 },
      { day: 'Sat', sales: 1850, orders: 95 },
      { day: 'Sun', sales: 1420, orders: 78 }
    ];

    const hourlyData = [
  { hour: '9AM', orders: 12, weakOrders: 5 },
  { hour: '10AM', orders: 19, weakOrders: 8 },
  { hour: '11AM', orders: 25, weakOrders: 10 },
  { hour: '12PM', orders: 45, weakOrders: 15 },
  { hour: '1PM', orders: 52, weakOrders: 20 },
  { hour: '2PM', orders: 38, weakOrders: 18 },
  { hour: '3PM', orders: 28, weakOrders: 12 },
  { hour: '4PM', orders: 35, weakOrders: 15 },
  { hour: '5PM', orders: 42, weakOrders: 18 },
  { hour: '6PM', orders: 48, weakOrders: 22 },
  { hour: '7PM', orders: 65, weakOrders: 25 },
  { hour: '8PM', orders: 72, weakOrders: 30 },
  { hour: '9PM', orders: 58, weakOrders: 25 },
  { hour: '10PM', orders: 45, weakOrders: 20 }
];

    const merchantData = [
      { name: 'Burger Palace', revenue: 8500, orders: 145, color: '#FF6B35' },
      { name: 'Pizza Corner', revenue: 7200, orders: 128, color: '#FF8C42' },
      { name: 'Tandoori Nights', revenue: 6800, orders: 112, color: '#FFA726' },
      { name: 'Seafood Bay', revenue: 5900, orders: 98, color: '#66BB6A' },
      { name: 'Grill House', revenue: 5400, orders: 89, color: '#42A5F5' }
    ];

    const areaData = [
      { area: 'Koramangala', orders: 245, popular: 'Biryani' },
      { area: 'Indiranagar', orders: 198, popular: 'Pizza' },
      { area: 'Whitefield', orders: 176, popular: 'Burger' },
      { area: 'HSR Layout', orders: 154, popular: 'Chinese' },
      { area: 'Marathahalli', orders: 132, popular: 'South Indian' }
    ];

    return { salesData, hourlyData, merchantData, areaData };
  };

  const { salesData, hourlyData, merchantData, areaData } = generateDummyData();

  const statsData = useMemo(() => {
    const baseStats = {
      totalOrders: 1247,
      completedOrders: 1189,
      cancelledOrders: 58,
      totalRevenue: 89450,
      activeRestaurants: 156,
      totalUsers: 12890
    };

    const multipliers = {
      'Today': 1,
      'Last Week': 7,
      'Last Month': 30,
      'Last Year': 365
    };

    const multiplier = multipliers[cardsPeriod] || 1;
    
    return {
      totalOrders: Math.floor(baseStats.totalOrders * multiplier),
      completedOrders: Math.floor(baseStats.completedOrders * multiplier),
      cancelledOrders: Math.floor(baseStats.cancelledOrders * multiplier),
      totalRevenue: Math.floor(baseStats.totalRevenue * multiplier),
      activeRestaurants: baseStats.activeRestaurants,
      totalUsers: Math.floor(baseStats.totalUsers * (multiplier * 0.1))
    };
  }, [cardsPeriod]);

  const StatCard = ({ title, value, change, icon: Icon, bgColor, iconBg, prefix = '' }) => (
    <div className={`${bgColor} rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer transform hover:scale-105 hover:-translate-y-1`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 ${iconBg} rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center gap-1">
          {change >= 0 ? (
            <ArrowUpRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-gray-600" />
          )}
          <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{change}% this period
          </span>
        </div>
      </div>
      <div>
        <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{prefix}{value.toLocaleString()}</p>
      </div>
    </div>
  );

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
        case 'charts':
          return {
            currentMonth: chartsCurrentMonth,
            currentYear: chartsCurrentYear,
            dateRange: chartsDateRange,
            setCurrentMonth: setChartsCurrentMonth,
            setCurrentYear: setChartsCurrentYear,
            setDateRange: setChartsDateRange,
            setShowDatePicker: setChartsShowDatePicker
          };
        case 'summary':
          return {
            currentMonth: summaryCurrentMonth,
            currentYear: summaryCurrentYear,
            dateRange: summaryDateRange,
            setCurrentMonth: setSummaryCurrentMonth,
            setCurrentYear: setSummaryCurrentYear,
            setDateRange: setSummaryDateRange,
            setShowDatePicker: setSummaryShowDatePicker
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

  const TimePeriodSelector = ({ period, setPeriod, title, section }) => {
    // Get the appropriate state based on section
    const getStateForSection = () => {
      switch (section) {
        case 'cards':
          return {
            showDatePicker: cardsShowDatePicker,
            setShowDatePicker: setCardsShowDatePicker,
            dateRange: cardsDateRange
          };
        case 'charts':
          return {
            showDatePicker: chartsShowDatePicker,
            setShowDatePicker: setChartsShowDatePicker,
            dateRange: chartsDateRange
          };
        case 'summary':
          return {
            showDatePicker: summaryShowDatePicker,
            setShowDatePicker: setSummaryShowDatePicker,
            dateRange: summaryDateRange
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
            {['today', 'week', 'month', 'year'].map(p => (
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





    const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5; // This would typically be calculated based on your data

  const handleDateClick = (date) => {
    console.log('Date clicked:', date);
    // You would typically fetch detailed data for this date here
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // You would typically fetch data for the new page here
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 via-red-50 to-pink-50">
        {/* Dashboard Switcher with proper spacing */}
        <div className="px-6 pt-6">
          <AnalyticsDashboardSwitcher />
        </div>
        {/* Header Content */}
        <div className="max-w-7xl mx-auto px-1 md:px-2 py-2 pb-0 pt-2 pl-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg">
              <BarChart3 className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Order Analytics Dashboard
              </h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                Track order performance and revenue insights
              </p>
            </div>
          </div>
        </div>
      </div>

           
      {/* Heatmap Section */}
  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
    <h3 className="text-lg font-bold text-gray-900 mb-6">Delivery Heatmap - Kochi Area</h3>
    <div className="h-96 rounded-xl overflow-hidden">
      <DeliveryHeatmap />
    </div>
  </div>

       <div className="container mx-auto p-4">
      
    </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Cards Time Period Selector */}
        <TimePeriodSelector 
          period={cardsPeriod} 
          setPeriod={setCardsPeriod} 
          title="Cards" 
          section="cards"
        />

        {/* Stats Cards */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Orders"
            value={statsData.totalOrders}
            change={12.5}
            icon={Store}
            bgColor="bg-green-50"
            iconBg="bg-green-500"
          />
          <StatCard
            title="Completed Orders"
            value={statsData.completedOrders}
            change={8.2}
            icon={TrendingUp}
            bgColor="bg-blue-50"
            iconBg="bg-blue-500"
          />
          <StatCard
            title="Cancelled Orders"
            value={statsData.cancelledOrders}
            change={-2.1}
            icon={Clock}
            bgColor="bg-red-50"
            iconBg="bg-red-500"
          />
          <StatCard
            title="Total Revenue"
            value={statsData.totalRevenue}
            change={15.3}
            icon={DollarSign}
            bgColor="bg-orange-50"
            iconBg="bg-orange-500"
            prefix="₹"
          />
        </div> */}



        <OrderSummary  TimePeriodSelector={TimePeriodSelector} />


<Link to="/admin/dashboard/analytics/order-details">
  <button 
    onClick={() => {setIsModalOpen(true)}} // Pass the actual date you want to show
    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  >
    More Details
  </button>


    
     </Link>

        {/* Charts Time Period Selector */}
        <TimePeriodSelector 
          period={chartsPeriod} 
          setPeriod={setChartsPeriod} 
          title="Charts" 
          section="charts"
        />

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {/* Sales Overview */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Sales Overview</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Revenue</span>
              </div>



            </div>
            <SalesGraph />
            {/* <ResponsiveContainer width="100%" height={280}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="url(#gradient1)" 
                  strokeWidth={3}
                  dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#f97316' }}
                />
                <defs>
                  <linearGradient id="gradient1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer> */}
          </div>

        {/* Peak Hours */}
<div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
  


  








  <PeakHoursChart/>
  {/* <ResponsiveContainer width="100%" height={280}>
    <BarChart data={hourlyData}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis dataKey="hour" stroke="#6b7280" fontSize={12} />
      <YAxis stroke="#6b7280" fontSize={12} />
      <Tooltip
        contentStyle={{
          backgroundColor: 'white',
          border: 'none',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          fontSize: '12px'
        }}
      />
      {showPeakHours && (
        <Bar 
          dataKey="orders" 
          fill="url(#gradient2)" 
          radius={[4, 4, 0, 0]} 
          name="Peak Hours"
        />
      )}
      {showWeakHours && (
        <Bar 
          dataKey="weakOrders" 
          fill="url(#gradientRed)" 
          radius={[4, 4, 0, 0]} 
          name="Weak Hours"
        />
      )}
      <defs>
        <linearGradient id="gradient2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="gradientRed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
      </defs>
    </BarChart>
  </ResponsiveContainer> */}
</div>
</div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {/* Top Merchants */}
          {/* <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Top Merchants by Revenue</h3>
            <div className="space-y-4">
              {merchantData.map((merchant, index) => (
                <div key={merchant.name} className="group hover:bg-gray-50 rounded-xl p-3 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg" style={{ backgroundColor: merchant.color }}>
                          {index + 1}
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 text-base truncate">{merchant.name}</p>
                        <p className="text-sm text-gray-500">{merchant.orders} orders this month</p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-gray-900 text-lg">₹{merchant.revenue.toLocaleString()}</p>
                      <div className="w-24 h-2 bg-gray-200 rounded-full mt-2">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ 
                            width: `${(merchant.revenue / 8500) * 100}%`,
                            backgroundColor: merchant.color 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div> */}

          <TopMerchantsByRevenue/>
          <MostOrderedAreas/>

        </div>

        {/* Order Summary Time Period Selector */}
        <TimePeriodSelector 
          period={summaryPeriod} 
          setPeriod={setSummaryPeriod} 
          title="Order Summary" 
          section="summary"
        />

        {/* Order Status Summary */}
        {/* <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-bold text-gray-900 mb-8">Order Status Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
       
            <div className="text-center group">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="w-full h-full rounded-full bg-gradient-to-r from-green-100 to-green-200 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                    <span className="text-lg font-bold text-white">
                      {Math.round((statsData.completedOrders / statsData.totalOrders) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-3 h-3 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">Completed Orders</p>
              <p className="text-2xl font-bold text-green-600">{statsData.completedOrders.toLocaleString()}</p>
            </div>
            
     
            <div className="text-center group">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="w-full h-full rounded-full bg-gradient-to-r from-red-100 to-red-200 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                    <span className="text-lg font-bold text-white">
                      {Math.round((statsData.cancelledOrders / statsData.totalOrders) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <Clock className="w-3 h-3 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">Cancelled Orders</p>
              <p className="text-2xl font-bold text-red-600">{statsData.cancelledOrders.toLocaleString()}</p>
            </div>
            
    
            <div className="text-center group">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <span className="text-lg font-bold text-white">100%</span>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Store className="w-3 h-3 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">Total Orders</p>
              <p className="text-2xl font-bold text-blue-600">{statsData.totalOrders.toLocaleString()}</p>
            </div>
          </div>
        </div> */}


       
      </div>

       

         {/* <DetailedOrdersModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        date="2024-01-15"
        orders={mockOrders}
      /> */}
    </div>
  );
};

export default OrderAnalytics;