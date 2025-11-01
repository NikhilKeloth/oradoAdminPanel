import React from 'react';

// --- Static Data Mirroring the Provided Mockup ---
const DATE_RANGE = '07/01/2025 - 07/14/2025';

const SUMMARY_DATA = {
  totalOrders: 125,
  completed: 110,
  cancelled: 15,
  totalRevenue: '₹1,42,560',
  cashOrders: 35,
  onlineOrders: 90,
};

const ORDERS = [
  {
    id: 'ORD-67002DBB',
    dateTime: '2025-10-04 09:30',
    store: 'Pizza Paradise',
    customer: 'John Doe',
    phone: '9876543210',
    items: 'Margherita (1), Coke (1)',
    subtotal: 300.0,
    delivery: 30.0,
    tax: 12.5,
    discount: 50.0,
    total: 292.5,
    payment: 'Online',
    status: '✅ Delivered',
    statusColor: 'bg-green-100 text-green-800',
    agent: 'Ravi Kumar',
    eta: '9:55AM',
  },
  {
    id: 'ORD-67002DBC',
    dateTime: '2025-10-04 10:10',
    store: 'Burger House',
    customer: 'Alice Smith',
    phone: '9123456780',
    items: 'Burger (2), Fries (1)',
    subtotal: 450.0,
    delivery: 40.0,
    tax: 15.0,
    discount: 20.0,
    total: 485.0,
    payment: 'Cash',
    status: '❌ Cancelled by User',
    statusColor: 'bg-red-100 text-red-800',
    agent: '—',
    eta: '—',
  },
  {
    id: 'ORD-67002DBD',
    dateTime: '2025-10-04 10:20',
    store: 'Sushi Corner',
    customer: 'Bob Johnson',
    phone: '9988776655',
    items: 'Sushi Roll (3), Miso Soup (1)',
    subtotal: 620.0,
    delivery: 25.0,
    tax: 10.0,
    discount: 0.0,
    total: 655.0,
    payment: 'Online',
    status: '🕒 Preparing',
    statusColor: 'bg-yellow-100 text-yellow-800',
    agent: 'Ravi Kumar',
    eta: '10:45AM',
  },
  {
    id: 'ORD-67002DBE',
    dateTime: '2025-10-04 11:00',
    store: 'Taco Town',
    customer: 'Lisa Martin',
    phone: '9822334455',
    items: 'Tacos (2), Coke (2)',
    subtotal: 480.0,
    delivery: 35.0,
    tax: 14.0,
    discount: 30.0,
    total: 499.0,
    payment: 'Wallet',
    status: '✅ Delivered',
    statusColor: 'bg-green-100 text-green-800',
    agent: 'Sunil Patel',
    eta: '11:25AM',
  },
  {
    id: 'ORD-67002DBF',
    dateTime: '2025-10-04 11:30',
    store: 'Donut Den',
    customer: 'Mike Patel',
    phone: '9871200321',
    items: 'Donut (4), Coffee (2)',
    subtotal: 520.0,
    delivery: 20.0,
    tax: 18.0,
    discount: 50.0,
    total: 508.0,
    payment: 'Online',
    status: '🚗 Out for Delivery',
    statusColor: 'bg-blue-100 text-blue-800',
    agent: 'Ravi Kumar',
    eta: '11:55AM',
  },
];

const ORDER_DETAILS_DATA = {
    id: 'ORD-67002DBB',
    dateTime: '2025-10-04 09:30 AM',
    store: 'Pizza Paradise',
    customer: 'John Doe (9876543210)',
    paymentMethod: 'Online (Razorpay)',
    paymentStatus: 'Completed',
    orderStatus: 'Delivered',
    deliveryMode: 'Contactless',
    deliveryFee: 30,
    surgeFee: 0,
    tax: 12.5,
    discount: 50,
    subtotal: 300,
    grandTotal: 292.5,
    agent: 'Ravi Kumar (ID: AGT-101)',
    agentPhone: '9876500011',
    distance: '3.2 km',
    eta: '9:55 AM',
    deliveryTime: '25 mins',
    address: '123 MG Road, Indiranagar, Bangalore - 560038',
    timeline: [
        { label: 'Order Placed', time: '09:30 AM' },
        { label: 'Accepted by Restaurant', time: '09:33 AM' },
        { label: 'Picked by Agent', time: '09:40 AM' },
        { label: 'Delivered', time: '09:55 AM' },
    ],
    items: [
        { name: 'Margherita', quantity: 1, unitPrice: 250, total: 250, prepTime: '15 min' },
        { name: 'Coke', quantity: 1, unitPrice: 50, total: 50, prepTime: '0 min' },
    ],
    charges: [
        { type: 'Subtotal', amount: 300, notes: '—' },
        { type: 'Tax', amount: 12.5, notes: '5% GST' },
        { type: 'Delivery Charge', amount: 30, notes: 'Fixed Zone Charge' },
        { type: 'Discount', amount: -50, notes: 'Offer Code: PIZZA50' },
        { type: 'Grand Total', amount: 292.5, notes: 'Payable Online' },
    ],
};

// Helper function to format currency
const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;


