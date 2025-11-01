import React from 'react'
import { FaMedal, FaBox, FaClock, FaTruck, FaRupeeSign, FaCheck, FaInfoCircle,FaArrowRight } from 'react-icons/fa';


const AgentMilestoneDash = () => {
   // Data
  const currentStats = {
    level: 'Bronze',
    deliveries: 28,
    dutyTime: '19h 40m',
    onTimeRate: 91,
    nextLevel: 'Silver',
    requiredDeliveries: 50,
    requiredDutyTime: '30h',
    requiredOnTimeRate: 90
  };

  const progressData = {
    deliveries: {
      current: currentStats.deliveries,
      target: currentStats.requiredDeliveries,
      progress: Math.min((currentStats.deliveries / currentStats.requiredDeliveries) * 100, 100)
    },
    dutyTime: {
      current: convertToMinutes(currentStats.dutyTime),
      target: convertToMinutes(currentStats.requiredDutyTime),
      progress: Math.min((convertToMinutes(currentStats.dutyTime) / convertToMinutes(currentStats.requiredDutyTime)) * 100, 100)
    },
    onTimeRate: {
      current: currentStats.onTimeRate,
      target: currentStats.requiredOnTimeRate,
      progress: currentStats.onTimeRate >= currentStats.requiredOnTimeRate ? 100 : 0
    }
  };

  const levels = [
    { name: 'Bronze', range: '0–49', time: 'No constraint', rate: 'No constraint' },
    { name: 'Silver', range: '50–99', time: '30h', rate: '≥ 90%' },
    { name: 'Gold', range: '100–199', time: '60h', rate: '≥ 92%' },
    { name: 'Platinum', range: '200+', time: '120h', rate: '≥ 95%' }
  ];

  // Helper function to convert time string to minutes
  function convertToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split('h ').map(part => parseInt(part) || 0);
    return hours * 60 + minutes;
  }

  // Helper function to render progress bar
  const ProgressBar = ({ progress, color }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className={`h-2.5 rounded-full ${color}`} 
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:px-6 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-orange-600/10 rounded-full transform translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-blue-600/10 rounded-full transform -translate-x-12 translate-y-12"></div>
            
            <div className="relative flex items-center space-x-4">
              <div className="bg-gradient-to-r from-orange-400 to-orange-600 p-4 rounded-2xl shadow-lg">
                <FaMedal className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Milestone Progress</h1>
                <p className="text-gray-600 text-sm sm:text-base">Track your delivery achievements</p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Current Level Card */}
          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <FaMedal className="text-orange-600 text-xl" />
              </div>
              <h3 className="text-gray-700 font-medium">Current Level</h3>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-gray-800">{currentStats.level}</span>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                Level 1
              </span>
            </div>
          </div>

          {/* Deliveries Card */}
          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FaBox className="text-blue-600 text-xl" />
              </div>
              <h3 className="text-gray-700 font-medium">Completed Deliveries</h3>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-gray-800">{currentStats.deliveries}</span>
              <span className="text-sm text-gray-500">
                / {currentStats.requiredDeliveries} for {currentStats.nextLevel}
              </span>
            </div>
          </div>

          {/* Duty Time Card */}
          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <FaClock className="text-purple-600 text-xl" />
              </div>
              <h3 className="text-gray-700 font-medium">On-Duty Time</h3>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-gray-800">{currentStats.dutyTime}</span>
              <span className="text-sm text-gray-500">
                / {currentStats.requiredDutyTime} for {currentStats.nextLevel}
              </span>
            </div>
          </div>

          {/* On-Time Rate Card */}
          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <FaTruck className="text-green-600 text-xl" />
              </div>
              <h3 className="text-gray-700 font-medium">On-Time Delivery</h3>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-gray-800">{currentStats.onTimeRate}%</span>
              <span className={`text-sm ${currentStats.onTimeRate >= currentStats.requiredOnTimeRate ? 'text-green-600' : 'text-gray-500'}`}>
                {currentStats.onTimeRate >= currentStats.requiredOnTimeRate ? '✓ Passed' : `Needs ${currentStats.requiredOnTimeRate}%`}
              </span>
            </div>
          </div>
        </div>

        {/* Next Milestone Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-r from-orange-100 to-orange-50 p-2 rounded-lg mr-3">
              <FaArrowRight className="text-orange-500 text-xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Next Milestone: <span className="text-orange-600">{currentStats.nextLevel}</span>
            </h2>
          </div>
          
          <div className="space-y-3 pl-4 border-l-4 border-orange-200 ml-2">
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">—</span>
              <span className="text-gray-700">
                <span className="font-medium">{currentStats.requiredDeliveries} Deliveries</span>
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">—</span>
              <span className="text-gray-700">
                <span className="font-medium">{currentStats.requiredDutyTime} On-Duty Time</span>
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">—</span>
              <span className="text-gray-700">
                <span className="font-medium">{currentStats.requiredOnTimeRate}%+ On-Time Delivery</span>
              </span>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <FaMedal className="text-orange-500 mr-2" />
            Progress to {currentStats.nextLevel} Level
          </h2>

          {/* Deliveries Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <FaBox className="text-blue-500 mr-2" />
                <span className="text-gray-700 font-medium">Deliveries</span>
              </div>
              <span className="text-sm font-medium text-gray-600">
                {currentStats.deliveries} / {currentStats.requiredDeliveries}
              </span>
            </div>
            <ProgressBar progress={progressData.deliveries.progress} color="bg-blue-500" />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">0</span>
              <span className="text-xs text-gray-500">{currentStats.requiredDeliveries}</span>
            </div>
          </div>

          {/* Duty Time Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <FaClock className="text-purple-500 mr-2" />
                <span className="text-gray-700 font-medium">On-Duty Time</span>
              </div>
              <span className="text-sm font-medium text-gray-600">
                {currentStats.dutyTime} / {currentStats.requiredDutyTime}
              </span>
            </div>
            <ProgressBar progress={progressData.dutyTime.progress} color="bg-purple-500" />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">0h</span>
              <span className="text-xs text-gray-500">{currentStats.requiredDutyTime}</span>
            </div>
          </div>

          {/* On-Time Rate Progress */}
          <div className="mb-2">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <FaTruck className="text-green-500 mr-2" />
                <span className="text-gray-700 font-medium">On-Time Delivery Rate</span>
              </div>
              <span className={`text-sm font-medium ${currentStats.onTimeRate >= currentStats.requiredOnTimeRate ? 'text-green-600' : 'text-gray-600'}`}>
                {currentStats.onTimeRate}% {currentStats.onTimeRate >= currentStats.requiredOnTimeRate && <FaCheck className="inline ml-1" />}
              </span>
            </div>
            <ProgressBar 
              progress={progressData.onTimeRate.progress} 
              color={currentStats.onTimeRate >= currentStats.requiredOnTimeRate ? 'bg-green-500' : 'bg-gray-300'} 
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">0%</span>
              <span className="text-xs text-gray-500">{currentStats.requiredOnTimeRate}% (required)</span>
            </div>
          </div>

          {/* Reward Info */}
          <div className="mt-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
            <div className="flex items-start">
              <FaInfoCircle className="text-orange-500 mt-1 mr-2 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Milestone Rewards</h4>
                <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                  <li><span className="font-medium"><FaRupeeSign className="inline mr-1" />10 bonus</span> every 5 deliveries</li>
                  <li><span className="font-medium"><FaRupeeSign className="inline mr-1" />100 milestone bonus</span> when {currentStats.nextLevel} is reached</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Levels Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <FaInfoCircle className="text-orange-500 mr-2" />
            Milestone Levels & Requirements
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deliveries</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">On-Duty Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">On-Time Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {levels.map((level, index) => (
                  <tr key={index} className={level.name === currentStats.level ? 'bg-orange-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center">
                        {level.name === 'Bronze' && <span className="text-orange-600 mr-2">🥉</span>}
                        {level.name === 'Silver' && <span className="text-gray-400 mr-2">🥈</span>}
                        {level.name === 'Gold' && <span className="text-yellow-500 mr-2">🥇</span>}
                        {level.name === 'Platinum' && <span className="text-blue-400 mr-2">🏆</span>}
                        {level.name}
                        {level.name === currentStats.level && <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">Current</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{level.range}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{level.time}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{level.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <FaInfoCircle className="text-orange-500 mr-2" />
            Tips to Progress Faster
          </h2>
          
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors">
              <span className="bg-orange-100 text-orange-600 p-1 rounded-full mr-3 mt-0.5">
                <FaClock className="text-sm" />
              </span>
              <div>
                <h3 className="font-medium">Stay active during peak hours</h3>
                <p className="text-sm text-gray-600 mt-1">Focus on lunch (12-3 PM) and dinner (7-10 PM) hours for more orders</p>
              </div>
            </li>
            
            <li className="flex items-start p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors">
              <span className="bg-orange-100 text-orange-600 p-1 rounded-full mr-3 mt-0.5">
                <FaTruck className="text-sm" />
              </span>
              <div>
                <h3 className="font-medium">Accept orders quickly</h3>
                <p className="text-sm text-gray-600 mt-1">Avoid cancellations to maintain good standing</p>
              </div>
            </li>
            
            <li className="flex items-start p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors">
              <span className="bg-orange-100 text-orange-600 p-1 rounded-full mr-3 mt-0.5">
                <FaCheck className="text-sm" />
              </span>
              <div>
                <h3 className="font-medium">Deliver before estimated time</h3>
                <p className="text-sm text-gray-600 mt-1">Plan efficient routes to improve on-time rate</p>
              </div>
            </li>
            
            <li className="flex items-start p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors">
              <span className="bg-orange-100 text-orange-600 p-1 rounded-full mr-3 mt-0.5">
                <FaMedal className="text-sm" />
              </span>
              <div>
                <h3 className="font-medium">Complete delivery streaks</h3>
                <p className="text-sm text-gray-600 mt-1">Earn extra incentives for consecutive deliveries</p>
              </div>
            </li>
            
            <li className="flex items-start p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors">
              <span className="bg-orange-100 text-orange-600 p-1 rounded-full mr-3 mt-0.5">
                <FaBox className="text-sm" />
              </span>
              <div>
                <h3 className="font-medium">Maintain high ratings</h3>
                <p className="text-sm text-gray-600 mt-1">Good customer service leads to better opportunities</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
export default AgentMilestoneDash
