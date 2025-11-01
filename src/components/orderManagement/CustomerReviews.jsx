import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

export default function CustomerReviews() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const reviews = [
    {
      id: 1,
      name: "St Clix",
      location: "South London",
      date: "24th September, 2023",
      rating: 5,
      text: "The positive aspect was undoubtedly the efficiency of the service. The queue moved quickly, the staff was friendly, and the food was up to the usual McDonald's standards - hot and satisfying."
    },
    {
      id: 2,
      name: "St Clix",
      location: "South London", 
      date: "24th September, 2023",
      rating: 5,
      text: "The positive aspect was undoubtedly the efficiency of the service. The queue moved quickly, the staff was friendly, and the food was up to the usual McDonald's standards - hot and satisfying."
    },
    {
      id: 3,
      name: "St Gin",
      location: "South London",
      date: "24th September, 2023", 
      rating: 5,
      text: "The positive aspect was undoubtedly the efficiency of the service. The queue moved quickly, the staff was friendly, and the food was up to the usual McDonald's standards - hot and satisfying."
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(1, reviews.length - 2));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.max(1, reviews.length - 2)) % Math.max(1, reviews.length - 2));
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
  };

  const renderOverallStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-2xl ${i < 3 ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="max-w-8xl mx-auto p-6 bg-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
        <div className="flex gap-2">
          <button
            onClick={prevSlide}
            className="w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Reviews Carousel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {reviews.slice(currentSlide, currentSlide + 3).map((review, index) => (
          <div key={review.id} className="bg-white rounded-lg p-6 shadow-sm">
            {/* User Info */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {review.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{review.name}</h4>
                    <p className="text-red-500 text-xs">{review.location}</p>
                  </div>
                  <div className="flex">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{review.date}</span>
                </div>
              </div>
            </div>

            {/* Review Text */}
            <p className="text-sm text-gray-700 leading-relaxed">
              {review.text}
            </p>
          </div>
        ))}
      </div>

      {/* Overall Rating */}
      <div className="relative">
      <div className="absolute left-1/2 -translate-x-1/2 -top-8 bg-white px-6 py-4 rounded-xl shadow-lg text-center w-32">
        <div className="text-3xl font-bold text-gray-900 mb-1">3.4</div>
        <div className="flex justify-center mb-1">
          {renderOverallStars()}
        </div>
        <p className="text-xs text-gray-500">1,366 reviews</p>
      </div>
    </div>
    </div>
  );
}