// --- Components for Organization ---

const FiltersSection = () => (
  <div className="p-4 border-b border-gray-200 bg-white shadow-sm rounded-lg mb-6">
    <h3 className="text-lg font-semibold mb-3 text-gray-700">🔍 Filters:</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
      <div className="flex items-center space-x-2">
        <span className="font-medium text-gray-600">Date Range:</span>
        <span className="p-1 bg-gray-100 border border-gray-300 rounded text-gray-800 font-mono text-xs">{DATE_RANGE}</span>
      </div>

      <div className="flex items-center space-x-2">
        <label className="font-medium text-gray-600">Status ▾:</label>
        <select className="p-1 border border-gray-300 rounded text-sm bg-white">
          <option>All</option>
          <option>Delivered</option>
          <option>Preparing</option>
          <option>Cancelled</option>
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <label className="font-medium text-gray-600">Payment ▾:</label>
        <select className="p-1 border border-gray-300 rounded text-sm bg-white">
          <option>All</option>
          <option>Cash</option>
          <option>Online</option>
          <option>Wallet</option>
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <label className="font-medium text-gray-600">Store ▾:</label>
        <select className="p-1 border border-gray-300 rounded text-sm bg-white">
          <option>All</option>
          <option>Select Restaurant</option>
        </select>
      </div>
      
      <div className="flex items-center space-x-2 col-span-1 md:col-span-3 lg:col-span-4">
        <label className="font-medium text-gray-600">Search:</label>
        <div className="flex border border-gray-300 rounded overflow-hidden flex-grow max-w-sm">
            <input type="text" placeholder="Search by Order ID, Customer, etc." className="p-1.5 flex-grow text-sm focus:outline-none"/>
            <button className="bg-gray-100 p-1.5 text-gray-500 hover:bg-gray-200">🔎</button>
        </div>
        <button className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-semibold hover:bg-blue-700">Export CSV</button>
        <button className="bg-gray-500 text-white px-3 py-1.5 rounded text-sm font-semibold hover:bg-gray-600">Reset Filters</button>
      </div>
    </div>
  </div>
);

const SummarySection = ({ data }) => (
  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-6">
    <h3 className="text-lg font-semibold mb-3 text-gray-700">📊 Summary:</h3>
    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
      <div className="text-gray-900">Total Orders: <span className="text-blue-600 font-bold">{data.totalOrders}</span></div>
      <div className="text-gray-900">Completed: <span className="text-green-600 font-bold">{data.completed}</span></div>
      <div className="text-gray-900">Cancelled: <span className="text-red-600 font-bold">{data.cancelled}</span></div>
      <div className="text-gray-900">Total Revenue: <span className="text-purple-600 font-bold">{data.totalRevenue}</span></div>
      <div className="text-gray-900">Cash Orders: <span className="text-orange-600 font-bold">{data.cashOrders}</span></div>
      <div className="text-gray-900">Online Orders: <span className="text-cyan-600 font-bold">{data.onlineOrders}</span></div>
    </div>
  </div>
);

const OrdersTable = ({ orders }) => (
  <div className="bg-white p-4 shadow-xl rounded-lg overflow-x-auto">
    <h3 className="text-lg font-semibold mb-3 text-gray-700">📋 ORDERS TABLE</h3>
    <div className="min-w-max">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="px-3 py-3">Order ID</th>
            <th scope="col" className="px-3 py-3">Date & Time</th>
            <th scope="col" className="px-3 py-3">Store Name</th>
            <th scope="col" className="px-3 py-3">Customer</th>
            <th scope="col" className="px-3 py-3">Phone</th>
            <th scope="col" className="px-3 py-3 w-40">Items</th>
            <th scope="col" className="px-3 py-3 text-right">Subtotal</th>
            <th scope="col" className="px-3 py-3 text-right">Delivery</th>
            <th scope="col" className="px-3 py-3 text-right">Tax</th>
            <th scope="col" className="px-3 py-3 text-right">Discount</th>
            <th scope="col" className="px-3 py-3 text-right">Total ₹</th>
            <th scope="col" className="px-3 py-3">Payment</th>
            <th scope="col" className="px-3 py-3">Status</th>
            <th scope="col" className="px-3 py-3">Agent</th>
            <th scope="col" className="px-3 py-3">ETA</th>
            <th scope="col" className="px-3 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
              <td className="px-3 py-2 font-medium text-gray-900">{order.id}</td>
              <td className="px-3 py-2 whitespace-nowrap">{order.dateTime}</td>
              <td className="px-3 py-2">{order.store}</td>
              <td className="px-3 py-2">{order.customer}</td>
              <td className="px-3 py-2 whitespace-nowrap">{order.phone}</td>
              <td className="px-3 py-2 text-xs text-gray-600">{order.items}</td>
              <td className="px-3 py-2 text-right">{formatCurrency(order.subtotal)}</td>
              <td className="px-3 py-2 text-right">{formatCurrency(order.delivery)}</td>
              <td className="px-3 py-2 text-right">{formatCurrency(order.tax)}</td>
              <td className="px-3 py-2 text-right text-red-600">-{formatCurrency(order.discount)}</td>
              <td className="px-3 py-2 text-right font-semibold text-gray-900">{formatCurrency(order.total)}</td>
              <td className="px-3 py-2">{order.payment}</td>
              <td className="px-3 py-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.statusColor}`}>
                  {order.status}
                </span>
              </td>
              <td className="px-3 py-2">{order.agent}</td>
              <td className="px-3 py-2">{order.eta}</td>
              <td className="px-3 py-2">
                <button className="text-blue-600 hover:text-blue-800 font-medium">
                  [View]
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const OrderDetailsSection = ({ details }) => (
    <div className="mt-8 p-6 bg-white shadow-xl rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">📄 ORDER DETAILS (Example: {details.id})</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-6">
            <InfoBox title="Customer Info" data={[
                { label: 'Customer', value: details.customer },
                { label: 'Store', value: details.store },
                { label: 'Agent', value: details.agent },
            ]} />
            <InfoBox title="Order & Delivery" data={[
                { label: 'Order Status', value: details.orderStatus, color: 'text-green-600 font-bold' },
                { label: 'Delivery Time', value: details.deliveryTime },
                { label: 'Distance', value: details.distance },
            ]} />
            <InfoBox title="Payment Status" data={[
                { label: 'Payment Method', value: details.paymentMethod },
                { label: 'Payment Status', value: details.paymentStatus, color: 'text-green-600 font-bold' },
                { label: 'Grand Total', value: formatCurrency(details.grandTotal), color: 'font-bold' },
            ]} />
            <InfoBox title="Timeline" data={details.timeline.map(t => ({
                label: t.label,
                value: t.time,
                color: 'text-gray-600',
            }))} />
        </div>

        {/* Ordered Items Table */}
        <h4 className="text-md font-semibold mb-2 text-gray-700">📦 Ordered Items:</h4>
        <div className="overflow-x-auto mb-6">
            <table className="min-w-full text-sm text-left border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                    <tr>
                        {['Item Name', 'Quantity', 'Unit Price', 'Total', 'Preparation Time'].map(header => (
                            <th key={header} className="px-4 py-2 border border-gray-300 font-semibold">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {details.items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 border border-gray-300 font-medium text-gray-900">{item.name}</td>
                            <td className="px-4 py-2 border border-gray-300 text-center">{item.quantity}</td>
                            <td className="px-4 py-2 border border-gray-300">{formatCurrency(item.unitPrice)}</td>
                            <td className="px-4 py-2 border border-gray-300 font-medium">{formatCurrency(item.total)}</td>
                            <td className="px-4 py-2 border border-gray-300">{item.prepTime}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Charges Breakdown & Address */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <h4 className="text-md font-semibold mb-2 text-gray-700">💰 Charges Breakdown:</h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left border-collapse border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                {['Type', 'Amount', 'Notes'].map(header => (
                                    <th key={header} className="px-4 py-2 border border-gray-300 font-semibold">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {details.charges.map((charge, index) => (
                                <tr key={index} className={`hover:bg-gray-50 ${charge.type === 'Grand Total' ? 'bg-blue-50/50 font-bold' : ''}`}>
                                    <td className="px-4 py-2 border border-gray-300">{charge.type}</td>
                                    <td className={`px-4 py-2 border border-gray-300 ${charge.amount < 0 ? 'text-red-600' : ''}`}>{formatCurrency(Math.abs(charge.amount))}</td>
                                    <td className="px-4 py-2 border border-gray-300">{charge.notes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                <h4 className="text-md font-semibold mb-2 text-gray-700">🗺️ Delivery Address:</h4>
                <p className="p-3 bg-gray-50 border border-gray-300 rounded text-gray-800 text-sm">{details.address}</p>
            </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 flex space-x-4">
            <button className="bg-green-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-green-700">Download CSV</button>
            <button className="bg-red-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-red-700">Download PDF</button>
            <button className="bg-purple-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-purple-700">Copy Table</button>
        </div>
    </div>
);

// Small helper component for InfoBox in details section
const InfoBox = ({ title, data }) => (
    <div className="border border-gray-200 p-3 rounded-lg bg-gray-50">
        <h5 className="font-bold text-gray-800 mb-2 border-b pb-1">{title}</h5>
        {data.map((item, index) => (
            <p key={index} className="flex justify-between text-xs text-gray-600 leading-relaxed">
                <span>{item.label}:</span>
                <span className={item.color || 'text-gray-900 font-medium'}>{item.value}</span>
            </p>
        ))}
    </div>
);


// --- Main Component ---
const OrderAdminPanel = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      {/* Header */}
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6 border-b-4 border-blue-600 pb-2 inline-block">
        📦 ORDERS MANAGEMENT — ADMIN PANEL
      </h1>
      
      {/* Filters Section */}
      <FiltersSection />
      
      {/* Summary Section */}
      <SummarySection data={SUMMARY_DATA} />

      {/* Orders Table Section */}
      <OrdersTable orders={ORDERS} />

      {/* Order Details Section (Mocking the view for ORD-67002DBB) */}
      <OrderDetailsSection details={ORDER_DETAILS_DATA} />

    </div>
  );
};

export default OrderAdminPanel;