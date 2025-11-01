import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isAfter,
  isBefore,
  isWithinInterval,
} from 'date-fns';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

// --- Utility Functions ---

// weekStartsOn: 1 means Monday is the first day of the week
const getDaysInMonth = (date) => {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};

// --- Functional Time Slider Component ---

// Move utility functions outside to avoid recreating them
const timeToMinutesHelper = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTimeHelper = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const TimeSlider = ({ startTime, endTime, onTimeChange }) => {
  // Convert 'HH:mm' string to minutes from midnight (0 to 1439)
  const timeToMinutes = useCallback((time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }, []);

  // Convert minutes (0 to 1439) to 'HH:mm' string
  const minutesToTime = useCallback((minutes) => {
    return minutesToTimeHelper(minutes);
  }, []);
  
  // Convert minutes to a display format like "12:00 AM"
  const minutesToDisplayTime = useCallback((minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const date = new Date();
    date.setHours(h, m, 0, 0);
    return format(date, 'h:mm a');
  }, []);

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  // Percentage calculations for slider visual
  const startPercent = (startMinutes / 1440) * 100;
  const endPercent = (endMinutes / 1440) * 100;
  const widthPercent = endPercent - startPercent;

  const [isDragging, setIsDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const trackRef = useRef(null);
  const rafRef = useRef(null);
  const dragDataRef = useRef({ startTime, endTime, onTimeChange, minutesToTime, timeToMinutes });

  // Keep refs updated with latest values
  useEffect(() => {
    dragDataRef.current = { startTime, endTime, onTimeChange, minutesToTime, timeToMinutes };
  }, [startTime, endTime, onTimeChange, minutesToTime, timeToMinutes]);

  const handleMouseDown = (handle, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = trackRef.current.getBoundingClientRect();
    const handleX = handle === 'start' 
      ? (startPercent / 100) * rect.width
      : (endPercent / 100) * rect.width;
    
    const clickX = e.clientX - rect.left;
    const offset = clickX - handleX;
    
    setIsDragging(handle);
    setDragOffset(offset);
    
    const handleMouseMoveFn = (e) => {
      if (!trackRef.current) return;

      // Cancel any pending animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Use requestAnimationFrame for smooth updates
      rafRef.current = requestAnimationFrame(() => {
        const currentData = dragDataRef.current;
        const rect = trackRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left - offset, rect.width));
        const percent = x / rect.width;
        const newMinutes = Math.max(0, Math.min(Math.round(percent * 1440), 1440));

        if (handle === 'start') {
          const endMin = currentData.timeToMinutes(currentData.endTime);
          // Ensure start doesn't go past end (reduced to 5 minutes for smoother dragging)
          const clampedMinutes = Math.min(newMinutes, endMin - 5);
          currentData.onTimeChange(currentData.minutesToTime(clampedMinutes), currentData.endTime);
        } else if (handle === 'end') {
          const startMin = currentData.timeToMinutes(currentData.startTime);
          // Ensure end doesn't go before start (reduced to 5 minutes for smoother dragging)
          const clampedMinutes = Math.max(newMinutes, startMin + 5);
          currentData.onTimeChange(currentData.startTime, currentData.minutesToTime(clampedMinutes));
        }
      });
    };

    const handleMouseUpFn = () => {
      setIsDragging(null);
      setDragOffset(0);
      // Cancel any pending animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      document.removeEventListener('mousemove', handleMouseMoveFn);
      document.removeEventListener('mouseup', handleMouseUpFn);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
    
    document.addEventListener('mousemove', handleMouseMoveFn);
    document.addEventListener('mouseup', handleMouseUpFn);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
  };

  const handleTrackClick = (e) => {
    if (isDragging) return;
    
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const clickedMinutes = Math.round((x / rect.width) * 1440);
    
    // Determine which handle is closer and move it
    const distanceToStart = Math.abs(clickedMinutes - startMinutes);
    const distanceToEnd = Math.abs(clickedMinutes - endMinutes);
    
    if (distanceToStart < distanceToEnd && clickedMinutes <= endMinutes - 5) {
      // Move start handle
      onTimeChange(minutesToTime(clickedMinutes), endTime);
    } else if (clickedMinutes >= startMinutes + 5) {
      // Move end handle
      onTimeChange(startTime, minutesToTime(clickedMinutes));
    }
  };

  return (
    <div className="pb-3 pt-2 mb-3 border-b border-gray-200">
      <p className="mb-4 text-sm font-medium text-gray-700">
        Time Range: <strong>{minutesToDisplayTime(startMinutes)} - {minutesToDisplayTime(endMinutes)}</strong>
      </p>
      
      <div 
        ref={trackRef}
        className="relative h-2 bg-gray-200 rounded-full cursor-pointer group"
        onClick={handleTrackClick}
      >
        {/* Background track with subtle grid */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100 to-transparent opacity-30"></div>
        
        {/* Blue track representing the selected time span */}
        <div 
          className="absolute top-0 h-full bg-blue-500 rounded-full transition-all duration-150"
          style={{ left: `${startPercent}%`, width: `${widthPercent}%` }}
        ></div>
        
        {/* Start Handle */}
        <div 
          className={`absolute top-1/2 w-5 h-5 bg-white border-2 border-blue-500 rounded-full -translate-y-1/2 -ml-2.5 shadow-lg transition-all duration-150 z-20 ${
            isDragging === 'start' 
              ? 'scale-110 cursor-grabbing shadow-xl' 
              : 'cursor-grab hover:scale-110 hover:shadow-xl'
          }`}
          style={{ left: `${startPercent}%` }}
          onMouseDown={(e) => handleMouseDown('start', e)}
        >
          {/* Tooltip */}
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            {minutesToDisplayTime(startMinutes)}
          </div>
        </div>
        
        {/* End Handle */}
        <div 
          className={`absolute top-1/2 w-5 h-5 bg-white border-2 border-blue-500 rounded-full -translate-y-1/2 -ml-2.5 shadow-lg transition-all duration-150 z-20 ${
            isDragging === 'end' 
              ? 'scale-110 cursor-grabbing shadow-xl' 
              : 'cursor-grab hover:scale-110 hover:shadow-xl'
          }`}
          style={{ left: `${endPercent}%` }}
          onMouseDown={(e) => handleMouseDown('end', e)}
        >
          {/* Tooltip */}
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            {minutesToDisplayTime(endMinutes)}
          </div>
        </div>

        {/* Active dragging overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-blue-50 rounded-full opacity-30"></div>
        )}
      </div>
      
      {/* Time labels for context */}
      <div className="flex justify-between text-xs text-gray-500 mt-3">
        <span className="font-medium">12:00 AM</span>
        <span className="font-medium">12:00 PM</span>
        <span className="font-medium">11:59 PM</span>
      </div>

      {/* Current time display during drag */}
      {isDragging && (
        <div className="text-center mt-2">
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {isDragging === 'start' 
              ? `Start: ${minutesToDisplayTime(startMinutes)}`
              : `End: ${minutesToDisplayTime(endMinutes)}`
            }
          </span>
        </div>
      )}
    </div>
  );
};

// --- Main Component ---

function TopbarFilter({ onFilterChange }) {
  const today = useMemo(() => new Date(), []);
  
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(today);
  
  // Date State: Use two dates for range selection
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  
  // Time State
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('23:59');

  const panelRef = useRef(null);
  const buttonRef = useRef(null);
  const hasInitialized = useRef(false);

  // Track if we should apply filter (only when panel closes)
  const [shouldApplyFilter, setShouldApplyFilter] = useState(false);

  // --- Date & Time Range Application Logic ---
  
  const applyFilter = useCallback(() => {
    // Format dates to 'YYYY-MM-DD' for API
    const from = format(startDate, 'yyyy-MM-dd');
    const to = format(endDate, 'yyyy-MM-dd');

    onFilterChange({
      period: isSameDay(startDate, today) && isSameDay(endDate, today) ? 'today' : 'custom',
      from: from,
      to: to,
      startTime: startTime,
      endTime: endTime,
      display: isSameDay(startDate, endDate) 
        ? `${format(startDate, 'MMM d')} ${minutesToDisplayTime(timeToMinutes(startTime))} - ${minutesToDisplayTime(timeToMinutes(endTime))}`
        : `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`
    });
  }, [startDate, endDate, startTime, endTime, onFilterChange, today]);
  
  // Apply filter only when panel closes and we have changes
  useEffect(() => {
    if (!isPanelOpen && shouldApplyFilter) {
      applyFilter();
      setShouldApplyFilter(false); // Reset after applying
    }
  }, [isPanelOpen, shouldApplyFilter, applyFilter]);

  // Apply initial filter on mount (only once)
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      // Format dates to 'YYYY-MM-DD' for API
      const from = format(startDate, 'yyyy-MM-dd');
      const to = format(endDate, 'yyyy-MM-dd');

      onFilterChange({
        period: isSameDay(startDate, today) && isSameDay(endDate, today) ? 'today' : 'custom',
        from: from,
        to: to,
        startTime: startTime,
        endTime: endTime,
        display: isSameDay(startDate, endDate) 
          ? `${format(startDate, 'MMM d')} ${minutesToDisplayTime(timeToMinutes(startTime))} - ${minutesToDisplayTime(timeToMinutes(endTime))}`
          : `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Close the panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        isPanelOpen &&
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsPanelOpen(false);
        setShouldApplyFilter(true); // Apply filter when closing via click outside
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPanelOpen]);

  // Days array for the calendar grid
  const days = useMemo(() => getDaysInMonth(currentMonth), [currentMonth]);

  // Time conversion utility for internal use
  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const minutesToDisplayTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const date = new Date();
    date.setHours(h, m, 0, 0);
    return format(date, 'h:mm a');
  };
  
  const handleTimeChange = (newStart, newEnd) => {
    setStartTime(newStart);
    setEndTime(newEnd);
    setShouldApplyFilter(true); // Mark that we have changes to apply
  };
  
  // --- Date Selection Logic (Single or Range) ---

  const handleDayClick = (day) => {
    // 1. If start and end are the same, start a new range.
    if (isSameDay(startDate, endDate)) {
      if (isSameDay(day, startDate)) {
        // If they click the same day, do nothing or open time slider.
      } else if (isBefore(day, startDate)) {
        // New day is before current, make it the new start, clear end.
        setStartDate(day);
        setEndDate(day);
      } else {
        // New day is after current, make it the new end.
        setEndDate(day);
      }
    } 
    // 2. If a range is active, start a brand new selection.
    else {
      setStartDate(day);
      setEndDate(day);
    }
    setShouldApplyFilter(true); // Mark that we have changes to apply
  };

  const handleApplyClick = () => {
    setIsPanelOpen(false);
    setShouldApplyFilter(true); // This will trigger the filter application
  };

  const DayButton = ({ day }) => {
    const isCurrentMonth = isSameMonth(day, currentMonth);
    const isSingleSelected = isSameDay(day, startDate) && isSameDay(startDate, endDate);
    const isRangeStart = isSameDay(day, startDate) && !isSameDay(startDate, endDate);
    const isRangeEnd = isSameDay(day, endDate) && !isSameDay(startDate, endDate);
    const isInRange = isWithinInterval(day, { start: startDate, end: endDate }) && !isSingleSelected && !isRangeStart && !isRangeEnd;

    let baseClasses = 'flex items-center justify-center w-8 h-8 mx-auto text-sm rounded-full transition-all duration-150 relative z-10';
    let textClasses = isCurrentMonth ? 'text-gray-700' : 'text-gray-400';
    let hoverClasses = isCurrentMonth ? 'hover:bg-gray-100' : 'opacity-50';
    let wrapperClasses = 'py-1 relative';

    if (isSingleSelected) {
      baseClasses = 'flex items-center justify-center w-8 h-8 mx-auto text-sm rounded-full transition-all duration-150 bg-blue-500 text-white shadow-lg relative z-10 hover:bg-blue-600';
      textClasses = 'text-white';
      hoverClasses = 'hover:bg-blue-600';
    } 
    
    if (isRangeStart || isRangeEnd) {
      baseClasses = 'flex items-center justify-center w-8 h-8 mx-auto text-sm rounded-full transition-all duration-150 bg-blue-500 text-white shadow-lg relative z-10 hover:bg-blue-600';
      textClasses = 'text-white';
    }

    if (isRangeStart && !isRangeEnd) {
        wrapperClasses += ' after:absolute after:inset-y-1 after:right-0 after:bg-blue-100 after:w-1/2 after:z-0';
    }
    if (isRangeEnd && !isRangeStart) {
        wrapperClasses += ' before:absolute before:inset-y-1 before:left-0 before:bg-blue-100 before:w-1/2 before:z-0';
    }
    
    if (isInRange) {
        wrapperClasses += ' bg-blue-100/70';
        baseClasses = 'flex items-center justify-center w-8 h-8 mx-auto text-sm rounded-full transition-all duration-150 text-blue-700 relative z-10 hover:bg-blue-200';
    }

    return (
      <div className={wrapperClasses}>
        <button
          className={`${baseClasses} ${textClasses} ${hoverClasses}`}
          onClick={() => handleDayClick(day)}
          disabled={!isCurrentMonth}
        >
          {format(day, 'd')}
        </button>
      </div>
    );
  };
  
  // --- Rendered Display Value ---
  
  const displayValue = useMemo(() => {
    const startDisplay = format(startDate, 'MMM d');
    const endDisplay = format(endDate, 'MMM d');
    const timeDisplay = `${minutesToDisplayTime(timeToMinutes(startTime))} - ${minutesToDisplayTime(timeToMinutes(endTime))}`;

    if (isSameDay(startDate, today) && isSameDay(endDate, today)) {
        return `Today ${timeDisplay}`;
    }
    if (isSameDay(startDate, endDate)) {
        return `${startDisplay} ${timeDisplay}`;
    }
    return `${startDisplay} - ${endDisplay} (${timeDisplay})`;
  }, [startDate, endDate, startTime, endTime, today]);

  return (
    <div className="flex justify-center w-full">
      <div className="relative inline-block text-left">
        {/* 1. Trigger Button */}
        <button
          ref={buttonRef}
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className="flex items-center px-4 py-2.5 text-sm font-medium text-white bg-gray-800 border border-gray-700 rounded-lg shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
          aria-expanded={isPanelOpen}
          aria-haspopup="true"
        >
          <span className="font-semibold">{displayValue}</span>
          <ChevronDown
            className={`w-4 h-4 ml-2 text-gray-400 transition-transform duration-200 ${isPanelOpen ? 'rotate-180 text-white' : ''}`}
          />
        </button>

        {/* 2. Dropdown Panel */}
        {isPanelOpen && (
          <div
            ref={panelRef}
            className="absolute left-1/2 transform -translate-x-1/2 z-50 w-80 bg-white border border-gray-200 rounded-lg shadow-2xl mt-2 animate-in fade-in zoom-in-95"
          >
            <div className="p-4">
              {/* Time Range Slider Section */}
              <TimeSlider 
                startTime={startTime} 
                endTime={endTime} 
                onTimeChange={handleTimeChange} 
              />

              {/* Calendar View */}
              <div className="text-center">
                {/* Month Header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-2 text-gray-500 rounded-full hover:bg-gray-100 transition-colors duration-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-base font-semibold text-gray-800">
                    {format(currentMonth, 'MMMM yyyy')}
                  </span>
                  <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-2 text-gray-500 rounded-full hover:bg-gray-100 transition-colors duration-200"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Weekday Labels */}
                <div className="grid grid-cols-7 text-xs font-medium text-gray-500 mb-1">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="py-1">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 text-sm gap-0.5">
                  {days.map((day, index) => (
                    <DayButton key={index} day={day} />
                  ))}
                </div>
              </div>

              {/* Apply Button */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={handleApplyClick}
                  className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TopbarFilter;