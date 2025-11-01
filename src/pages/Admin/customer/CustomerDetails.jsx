import React, { useEffect, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Info } from 'react-feather';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import { Link, useParams } from "react-router-dom";
import { fetchSingleCustomerDetails, getOrdersByCustomerForAdmin } from '../../../apis/adminApis/adminFuntionsApi';

const CustomerDetailsPage = () => {
    const { customerId } = useParams();
    const [customer, setCustomer] = useState(null);
    const [codStatus, setCodStatus] = useState(false);
    const [payLaterStatus, setPayLaterStatus] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);
    const [searchTag, setSearchTag] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    // Mock data for tags
    const availableTags = [
        { id: 1, name: 'VIP Customer' },
        { id: 2, name: 'Frequent Buyer' },
        { id: 3, name: 'New Customer' },
        { id: 4, name: 'Test Tag' }
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchSingleCustomerDetails(customerId);
                console.log(data);

                if (!data) {
                    throw new Error("No customer data received");
                }

                const formattedCustomer = {
                    ...data,
                    registrationDate: new Date(data.createdAt).toLocaleString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                };

                setCustomer(formattedCustomer);
                setCodStatus(data.codEnabled || false);
                setPayLaterStatus(data.payLaterEnabled || false);

                // Fetch orders after customer data is loaded
                fetchCustomerOrders();
            } catch (err) {
                console.error(err);
                setError("Failed to load customer details.");
            } finally {
                setLoading(false);
            }
        };

        const fetchCustomerOrders = async () => {
            setOrdersLoading(true);
            try {
                const params = { customerId };
                const response = await getOrdersByCustomerForAdmin(params);
                setOrders(response.data || []);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
                setOrders([]);
            } finally {
                setOrdersLoading(false);
            }
        };

        fetchData();
    }, [customerId]);

    const toggleTag = (tag) => {
        if (selectedTags.includes(tag.id)) {
            setSelectedTags(selectedTags.filter(id => id !== tag.id));
        } else {
            setSelectedTags([...selectedTags, tag.id]);
        }
    };

    // Format order time for display
    const formatOrderTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Dropdown options
    const rowsPerPageOptions = [
        { label: '10', value: 10 },
        { label: '25', value: 25 },
        { label: '50', value: 50 }
    ];

    if (loading) return <div className="p-5">Loading customer details...</div>;
    if (error) return <div className="p-5 text-red-600">{error}</div>;
    if (!customer) return <div className="p-5">Customer not found</div>;

    return (
        <div className="max-w-6xl mx-auto p-5 font-sans text-gray-800">
            {/* Header Section */}
            <section className="mb-5 pb-4 border-b border-gray-200">
                <div className="flex items-center">
                    <button className="mr-3 p-1 bg-transparent border-none cursor-pointer">
                        <span className="text-xl">←</span>
                    </button>
                    <h2 className="text-2xl font-medium">Customer details</h2>
                </div>
            </section>

            {/* Customer Information Section */}
            <section className="mb-8">
                <div className="bg-white rounded shadow-sm p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {/* ID */}
                        <div>
                            <label className="block text-sm text-gray-500 uppercase mb-1">Id</label>
                            <p className="text-base">{customer._id}</p>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-sm text-gray-500 uppercase mb-1">Name</label>
                            <p className="text-base">{customer.name}</p>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm text-gray-500 uppercase mb-1">Email</label>
                            <p className="text-base break-all">{customer.email}</p>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm text-gray-500 uppercase mb-1">Phone</label>
                            <p className="text-base">{customer.phone}</p>
                        </div>

                        {/* Registration Date */}
                        <div>
                            <label className="block text-sm text-gray-500 uppercase mb-1">Registration Date</label>
                            <p className="text-base">{customer.registrationDate}</p>
                        </div>

                        {/* COD Status */}
                        <div>
                            <label className="block text-sm text-gray-500 uppercase mb-1">COD STATUS</label>
                            <label className="relative inline-block w-12 h-6 ml-1">
                                <input
                                    type="checkbox"
                                    className="opacity-0 w-0 h-0"
                                    checked={codStatus}
                                    onChange={() => setCodStatus(!codStatus)}
                                />
                                <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full transition ${codStatus ? 'bg-blue-500' : ''}`}>
                                    <span className={`absolute h-4 w-4 left-1 bottom-1 bg-white rounded-full transition ${codStatus ? 'transform translate-x-6' : ''}`}></span>
                                </span>
                            </label>
                        </div>

                        {/* Pay Later Status */}
                        <div>
                            <label className="block text-sm text-gray-500 uppercase mb-1">PAY LATER STATUS</label>
                            <label className="relative inline-block w-12 h-6 ml-1">
                                <input
                                    type="checkbox"
                                    className="opacity-0 w-0 h-0"
                                    checked={payLaterStatus}
                                    onChange={() => setPayLaterStatus(!payLaterStatus)}
                                />
                                <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full transition ${payLaterStatus ? 'bg-blue-500' : ''}`}>
                                    <span className={`absolute h-4 w-4 left-1 bottom-1 bg-white rounded-full transition ${payLaterStatus ? 'transform translate-x-6' : ''}`}></span>
                                </span>
                            </label>
                        </div>

                        {/* Loyalty Points */}
                        <div>
                            <label className="block text-sm uppercase mb-1 text-blue-600 cursor-pointer">Loyalty Points</label>
                            <p className="text-base">{customer.loyaltyPoints || 0}</p>
                        </div>

                        {/* Total Orders */}
                        <div>
                            <label className="block text-sm text-gray-500 uppercase mb-1">Total Orders</label>
                            <p className="text-base">{customer.totalOrders || 0}</p>
                        </div>

                        {/* Total Spent */}
                        <div>
                            <label className="block text-sm text-gray-500 uppercase mb-1">Total Spent</label>
                            <p className="text-base">₹{(customer.totalSpent || 0).toFixed(2)}</p>
                        </div>

                        {/* Referral Code */}
                        <div>
                            <label className="block text-sm text-gray-500 uppercase mb-1">Referral Code</label>
                            <p className="text-base">{customer.referralCode || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Address Section */}
            {customer.addresses && customer.addresses.length > 0 && (
                <section className="mb-8">
                    <h4 className="text-lg font-medium mb-4">Addresses</h4>
                    <div className="bg-white rounded shadow-sm p-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {customer.addresses.map((address, index) => (
                                <div key={index} className="border border-gray-200 p-4 rounded">
                                    <h5 className="font-medium mb-2">{address.type} Address</h5>
                                    <p className="text-sm">{address.street || 'N/A'}</p>
                                    <p className="text-sm">{address.area || 'N/A'}, {address.city || 'N/A'}</p>
                                    <p className="text-sm">{address.state || 'N/A'} - {address.zip || 'N/A'}</p>
                                    {address.receiverName && (
                                        <p className="text-sm mt-2">
                                            <span className="font-medium">Receiver:</span> {address.receiverName} ({address.receiverPhone || 'N/A'})
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Tags Section */}
            <section className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <div className="text-base font-medium">Tags</div>
                    <input
                        type="text"
                        className="px-3 py-2 border border-gray-300 rounded w-48"
                        placeholder="Search tags"
                        value={searchTag}
                        onChange={(e) => setSearchTag(e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {availableTags
                        .filter(tag => tag.name.toLowerCase().includes(searchTag.toLowerCase()))
                        .map(tag => (
                            <div key={tag.id} className="flex justify-between items-center p-3 border border-gray-200 rounded">
                                <label className="text-sm">{tag.name}</label>
                                <label className="relative inline-block w-10 h-5">
                                    <input
                                        type="checkbox"
                                        className="opacity-0 w-0 h-0"
                                        checked={selectedTags.includes(tag.id)}
                                        onChange={() => toggleTag(tag)}
                                    />
                                    <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full transition ${selectedTags.includes(tag.id) ? 'bg-blue-500' : ''}`}>
                                        <span className={`absolute h-3 w-3 left-1 bottom-1 bg-white rounded-full transition ${selectedTags.includes(tag.id) ? 'transform translate-x-4' : ''}`}></span>
                                    </span>
                                </label>
                            </div>
                        ))}
                </div>
            </section>

            {/* Orders Section */}
            <section className="mb-8">
                <h4 className="text-lg font-medium mb-4">Orders Details</h4>
                {ordersLoading ? (
                    <div className="p-5">Loading orders...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse mb-5">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-4 py-3 text-left font-medium">Order ID</th>
                                    <th className="px-4 py-3 text-left font-medium">Order Status</th>
                                    <th className="px-4 py-3 text-left font-medium">Restaurant</th>
                                    <th className="px-4 py-3 text-left font-medium">Delivery Mode</th>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Order Time
                                        <ChevronDown size={14} className="ml-1 inline" />
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Scheduled Delivery Time
                                        <ChevronDown size={14} className="ml-1 inline" />
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">Payment Method</th>
                                    <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                                        Order Preparation Time (in minutes)
                                        <Info size={14} className="ml-1 inline text-gray-500" />
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">Total Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length > 0 ? (
                                    orders.map(order => (
                                        <tr key={order._id} className="bg-white border-b border-gray-200">
                                            <td className="px-4 py-3 text-sm">  <Link
                                                to={`/admin/dashboard/order/table/details/${order._id}`}
                                                className="hover:underline"
                                            >
                                                {order._id || 'N/A'}
                                            </Link>  </td>
                                            <td className="px-4 py-3 text-sm">{order.orderStatus || 'N/A'}</td>
                                            <td className="px-4 py-3 text-sm">{order.restaurantId?.name || 'N/A'}</td>
                                            <td className="px-4 py-3 text-sm">{order.deliveryMode || 'N/A'}</td>
                                            <td className="px-4 py-3 text-sm">{formatOrderTime(order.orderTime)}</td>
                                            <td className="px-4 py-3 text-sm">
                                                {order.scheduledDeliveryTime ? formatOrderTime(order.scheduledDeliveryTime) : 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 text-sm">{order.paymentMethod || 'N/A'}</td>
                                            <td className="px-4 py-3 text-sm">{order.preparationTime || 0}</td>
                                            <td className="px-4 py-3 text-sm">₹{(order.totalAmount || 0).toFixed(2)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="px-4 py-5 text-center text-gray-500">
                                            No Orders Available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <div className="flex items-center justify-end mt-4">
                            <button className="p-1 border border-gray-300 rounded mx-1 disabled:opacity-50" disabled>
                                <ChevronsLeft size={14} />
                            </button>
                            <button className="p-1 border border-gray-300 rounded mx-1 disabled:opacity-50" disabled>
                                <ChevronLeft size={14} />
                            </button>
                            <span className="mx-3"></span>
                            <button className="p-1 border border-gray-300 rounded mx-1 disabled:opacity-50" disabled>
                                <ChevronRight size={14} />
                            </button>
                            <button className="p-1 border border-gray-300 rounded mx-1 disabled:opacity-50" disabled>
                                <ChevronsRight size={14} />
                            </button>
                            <Dropdown
                                value={25}
                                options={rowsPerPageOptions}
                                optionLabel="label"
                                className="ml-3 w-20"
                                disabled
                            />
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default CustomerDetailsPage;