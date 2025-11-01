import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Shield, Search, ChevronDown, ChevronUp, 
  MoreVertical, Edit, Trash2, Users, Calendar, Settings, X 
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import LoadingForAdmins from './AdminUtils/LoadingForAdmins';
import apiClient from '../../apis/apiClient/apiClient';

const AdminManage = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
    const [expandedAdmin, setExpandedAdmin] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [currentAdmin, setCurrentAdmin] = useState(null);
    const [permissions, setPermissions] = useState([]);

    const token = localStorage.getItem('adminToken');

    // Available permissions options in the format you specified
    const availablePermissions = [
        "agents.manage",          // Manage agents
        "users.manage",           // Create, update, delete users
        "merchants.manage",       // Manage restaurant or business accounts
        "orders.manage",          // View, update, and handle orders
        "disputes.manage",        // Handle disputes, refunds, etc.
        "support.manage"          // Customer care - resolve tickets, chat, etc.
    ];

    useEffect(() => {
        const fetchAdmins = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get('/admin/admins', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setAdmins(response.data.admins);
            } catch (error) {
                console.error('Error fetching admins:', error);
                toast.error('Failed to load admins');
            } finally {
                setLoading(false);
            }
        };

        fetchAdmins();
    }, [token]);

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedAdmins = [...admins].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });

    const filteredAdmins = sortedAdmins.filter(admin =>
        admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.phone.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (adminId) => {
        if (window.confirm('Are you sure you want to delete this admin?')) {
            try {
                await  apiClient.delete(`/admin/delete-admin/${adminId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setAdmins(admins.filter(admin => admin._id !== adminId));
                toast.success('Admin deleted successfully');
            } catch (error) {
                console.error('Error deleting admin:', error);
                toast.error(error.response?.data?.message || 'Failed to delete admin');
                if (error.response?.status === 403) {
                    toast.error('You do not have permission to delete admins');
                } else if (error.response?.status === 404) {
                    toast.error('Admin not found');
                }
            }
        }
    };

    const openEditModal = (admin) => {
        setCurrentAdmin(admin);
        setPermissions(admin.adminPermissions || []);
        setEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditModalOpen(false);
        setCurrentAdmin(null);
        setPermissions([]);
    };

    const togglePermission = (permission) => {
        setPermissions(prev => {
            if (prev.includes(permission)) {
                return prev.filter(p => p !== permission);
            } else {
                return [...prev, permission];
            }
        });
    };

    const handleSavePermissions = async () => {
        if (!currentAdmin) return;

        try {
            const response = await apiClient.put(
                `/admin/update-admin/${currentAdmin._id}`,
                { permissions },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setAdmins(admins.map(admin => 
                admin._id === currentAdmin._id 
                    ? { ...admin, adminPermissions: permissions } 
                    : admin
            ));

            toast.success('Admin permissions updated successfully');
            closeEditModal();
        } catch (error) {
            console.error('Error updating admin permissions:', error);
            toast.error(error.response?.data?.message || 'Failed to update permissions');
        }
    };

    const toggleExpand = (adminId) => {
        setExpandedAdmin(expandedAdmin === adminId ? null : adminId);
    };

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return <ChevronDown className="w-4 h-4 opacity-30" />;
        return sortConfig.direction === 'ascending' ?
            <ChevronUp className="w-4 h-4 text-orange-600" /> :
            <ChevronDown className="w-4 h-4 text-orange-600" />;
    };

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const permissionColors = {
        'users': 'bg-blue-100 text-blue-700',
        'orders': 'bg-green-100 text-green-700',
        'merchants': 'bg-purple-100 text-purple-700',
        'agents': 'bg-yellow-100 text-yellow-700',
        'disputes': 'bg-red-100 text-red-700',
        'support': 'bg-indigo-100 text-indigo-700'
    };

    const getPermissionLabel = (permission) => {
        const [module] = permission.split('.');
        return module.charAt(0).toUpperCase() + module.slice(1) + ' Management';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
            {/* Edit Admin Modal */}
            {editModalOpen && currentAdmin && (
                <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                                <h3 className="text-xl font-bold text-gray-900">Edit Admin Permissions</h3>
                                <button 
                                    onClick={closeEditModal}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="mt-6">
                                <div className="flex items-center space-x-4 mb-6">
                                    <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
                                        <span className="text-white font-semibold text-sm">{getInitials(currentAdmin.name)}</span>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold">{currentAdmin.name}</h4>
                                        <p className="text-gray-600">{currentAdmin.email}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-lg font-semibold text-gray-900">Permissions</h4>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Select the modules this admin can manage
                                    </p>
                                    
                                    <div className="space-y-3">
                                        {availablePermissions.map((permission) => {
                                            const [module] = permission.split('.');
                                            return (
                                                <div 
                                                    key={permission}
                                                    className={`p-4 border rounded-lg ${permissionColors[module] || 'bg-gray-50 border-gray-200'}`}
                                                >
                                                    <div className="flex items-center">
                                                        <input
                                                            id={permission}
                                                            type="checkbox"
                                                            checked={permissions.includes(permission)}
                                                            onChange={() => togglePermission(permission)}
                                                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                                        />
                                                        <label 
                                                            htmlFor={permission}
                                                            className="ml-3 block text-sm font-medium text-gray-700"
                                                        >
                                                            {getPermissionLabel(permission)}
                                                        </label>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end space-x-3 border-t border-gray-200 pt-4">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSavePermissions}
                                    className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="bg-white shadow-sm border-b border-orange-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Administrator Management</h1>
                                <p className="text-gray-600 mt-1">View and manage all administrator accounts</p>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="flex space-x-4">
                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg shadow-md">
                                <div className="text-sm font-medium">Total Admins</div>
                                <div className="text-xl font-bold">{admins.length}</div>
                            </div>
                            <div className="bg-white border border-orange-200 px-4 py-2 rounded-lg shadow-md">
                                <div className="text-sm font-medium text-gray-600">Active</div>
                                <div className="text-xl font-bold text-orange-600">{admins.length}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search and Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                        <div className="flex items-center space-x-3">
                            <Search className="w-5 h-5 text-orange-500" />
                            <span className="text-lg font-semibold text-gray-900">Search & Filter</span>
                        </div>

                        <div className="relative w-full md:w-80">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name, email, or phone..."
                                className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                   <LoadingForAdmins/>
                ) : (
                    <div className="bg-white shadow-sm rounded-xl border border-orange-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gradient-to-r from-gray-50 to-orange-50">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-orange-100 transition-colors duration-200"
                                            onClick={() => handleSort('name')}
                                        >
                                            <div className="flex items-center space-x-1">
                                                <span>Administrator</span>
                                                <SortIcon columnKey="name" />
                                            </div>
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-orange-100 transition-colors duration-200"
                                            onClick={() => handleSort('email')}
                                        >
                                            <div className="flex items-center space-x-1">
                                                <span>Contact Info</span>
                                                <SortIcon columnKey="email" />
                                            </div>
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Permissions
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="relative px-6 py-4">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {filteredAdmins.length > 0 ? (
                                        filteredAdmins.map((admin) => (
                                            <React.Fragment key={admin._id}>
                                                <tr
                                                    className="hover:bg-orange-50 cursor-pointer transition-colors duration-200 group"
                                                    onClick={() => toggleExpand(admin._id)}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
                                                                <span className="text-white font-semibold text-sm">{getInitials(admin.name)}</span>
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-semibold text-gray-900">{admin.name}</div>
                                                                <div className="text-sm text-gray-500 flex items-center">
                                                                    <Shield className="w-3 h-3 mr-1" />
                                                                    Administrator
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center text-sm text-gray-900">
                                                                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                                                {admin.email}
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-600">
                                                                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                                                {admin.phone}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-wrap gap-2">
                                                            {admin.adminPermissions?.slice(0, 2).map((perm, idx) => {
                                                                const [module] = perm.split('.');
                                                                return (
                                                                    <span
                                                                        key={idx}
                                                                        className={`px-3 py-1 text-xs font-medium rounded-full ${permissionColors[module] || 'bg-gray-100 text-gray-700'}`}
                                                                    >
                                                                        {module}
                                                                    </span>
                                                                );
                                                            })}
                                                            {admin.adminPermissions?.length > 2 && (
                                                                <span className="px-3 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                                                                    +{admin.adminPermissions.length - 2}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                                            Active
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                            <button
                                                                className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openEditModal(admin);
                                                                }}
                                                                title="Edit Admin"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDelete(admin._id);
                                                                }}
                                                                title="Delete Admin"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {expandedAdmin === admin._id && (
                                                    <tr className="bg-gradient-to-r from-orange-50 to-orange-25">
                                                        <td colSpan="5" className="px-6 py-6">
                                                            <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-100">
                                                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                                                    <div className="space-y-4">
                                                                        <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                                                                            <Mail className="w-5 h-5 text-orange-500" />
                                                                            <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                                                                        </div>
                                                                        <div className="space-y-3">
                                                                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                                                                <Mail className="h-4 w-4 text-gray-500" />
                                                                                <span className="text-sm text-gray-900 font-medium">{admin.email}</span>
                                                                            </div>
                                                                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                                                                <Phone className="h-4 w-4 text-gray-500" />
                                                                                <span className="text-sm text-gray-900 font-medium">{admin.phone}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-4">
                                                                        <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                                                                            <Calendar className="w-5 h-5 text-orange-500" />
                                                                            <h3 className="text-lg font-semibold text-gray-900">Account Details</h3>
                                                                        </div>
                                                                        <div className="space-y-3">
                                                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                                                <div className="text-xs text-gray-500 font-medium">CREATED</div>
                                                                                <div className="text-sm text-gray-900 font-medium">
                                                                                    {new Date(admin.createdAt).toLocaleDateString('en-US', {
                                                                                        year: 'numeric',
                                                                                        month: 'long',
                                                                                        day: 'numeric'
                                                                                    })}
                                                                                </div>
                                                                            </div>
                                                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                                                <div className="text-xs text-gray-500 font-medium">LAST UPDATED</div>
                                                                                <div className="text-sm text-gray-900 font-medium">
                                                                                    {new Date(admin.updatedAt).toLocaleDateString('en-US', {
                                                                                        year: 'numeric',
                                                                                        month: 'long',
                                                                                        day: 'numeric'
                                                                                    })}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-4">
                                                                        <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                                                                            <Settings className="w-5 h-5 text-orange-500" />
                                                                            <h3 className="text-lg font-semibold text-gray-900">Permissions</h3>
                                                                        </div>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {admin.adminPermissions?.map((perm, idx) => {
                                                                                const [module] = perm.split('.');
                                                                                return (
                                                                                    <div
                                                                                        key={idx}
                                                                                        className={`px-3 py-2 text-xs font-medium rounded-lg border ${permissionColors[module] || 'bg-gray-100 text-gray-700 border-gray-200'}`}
                                                                                    >
                                                                                        <div className="font-semibold">{getPermissionLabel(perm)}</div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center space-y-4">
                                                    <Users className="w-12 h-12 text-gray-300" />
                                                    <div>
                                                        <div className="text-lg font-medium text-gray-900">No administrators found</div>
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            No admins match your search criteria. Try adjusting your search terms.
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminManage;