import React, { useEffect, useState } from 'react';
import { FaAngleLeft, FaInfoCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { getRoles } from '../../../../apis/adminApis/roleApi';
import { fetchRestaurantsDropdown } from '../../../../apis/adminApis/adminFuntionsApi';
import { createManager } from '../../../../apis/adminApis/mangerApi';
import { toast } from 'react-toastify';

const AddManager = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: '',
    assignedRestaurants: [], // Changed from restaurants to assignedRestaurants
    viewAllCustomers: false
  });
  const navigate = useNavigate()
  const [restaurants, setRestaurants] = useState([]);
  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showRestaurantDropdown, setShowRestaurantDropdown] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch restaurants
        const restaurantsRes = await fetchRestaurantsDropdown();
        if (restaurantsRes.success) {
          setRestaurants(restaurantsRes.data);
        }

        // Fetch roles
        const rolesRes = await getRoles();
        if (rolesRes) {
          setRoles(rolesRes.roles);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhoneChange = (value) => {
    setFormData(prev => ({
      ...prev,
      phone: value
    }));
    
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const handleCheckboxChange = (value) => {
    setFormData(prev => {
      const currentValues = [...prev.assignedRestaurants];
      const index = currentValues.indexOf(value);
      
      if (index === -1) {
        currentValues.push(value);
      } else {
        currentValues.splice(index, 1);
      }
      
      return {
        ...prev,
        assignedRestaurants: currentValues
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.role) newErrors.role = 'Role is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Prepare the request body to match your API
      const requestBody = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        assignedRestaurants: formData.assignedRestaurants
      };

      console.log('Submitting:', requestBody);
     await createManager(requestBody)
     toast.success("manager created")
    
navigate("/admin/dashboard/manger-managment")
     // const response = await addManagerApi(requestBody);
      // Handle the response as needed
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && roles.length === 0) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div className="account-container p-4">
      <section>
        <Link to="/managers" className="flex items-center text-blue-600 mb-4">
          <FaAngleLeft className="mr-2" />
          <span className="capitalize">Managers List</span>
        </Link>

        <div className="content-container bg-white rounded-lg shadow-sm">
          <div className="flex items-center p-4 border-b">
            <h3 className="text-xl font-semibold capitalize">Add Manager</h3>
          </div>

          <section className="p-4">
            <div className="detail-container">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div className="flex flex-col md:flex-row md:items-center mb-4">
                  <label className="md:w-1/3 font-medium mb-2 md:mb-0">
                    NAME<span className="text-red-500">*</span>
                  </label>
                  <div className="md:w-2/3">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter name"
                      className={`w-full p-2 border rounded ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>
                </div>

                {/* Email Field */}
                <div className="flex flex-col md:flex-row md:items-center mb-4">
                  <label className="md:w-1/3 font-medium mb-2 md:mb-0">
                    Email<span className="text-red-500">*</span>
                  </label>
                  <div className="md:w-2/3">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email"
                      className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>

                {/* Phone Field */}
                <div className="flex flex-col md:flex-row md:items-center mb-4">
                  <label className="md:w-1/3 font-medium mb-2 md:mb-0">
                    Phone<span className="text-red-500">*</span>
                  </label>
                  <div className="md:w-2/3">
                    <PhoneInput
                      country={'us'}
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      inputClass={`w-full p-2 border rounded ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                      containerClass={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>

                {/* Password Field */}
                <div className="flex flex-col md:flex-row md:items-center mb-4">
                  <label className="md:w-1/3 font-medium mb-2 md:mb-0">
                    Password<span className="text-red-500">*</span>
                  </label>
                  <div className="md:w-2/3">
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter Password"
                      className={`w-full p-2 border rounded ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                      autoComplete="new-password"
                    />
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                  </div>
                </div>

                {/* Assign Role Field */}
                <div className="flex flex-col md:flex-row md:items-center mb-4">
                  <label className="md:w-1/3 font-medium mb-2 md:mb-0">
                    Assign Role<span className="text-red-500">*</span>
                  </label>
                  <div className="md:w-2/3">
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded ${errors.role ? 'border-red-500' : 'border-gray-300'}`}
                      disabled={isLoading}
                    >
                      <option value="">Select a Role</option>
                      {roles.map(role => (
                        <option key={role._id} value={role._id}>{role.roleName}</option>
                      ))}
                    </select>
                    {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
                  </div>
                </div>

                {/* Assign Restaurants Field - Checkbox Dropdown */}
                <div className="flex flex-col md:flex-row md:items-center mb-4">
                  <label className="md:w-1/3 font-medium mb-2 md:mb-0 flex items-center">
                    Assign Restaurants
                    <FaInfoCircle className="ml-2 text-gray-500" />
                  </label>
                  <div className="md:w-2/3 relative">
                    <div 
                      className="w-full p-2 border border-gray-300 rounded cursor-pointer flex justify-between items-center"
                      onClick={() => setShowRestaurantDropdown(!showRestaurantDropdown)}
                    >
                      <span>
                        {formData.assignedRestaurants.length > 0 
                          ? `${formData.assignedRestaurants.length} selected` 
                          : 'Select restaurants'}
                      </span>
                      {showRestaurantDropdown ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                    
                    {showRestaurantDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                        {restaurants.map(restaurant => (
                          <div key={restaurant._id} className="p-2 hover:bg-gray-100">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.assignedRestaurants.includes(restaurant._id)}
                                onChange={() => handleCheckboxChange(restaurant._id)}
                                className="rounded text-blue-600 focus:ring-blue-500"
                              />
                              <span>{restaurant.name}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* View All Customers Toggle */}
                <div className="flex justify-between items-center mb-6 p-2 bg-gray-50 rounded">
                  <label className="text-gray-600 font-medium">View All Customer</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="viewAllCustomers"
                      checked={formData.viewAllCustomers}
                      onChange={handleChange}
                      className="sr-only peer"
                      disabled={isLoading}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Adding...' : 'Add Manager'}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
};

export default AddManager;