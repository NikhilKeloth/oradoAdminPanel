import React from 'react';
import { Truck, Phone, Clock } from 'lucide-react';

export default function RestaurantInfo() {
  return (
    <div className="max-w-7xl mx-auto p-4 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 rounded-lg overflow-hidden shadow-lg">
        {/* Delivery Information */}
        <div className="bg-white p-6 border-r border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <Truck className="w-6 h-6 text-gray-800" />
            <h2 className="text-lg font-semibold text-gray-800">Delivery information</h2>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Monday:</span>
              <span className="text-gray-600">12:00 AM–3:00 AM, 8:00 AM–3:00 AM</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Tuesday:</span>
              <span className="text-gray-600">8:00 AM–3:00 AM</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Wednesday:</span>
              <span className="text-gray-600">8:00 AM–3:00 AM</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Thursday:</span>
              <span className="text-gray-600">8:00 AM–3:00 AM</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Friday:</span>
              <span className="text-gray-600">8:00 AM–3:00 AM</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Saturday:</span>
              <span className="text-gray-600">8:00 AM–3:00 AM</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Sunday:</span>
              <span className="text-gray-600">8:00 AM–12:00 AM</span>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">Estimated time until delivery:</span>
              <span className="text-gray-600">20 min</span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white p-6 border-r border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <Phone className="w-6 h-6 text-gray-800" />
            <h2 className="text-lg font-semibold text-gray-800">Contact information</h2>
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-gray-600 leading-relaxed">
              If you have allergies or other dietary restrictions, please contact the restaurant. The restaurant will provide food-specific information upon request.
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Phone number</p>
            <p className="text-sm text-gray-600">+9348888443-43</p>
          </div>
        </div>

        {/* Operational Times */}
        <div className="bg-gray-900 text-white p-6">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-white" />
            <h2 className="text-lg font-semibold text-white">Operational Times</h2>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-gray-200">Monday:</span>
              <span className="text-gray-300">8:00 AM–3:00 AM</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-200">Tuesday:</span>
              <span className="text-gray-300">8:00 AM–3:00 AM</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-200">Wednesday:</span>
              <span className="text-gray-300">8:00 AM–3:00 AM</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-200">Thursday:</span>
              <span className="text-gray-300">8:00 AM–3:00 AM</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-200">Friday:</span>
              <span className="text-gray-300">8:00 AM–3:00 AM</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-200">Saturday:</span>
              <span className="text-gray-300">8:00 AM–3:00 AM</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-200">Sunday:</span>
              <span className="text-gray-300">8:00 AM–3:00 AM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}