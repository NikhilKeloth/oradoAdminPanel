import React, { useState, useEffect } from 'react';
import { Clock, Edit3, Plus, Store, X, Check, Calendar, Save } from 'lucide-react';

const StoreHours = ({ initialHours, onSave }) => {
  const [hours, setHours] = useState(initialHours || [
    { day: 'monday', openingTime: '09:00', closingTime: '21:00', isClosed: false },
    { day: 'tuesday', openingTime: '09:00', closingTime: '21:00', isClosed: false },
    { day: 'wednesday', openingTime: '09:00', closingTime: '21:00', isClosed: false },
    { day: 'thursday', openingTime: '09:00', closingTime: '21:00', isClosed: false },
    { day: 'friday', openingTime: '09:00', closingTime: '21:00', isClosed: false },
    { day: 'saturday', openingTime: '10:00', closingTime: '20:00', isClosed: false },
    { day: 'sunday', openingTime: '--:--', closingTime: '--:--', isClosed: true }
  ]);

  const [editingIndex, setEditingIndex] = useState(-1);
  const [editForm, setEditForm] = useState({ openingTime: '', closingTime: '', isClosed: false });
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize with props
  useEffect(() => {
    if (initialHours) {
      setHours(initialHours);
    }
  }, [initialHours]);

  const handleEdit = (index) => {
    const hour = hours[index];
    setEditingIndex(index);
    setEditForm({
      // Use default times if the day is closed or has invalid times
      openingTime: hour.isClosed || hour.openingTime === '--:--' ? '09:00' : hour.openingTime,
      closingTime: hour.isClosed || hour.closingTime === '--:--' ? '17:00' : hour.closingTime,
      isClosed: hour.isClosed
    });
  };

  const handleSaveEdit = () => {
    const updatedHours = [...hours];
    if (editForm.isClosed) {
      updatedHours[editingIndex] = {
        ...updatedHours[editingIndex],
        openingTime: '--:--',
        closingTime: '--:--',
        isClosed: true
      };
    } else {
      updatedHours[editingIndex] = {
        ...updatedHours[editingIndex],
        openingTime: editForm.openingTime,
        closingTime: editForm.closingTime,
        isClosed: false
      };
    }
    setHours(updatedHours);
    setEditingIndex(-1);
    setHasChanges(true);
  };

  const formatTimeToAMPM = (time) => {
    if (time === '--:--') return 'Closed';
    
    const [hours, minutes] = time.split(':');
    const parsedHours = parseInt(hours, 10);
    const ampm = parsedHours >= 12 ? 'PM' : 'AM';
    const displayHours = parsedHours % 12 || 12;
    
    return `${displayHours}:${minutes} ${ampm}`;
  };

  const handleCancel = () => {
    setEditingIndex(-1);
    setEditForm({ openingTime: '', closingTime: '', isClosed: false });
  };

  const handleSaveToParent = () => {
    if (onSave) {
      onSave(hours);
    }
    setHasChanges(false);
  };

  const getCurrentStatus = () => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5);
    
    const todayHours = hours.find(h => h.day === currentDay);
    if (!todayHours || todayHours.isClosed) return { status: 'Closed', color: 'text-red-500' };
    
    if (currentTime >= todayHours.openingTime && currentTime <= todayHours.closingTime) {
      return { status: 'Open Now', color: 'text-green-500' };
    }
    return { status: 'Closed', color: 'text-red-500' };
  };

  const currentStatus = getCurrentStatus();

  const EditModal = () => {
    if (editingIndex === -1) return null;

    const dayColors = {
      monday: 'bg-blue-500',
      tuesday: 'bg-green-500', 
      wednesday: 'bg-purple-500',
      thursday: 'bg-orange-500',
      friday: 'bg-pink-500',
      saturday: 'bg-indigo-500',
      sunday: 'bg-red-500'
    };

    const currentDay = hours[editingIndex].day;
    const dayColor = dayColors[currentDay] || 'bg-blue-500';

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="relative mb-8">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 ${dayColor} rounded-2xl flex items-center justify-center shadow-lg`}>
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Edit Store Hours</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-gray-700 capitalize">{currentDay}</span>
                  <div className={`w-3 h-3 rounded-full ${editForm.isClosed ? 'bg-red-400' : 'bg-green-400'} animate-pulse`}></div>
                </div>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="absolute top-0 right-0 w-10 h-10 bg-gray-100/80 hover:bg-gray-200 rounded-2xl flex items-center justify-center transition-all duration-200 hover:rotate-90"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <div className="space-y-8">
            {/* Closed Toggle */}
            <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
              editForm.isClosed 
                ? 'bg-red-50 border-red-200' 
                : 'bg-gray-50 border-gray-200 hover:border-gray-300'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    editForm.isClosed ? 'bg-red-500' : 'bg-gray-300'
                  }`}>
                    {editForm.isClosed ? (
                      <X className="w-6 h-6 text-white" />
                    ) : (
                      <Clock className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Store Status</h4>
                    <p className={`text-sm ${editForm.isClosed ? 'text-red-600' : 'text-gray-600'}`}>
                      {editForm.isClosed ? 'Closed all day' : 'Open with hours'}
                    </p>
                  </div>    
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isClosed}
                    onChange={(e) => setEditForm({ ...editForm, isClosed: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-16 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-8 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-red-500 shadow-inner"></div>
                </label>
              </div>
            </div>

            {/* Time Inputs */}
            <div className={`transition-all duration-500 ${
              editForm.isClosed 
                ? 'opacity-0 pointer-events-none transform scale-95' 
                : 'opacity-100 transform scale-100'
            }`}>
              <h4 className="font-bold text-gray-900 text-lg mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <span>Operating Hours</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Opening Time */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Opening Time
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <Clock className="w-5 h-5 text-green-500 ml-2" />
                    </div>
                    <input
                      type="time"
                      value={editForm.openingTime}
                      onChange={(e) => setEditForm({ ...editForm, openingTime: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 text-lg font-mono border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-200 bg-white shadow-inner"
                      disabled={editForm.isClosed}
                    />
                  </div>
                </div>
                
                {/* Closing Time */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Closing Time
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <Clock className="w-5 h-5 text-red-500 ml-2" />
                    </div>
                    <input
                      type="time"
                      value={editForm.closingTime}
                      onChange={(e) => setEditForm({ ...editForm, closingTime: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 text-lg font-mono border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-red-200 focus:border-red-500 transition-all duration-200 bg-white shadow-inner"
                      disabled={editForm.isClosed}
                    />
                  </div>
                </div>
              </div>

              {/* Time Duration Display */}
              {!editForm.isClosed && editForm.openingTime && editForm.closingTime && (
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-center space-x-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-800 font-semibold">
                      Duration: {(() => {
                        const start = new Date(`2000-01-01 ${editForm.openingTime}`);
                        const end = new Date(`2000-01-01 ${editForm.closingTime}`);
                        const diff = (end - start) / (1000 * 60 * 60);
                        return `${diff.toFixed(1)} hours`;
                      })()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mt-10">
            <button
              onClick={handleCancel}
              className="flex-1 px-6 py-4 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl font-bold transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className={`flex-1 px-6 py-4 text-white font-bold rounded-2xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 ${dayColor} hover:shadow-xl`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Check className="w-5 h-5" />
                <span>Save Changes</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Hours</h1>
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${currentStatus.status === 'Open Now' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
            <p className={`text-lg font-semibold ${currentStatus.color}`}>
              {currentStatus.status}
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Days Grid */}
          <div className="p-6 space-y-1">
            {hours.map((hour, index) => (
              <div 
                key={index} 
                className={`group flex items-center justify-between p-5 rounded-2xl transition-all duration-300 hover:bg-gray-50 hover:shadow-md border border-transparent hover:border-gray-100 ${
                  hour.isClosed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center space-x-4 flex-1">
                  {/* Day */}
                  <div className="w-20">
                    <span className="font-bold text-gray-900 text-lg capitalize">{hour.day}</span>
                  </div>
                  
                  {/* Times */}
                  <div className="flex items-center space-x-6 flex-1">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${hour.isClosed ? 'bg-gray-300' : 'bg-green-400'}`}></div>
                      <Clock className={`w-4 h-4 ${hour.isClosed ? 'text-gray-400' : 'text-blue-500'}`} />
                      <span className={`font-mono text-lg ${hour.isClosed ? 'text-gray-400' : 'text-gray-700'}`}>
                        {formatTimeToAMPM(hour.openingTime)}
                      </span>
                    </div>
                    
                    <div className="text-gray-400">→</div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className={`w-4 h-4 ${hour.isClosed ? 'text-gray-400' : 'text-red-500'}`} />
                      <span className={`font-mono text-lg ${hour.isClosed ? 'text-gray-400' : 'text-gray-700'}`}>
                          {formatTimeToAMPM(hour.closingTime)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Status */}
                  <div className="w-24 text-right">
                    {hour.isClosed ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Closed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Open
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Edit Button */}
                <button
                  onClick={() => handleEdit(index)}
                  className="ml-4 p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveToParent}
            disabled={!hasChanges}
            className={`px-6 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all duration-200 ${
              hasChanges 
                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-5 h-5" />
            <span>Save Hours</span>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p className="text-sm">Last updated: {new Date().toLocaleDateString()}</p>
          <p className="text-xs mt-1 text-green-600">All 7 days configured ✓</p>
        </div>
      </div>

      <EditModal />
    </div>
  );
};

export default StoreHours;