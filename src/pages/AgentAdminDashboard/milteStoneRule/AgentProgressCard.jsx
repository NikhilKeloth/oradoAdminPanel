import React from 'react';
import { Trophy, TrendingUp } from 'lucide-react';

const AgentProgressCard = ({
  agentName,
  currentLevel,
  nextLevel,
  progress,
  ordersCompleted,
  ordersRequired,
}) => {
  const getLevelIcon = (level) => {
    switch (level) {
      case 'Bronze': return '🥉';
      case 'Silver': return '🥈';
      case 'Gold': return '🥇';
      case 'Platinum': return '💎';
      default: return '🏆';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Bronze': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Silver': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Platinum': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressColor = () => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    if (progress >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">
              {agentName.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 text-sm">{agentName}</h3>
          </div>
        </div>
        <Trophy className="w-4 h-4 text-gray-400" />
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getLevelColor(currentLevel)}`}>
            {getLevelIcon(currentLevel)} {currentLevel}
          </span>
          <TrendingUp className="w-3 h-3 text-gray-400" />
        </div>
        
        <div className="text-xs text-gray-500 mb-2">
          Progress to {nextLevel} {getLevelIcon(nextLevel)}
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-600">
          <span>{ordersCompleted}/{ordersRequired} orders</span>
          <span>{progress}%</span>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        {ordersRequired - ordersCompleted} orders to next level
      </div>
    </div>
  );
};

export default AgentProgressCard;