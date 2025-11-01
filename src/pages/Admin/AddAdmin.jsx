import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Shield, CheckCircle, UserPlus, Key } from 'lucide-react';
import axios from 'axios';
import LoadingForAdmins from './AdminUtils/LoadingForAdmins';
import apiClient from '../../apis/apiClient/apiClient';

const permissionsList = [
    "agents.manage",
    "users.manage",
    "merchants.manage",
    "orders.manage",
    "disputes.manage",
    "support.manage"
];

const AddAdmin = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const token=localStorage.getItem("adminToken")

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const togglePermission = (permission) => {
        setPermissions(prev =>
            prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        );
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        if (permissions.length === 0) newErrors.permissions = 'At least one permission is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

   const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
        const response = await apiClient.post('/admin/create-admin', {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            permissions
        }, {
            headers: {
                'Content-Type': 'application/json',
                // Add Authorization header if required:
                Authorization: `Bearer ${token}`,
            }
        });

        // On success
        console.log('Admin created:', response.data);

        // Reset form
        setFormData({
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: ''
        });
        setPermissions([]);

        alert('Admin created successfully!');
    } catch (error) {
        console.error('Error creating admin:', error);
        const message = error.response?.data?.message || 'Failed to create admin';
        alert(message);
    } finally {
        setLoading(false);
    }
};


    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
            {/* Header Section */}
            <div className="bg-white shadow-sm border-b border-orange-100 text-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-center space-x-4">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg">
                            <UserPlus className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Administrator Management</h1>
                            <p className="text-gray-600 mt-1">Create and configure new admin accounts</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
                    {/* Form Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">Create New Administrator</h2>
                                <p className="text-orange-100 mt-1">Fill in the details to add a new admin user</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Personal Information Section */}
                        <div className="space-y-6">
                            <div className="flex items-center space-x-2 pb-3 border-b border-gray-200">
                                <User className="w-5 h-5 text-orange-500" />
                                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 border ${errors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'} rounded-xl focus:ring-2 focus:ring-opacity-20 transition-all duration-200`}
                                            placeholder="Enter full name"
                                        />
                                    </div>
                                    {errors.name && <p className="text-red-500 text-sm flex items-center space-x-1 mt-1">
                                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                        <span>{errors.name}</span>
                                    </p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 border ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'} rounded-xl focus:ring-2 focus:ring-opacity-20 transition-all duration-200`}
                                            placeholder="admin@company.com"
                                        />
                                    </div>
                                    {errors.email && <p className="text-red-500 text-sm flex items-center space-x-1 mt-1">
                                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                        <span>{errors.email}</span>
                                    </p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-3 border ${errors.phone ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'} rounded-xl focus:ring-2 focus:ring-opacity-20 transition-all duration-200`}
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>
                                {errors.phone && <p className="text-red-500 text-sm flex items-center space-x-1 mt-1">
                                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                    <span>{errors.phone}</span>
                                </p>}
                            </div>
                        </div>

                        {/* Security Section */}
                        <div className="space-y-6">
                            <div className="flex items-center space-x-2 pb-3 border-b border-gray-200">
                                <Key className="w-5 h-5 text-orange-500" />
                                <h3 className="text-lg font-semibold text-gray-900">Security Credentials</h3>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 border ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'} rounded-xl focus:ring-2 focus:ring-opacity-20 transition-all duration-200`}
                                            placeholder="Enter secure password"
                                        />
                                    </div>
                                    {errors.password && <p className="text-red-500 text-sm flex items-center space-x-1 mt-1">
                                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                        <span>{errors.password}</span>
                                    </p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 border ${errors.confirmPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'} rounded-xl focus:ring-2 focus:ring-opacity-20 transition-all duration-200`}
                                            placeholder="Confirm password"
                                        />
                                    </div>
                                    {errors.confirmPassword && <p className="text-red-500 text-sm flex items-center space-x-1 mt-1">
                                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                        <span>{errors.confirmPassword}</span>
                                    </p>}
                                </div>
                            </div>
                        </div>

                        {/* Permissions Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                                <div className="flex items-center space-x-2">
                                    <Shield className="w-5 h-5 text-orange-500" />
                                    <h3 className="text-lg font-semibold text-gray-900">Access Permissions</h3>
                                </div>
                                {errors.permissions && <p className="text-red-500 text-sm flex items-center space-x-1">
                                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                    <span>{errors.permissions}</span>
                                </p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {permissionsList.map(permission => (
                                    <div
                                        key={permission}
                                        onClick={() => togglePermission(permission)}
                                        className={`group p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${permissions.includes(permission)
                                                ? 'border-orange-500 bg-orange-50 shadow-md'
                                                : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${permissions.includes(permission)
                                                    ? 'border-orange-500 bg-orange-500'
                                                    : 'border-gray-300 group-hover:border-orange-400'
                                                }`}>
                                                {permissions.includes(permission) && (
                                                    <CheckCircle className="w-3 h-3 text-white" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium capitalize ${permissions.includes(permission) ? 'text-orange-700' : 'text-gray-700'
                                                    }`}>
                                                    {permission.split('.')[0]}
                                                </p>
                                                <p className={`text-xs ${permissions.includes(permission) ? 'text-orange-600' : 'text-gray-500'
                                                    }`}>
                                                    {permission.split('.')[1]} access
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6 border-t border-gray-200">
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {loading ? (
                                   <LoadingForAdmins/>
                                ) : (
                                    <div className="flex items-center justify-center space-x-2">
                                        <UserPlus className="w-5 h-5" />
                                        <span>Create Administrator</span>
                                    </div>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddAdmin;