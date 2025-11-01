import { useState } from "react";

const AvailabilitySettings = () => {
  const [dateAvailability, setDateAvailability] = useState("everyday");
  const [timeAvailability, setTimeAvailability] = useState("fulltime");
  const [specificDays, setSpecificDays] = useState([]);
  const [timeRange, setTimeRange] = useState({ from: "", to: "" });

  const handleDayToggle = (day) => {
    setSpecificDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Availability Settings</h3>

      {/* Date-wise Availability */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-2">
          Date-wise Availabilitysss
        </p>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="everyday"
              checked={dateAvailability === "everyday"}
              onChange={(e) => setDateAvailability(e.target.value)}
              className="mr-2"
            />
            Everyday
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="specific"
              checked={dateAvailability === "specific"}
              onChange={(e) => setDateAvailability(e.target.value)}
              className="mr-2"
            />
            Specific Day
          </label>
        </div>
      </div>

      {/* Specific Days Selector */}
      {dateAvailability === "specific" && (
        <div className="mb-6 flex flex-wrap gap-2">
          {days.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => handleDayToggle(day)}
              className={`px-3 py-1 rounded border ${
                specificDays.includes(day)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      )}

      {/* Time-wise Availability */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-2">
          Time-wise Availability
        </p>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="fulltime"
              checked={timeAvailability === "fulltime"}
              onChange={(e) => setTimeAvailability(e.target.value)}
              className="mr-2"
            />
            Full Time
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="specific"
              checked={timeAvailability === "specific"}
              onChange={(e) => setTimeAvailability(e.target.value)}
              className="mr-2"
            />
            Specific Time
          </label>
        </div>
      </div>

      {/* Specific Time Range */}
      {timeAvailability === "specific" && (
        <div className="flex space-x-4 items-center mb-4">
          <input
            type="time"
            value={timeRange.from}
            onChange={(e) =>
              setTimeRange((prev) => ({ ...prev, from: e.target.value }))
            }
            className="border border-gray-300 rounded p-2"
          />
          <span>to</span>
          <input
            type="time"
            value={timeRange.to}
            onChange={(e) =>
              setTimeRange((prev) => ({ ...prev, to: e.target.value }))
            }
            className="border border-gray-300 rounded p-2"
          />
        </div>
      )}
    </div>
  );
};

export default AvailabilitySettings;
