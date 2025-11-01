import React from 'react';
import { FaClipboard, FaCheck, FaTimes, FaUser, FaCalendarAlt, FaPlus, FaTrash } from 'react-icons/fa';
import { useState } from 'react';

const AgentAdminRemarksDash = () => {
  const [notes, setNotes] = useState([
    { id: 1, text: "Very punctual with deliveries", date: "2023-05-15", author: "Manager" },
    { id: 2, text: "Needs improvement in customer feedback", date: "2023-06-02", author: "Supervisor" },
    { id: 3, text: "Excellent performance during peak hours", date: "2023-06-10", author: "Admin" },
  ]);
  const [newNote, setNewNote] = useState("");

  const handleAddNote = () => {
    if (newNote.trim()) {
      const currentDate = new Date().toISOString().split('T')[0];
      setNotes([...notes, {
        id: Date.now(),
        text: newNote,
        date: currentDate,
        author: "Admin"
      }]);
      setNewNote("");
    }
  };

  const handleDeleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddNote();
    }
  };

  const getAuthorColor = (author) => {
    const colors = {
      'Manager': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
      'Supervisor': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
      'Admin': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    };
    return colors[author] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="w-full mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-green-600/10 rounded-full transform translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-blue-600/10 rounded-full transform -translate-x-12 translate-y-12"></div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-green-400 to-green-600 p-4 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <FaClipboard className="text-white text-2xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">Notes & Remarks</h1>
                  <p className="text-gray-600 text-lg">Track performance feedback and observations</p>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full">
                <FaClipboard className="text-green-600 text-sm" />
                <span className="text-green-700 font-semibold text-sm">{notes.length} Notes</span>
              </div>
            </div>
          </div>
        </div>

       {/* Add Note Section */}
<div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8 relative overflow-hidden">
  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/10 to-green-600/10 rounded-full transform translate-x-10 -translate-y-10"></div>
  
  <div className="relative">
    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
      <FaPlus className="text-green-600" />
      <span>Add New Remark</span>
    </h3>
    
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <input
        type="text"
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        onKeyPress={handleKeyPress}
        className="flex-1 p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 text-gray-700 placeholder-gray-400"
        placeholder="Add new remark (e.g. 'Very punctual', 'Needs improvement')"
      />
      <button
        onClick={handleAddNote}
        className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 sm:p-4 rounded-xl hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 w-full sm:w-auto"
      >
        <FaCheck className="text-lg" />
        <span className="font-medium">Add Note</span>
      </button>
    </div>
  </div>
</div>

        {/* Notes List */}
        <div className="space-y-4">
          {notes.map((note, index) => {
            const authorColor = getAuthorColor(note.author);
            return (
              <div
                key={note.id}
                className="group bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-gray-100/50 to-gray-200/50 rounded-full transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className="relative flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-gray-800 text-lg font-medium mb-4 leading-relaxed">
                      {note.text}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <FaCalendarAlt className="text-gray-400" />
                        <span className="text-gray-600 font-medium">{note.date}</span>
                      </div>
                      
                     
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="ml-4 text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all duration-300 transform hover:scale-110"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
                
                {/* Animated bottom border */}
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-green-400 to-green-600 group-hover:w-full transition-all duration-500"></div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {notes.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaClipboard className="text-gray-400 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">No remarks yet</h3>
            <p className="text-gray-500">Add your first remark to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentAdminRemarksDash;