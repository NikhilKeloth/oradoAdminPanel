import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AgentRatings = () => {
  // Self-contained dummy data
  const ratingsData = {
    customer: {
      average: 4.8,
      total: 342,
      reviews: [
        {
          id: 1,
          name: "Sara Adams",
          date: "5 days ago",
          rating: 5,
          comment: "Well, this was simply amazing. Service: you have some great people there. And I haven drove the expectation that one has when coming to a 3-star restaurant.",
          profilePic: ""
        },
        {
          id: 2,
          name: "Rahul Sharma",
          date: "1 week ago",
          rating: 4,
          comment: "Prompt delivery and polite service. Food was still warm when it arrived.",
          profilePic: ""
        },
        {
          id: 3,
          name: "Priya Patel",
          date: "2 weeks ago",
          rating: 5,
          comment: "Excellent service! The agent was very careful with my fragile items.",
          profilePic: ""
        },
        {
          id: 4,
          name: "Vikram Singh",
          date: "3 weeks ago",
          rating: 3,
          comment: "Delivery was on time but the agent seemed in a hurry.",
          profilePic: ""
        },
        {
          id: 5,
          name: "Ananya Gupta",
          date: "1 month ago",
          rating: 5,
          comment: "Best delivery experience ever! The agent went above and beyond.",
          profilePic: ""
        },
        {
          id: 6,
          name: "Arjun Kapoor",
          date: "1 month ago",
          rating: 4,
          comment: "Good service overall. No complaints.",
          profilePic: ""
        },
        {
          id: 7,
          name: "Neha Joshi",
          date: "2 months ago",
          rating: 5,
          comment: "Very professional and courteous. Will request this agent again!",
          profilePic: ""
        },
        {
          id: 8,
          name: "Karan Malhotra",
          date: "2 months ago",
          rating: 2,
          comment: "Late delivery and poor packaging. Not happy with the service.",
          profilePic: ""
        }
      ]
    },
    merchant: {
      average: 4.5,
      total: 128,
      reviews: [
        {
          id: 1,
          name: "Spice Garden",
          date: "3 days ago",
          rating: 5,
          comment: "Always reliable and careful with our delicate dishes. Highly recommend!",
          profilePic: ""
        },
        {
          id: 2,
          name: "Burger King",
          date: "1 week ago",
          rating: 4,
          comment: "Consistent performance. Rarely have any issues with this agent.",
          profilePic: ""
        },
        {
          id: 3,
          name: "Pizza Hut",
          date: "2 weeks ago",
          rating: 3,
          comment: "Generally good but sometimes arrives late during peak hours.",
          profilePic: ""
        },
        {
          id: 4,
          name: "Domino's",
          date: "3 weeks ago",
          rating: 5,
          comment: "Our preferred agent for pizza deliveries. Handles orders with care.",
          profilePic: ""
        },
        {
          id: 5,
          name: "Subway",
          date: "1 month ago",
          rating: 4,
          comment: "Polite and efficient. Customers often compliment his service.",
          profilePic: ""
        },
        {
          id: 6,
          name: "KFC",
          date: "1 month ago",
          rating: 4,
          comment: "Good communication skills and maintains food temperature well.",
          profilePic: ""
        },
        {
          id: 8,
          name: "Chief Direct",
          date: "2 months ago",
          rating: 2,
          comment: "Late delivery and poor packaging. Not happy with the service.",
          profilePic: ""
        }
      ]
    }
  };

  const [activeTab, setActiveTab] = useState('customer');
  const [currentPage, setCurrentPage] = useState(1);

  const activeReviews = ratingsData[activeTab].reviews;
  const totalPages = Math.ceil(activeReviews.length / 6);
  const paginatedReviews = activeReviews.slice((currentPage - 1) * 6, currentPage * 6);

  const RatingCard = ({ review }) => (
    <motion.div 
      whileHover={{ y: -5, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}
      className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm h-full flex flex-col transition-all duration-200"
    >
      <div className="flex items-start mb-3">
        <div className="w-10 h-10 rounded-full bg-orange-50 flex-shrink-0 flex items-center justify-center overflow-hidden mr-3">
          <img 
            src={review.profilePic || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} 
            alt={review.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{review.name}</h4>
          <div className="flex items-center mt-1">
            <div className="flex mr-2">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-500">{review.date}</span>
          </div>
        </div>
      </div>
      <p className="text-gray-700 text-sm mt-2 leading-relaxed">{review.comment}</p>
    </motion.div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mt-6"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">💬</span>
            Ratings & Reviews
          </h2>
        </div>

        {/* Rating Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Average Customer Rating</h3>
                <p className="text-3xl font-bold text-blue-600 mt-1">{ratingsData.customer.average}</p>
                <div className="flex mt-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(ratingsData.customer.average) ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-500">Total Ratings</span>
                <p className="text-lg font-semibold text-gray-900">{ratingsData.customer.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Average Merchant Rating</h3>
                <p className="text-3xl font-bold text-blue-600 mt-1">{ratingsData.merchant.average}</p>
                <div className="flex mt-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(ratingsData.merchant.average) ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-500">Total Ratings</span>
                <p className="text-lg font-semibold text-gray-900">{ratingsData.merchant.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => {
              setActiveTab('customer');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 font-medium text-sm focus:outline-none ${activeTab === 'customer' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Customer Ratings ({ratingsData.customer.total})
          </button>
          <button
            onClick={() => {
              setActiveTab('merchant');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 font-medium text-sm focus:outline-none ${activeTab === 'merchant' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Merchant Ratings ({ratingsData.merchant.total})
          </button>
        </div>

        {/* Rating Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedReviews.map(review => (
            <RatingCard key={review.id} review={review} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page ? 'z-10 bg-orange-50 border-orange-500 text-orange-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AgentRatings;




// new heading for review and ratings just remove this part from that code and add the big one down below

{/* <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">💬</span>
            Ratings & Reviews
          </h2>
        </div> */}

// new heading below this 
// ----------------------------------------------------------------------------------------------------------------
// {/* Replace the current header section (the one with the 💬 emoji) with this: */}
{/* <div className="mb-6 md:mb-8">
  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8 relative overflow-hidden">
    
    <div className="hidden sm:block absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-400/10 to-blue-600/10 rounded-full transform translate-x-10 -translate-y-10 md:translate-x-16 md:-translate-y-16"></div>
    <div className="hidden sm:block absolute bottom-0 left-0 w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-purple-400/10 to-purple-600/10 rounded-full transform -translate-x-8 translate-y-8 md:-translate-x-12 md:translate-y-12"></div>
    
    <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 sm:p-4 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300 min-w-[48px]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Ratings & Reviews</h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600">Customer and merchant feedback</p>
        </div>
      </div>
      <div className="flex items-center bg-blue-100 px-3 py-1 sm:px-4 sm:py-2 rounded-full self-end sm:self-auto">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        <span className="text-xs sm:text-sm font-semibold text-blue-700 ml-1 sm:ml-2">
          {ratingsData.customer.total + ratingsData.merchant.total} Total
        </span>
      </div>
    </div>
  </div> */}
