import React, { useEffect, useState } from 'react';
import axios from 'axios';
import OrderCard from './AdminOrderCard';
import OrderDetailsPanel from './AdminOrderPanel';
import apiClient from '../../../apis/apiClient/apiClient';

const AdminOrdersContent = ({ userId }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('adminToken')

  useEffect(() => {
    if (!userId) return;

    const fetchOrders = async () => {
      try {
        const res = await apiClient.get(`/admin/customer-orders/${userId}`
          
        );
        console.log("Fetched admin customer orders:", res.data);
        setOrders(res.data.data || []);
      } catch (error) {
        console.error("Failed to load admin customer orders", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  if (loading) return <div className="p-6">Loading orders...</div>;

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">
        Customer's Past Orders
      </h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        orders.map((order) => (
          <OrderCard
            key={order._id}
            order={order}
            onViewDetails={() => setSelectedOrder(order)}
          />
        ))
      )}

      {orders.length > 0 && (
        <div className="mt-8 text-center">
          <button className="text-gray-600 font-medium hover:text-gray-800">
            SHOW MORE ORDERS
          </button>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailsPanel
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default AdminOrdersContent;
