import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Star, User } from "lucide-react";
import LoadingForAdmins from "../AdminUtils/LoadingForAdmins";
import apiClient from "../../../apis/apiClient/apiClient";

function RestaurantReviewsPage() {
  const { restaurantId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await apiClient.get(
          `/feedback/restaurants/${restaurantId}`
        );
        setReviews(res.data.reviews || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching restaurant reviews:", err);
        setError("Failed to load restaurant reviews");
        setLoading(false);
      }
    };

    fetchReviews();
  }, [restaurantId]);

  if (loading) {
    return (
    <LoadingForAdmins/>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Restaurant Reviews
        </h2>

        {reviews.length === 0 ? (
          <p className="text-gray-600">
            No reviews available for this restaurant.
          </p>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center text-sm text-gray-700 space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">
                      {review.userId?.name || "Anonymous"}
                    </span>
                  </div>
                  <div className="flex items-center text-yellow-500">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>

                <p className="text-gray-800 text-sm mb-1">
                  {review.comment || "No comment provided"}
                  <img className="h-20 mt-1.5" src={review.images[0]} alt="" />
                </p>

                <div className="text-xs text-gray-500">
                  {new Date(review.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RestaurantReviewsPage;
