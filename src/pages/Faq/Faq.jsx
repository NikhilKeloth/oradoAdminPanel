import React, { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import axios from "axios";
import apiClient from "../../apis/apiClient/apiClient";

export default function Faq() {
  const [faqData, setFaqData] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);

  // Fetch FAQs from backend on mount
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const res = await apiClient.get("/faq"); // Update if your API prefix is different
        setFaqData(res.data.faqs);
        console.log(res)
      } catch (err) {
        console.error("Error fetching FAQs", err);
      }
    };
    fetchFAQs();
  }, []);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Navbar />
      <div className="flex mt-15 flex-col justify-between bg-gray-100 text-gray-800 min-h-screen">
        {/* FAQ Section */}
        <main className="max-w-3xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-semibold mb-6 text-center">Frequently Asked Questions</h2>

          {faqData.length === 0 ? (
            <p className="text-center text-gray-500">No FAQs available.</p>
          ) : (
            <div className="space-y-4">
              {faqData.map((item, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-4">
                  <button
                    className="w-full text-left font-medium text-lg flex justify-between items-center"
                    onClick={() => toggle(index)}
                  >
                    <span>{item.question}</span>
                    <svg
                      className={`w-5 h-5 transform transition-transform duration-200 ${
                        openIndex === index ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div
                    className={`overflow-hidden transition-max-height duration-300 ${
                      openIndex === index ? "max-h-40 mt-2" : "max-h-0"
                    }`}
                  >
                    <p className="text-gray-600">{item.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
