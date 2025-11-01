import { useEffect, useState } from 'react';
import { FiSearch, FiMoreVertical, FiChevronDown } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { deleteRole, getRoles } from '../../../../apis/adminApis/roleApi';
import { toast } from 'react-toastify';

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [showDropdown, setShowDropdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch roles from API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await getRoles();
        setRoles(res.roles);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch roles');
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  // Filter roles based on search term
  const filteredRoles = roles.filter(role => 
    role.roleName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastRole = currentPage * rowsPerPage;
  const indexOfFirstRole = indexOfLastRole - rowsPerPage;
  const currentRoles = filteredRoles.slice(indexOfFirstRole, indexOfLastRole);
  const totalPages = Math.ceil(filteredRoles.length / rowsPerPage);

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Toggle dropdown menu
  const toggleDropdown = (id) => {
    setShowDropdown(showDropdown === id ? null : id);
  };


  const handleDelete = async (roleId) => {
    console.log(roleId)
  const confirmDelete = window.confirm("Are you sure you want to delete this role?");
  if (!confirmDelete) return;

  try {
    await deleteRole(roleId);
    toast.success("Role deleted successfully");

    // If you maintain state:
    setRoles(roles.filter(role => role._id !== roleId));

    // Or optionally, refetch roles
    // fetchRoles();

  } catch (error) {
    console.error("Error deleting role:", error);
    toast.error(error.message || "Failed to delete role");
  }
};

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex items-center">
        <div className="bg-gray-100 p-3 rounded-full mr-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 16.5C16 15.1165 15.5523 13.783 14.7612 12.7416C13.9701 11.7003 12.8934 11.0222 11.7085 10.8214C10.5236 10.6206 9.31571 10.9109 8.33342 11.6339C7.35113 12.3569 6.66667 13.4597 6.66667 14.6667V16.5C6.66667 17.0523 6.88646 17.5821 7.27776 17.9734C7.66905 18.3647 8.19891 18.5845 8.75117 18.5845H15.2488C15.8011 18.5845 16.3309 18.3647 16.7222 17.9734C17.1135 17.5821 17.3333 17.0523 17.3333 16.5V14.6667" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="text-xl font-semibold">Roles</h2>
      </div>

      {/* Content */}
      <section className="bg-white rounded-lg shadow-sm p-4">
        {/* Search and Add Role */}
        <div className="flex flex-col md:flex-row justify-between mb-4">
          <div className="relative mb-4 md:mb-0 md:w-1/2">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiSearch className="text-gray-500" />
            </div>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
              placeholder="Search Roles"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Link
            to="/admin/dashboard/role-add"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg inline-block"
          >
            Add Role
          </Link>
        </div>

        {/* Roles Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 w-1/5">Role Name</th>
                <th scope="col" className="px-6 py-3 w-2/5">Role Description</th>
                <th scope="col" className="px-6 py-3 w-1/5">Created At</th>
                <th scope="col" className="px-6 py-3 w-1/5">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentRoles.length > 0 ? (
                currentRoles.map((role) => (
                  <tr key={role._id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {role.roleName}
                    </td>
                    <td className="px-6 py-4">
                      {role.description}
                    </td>
                    <td className="px-6 py-4">
                      {formatDate(role.createdAt)}
                    </td>
                    <td className="px-6 py-4 relative">
                      <button 
                        onClick={() => toggleDropdown(role._id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <FiMoreVertical />
                      </button>
                      {showDropdown === role._id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                          <div className="py-1">
                            <Link
                              to={`/admin/dashboard/role-edit/${role._id}`}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              Edit
                            </Link>
                            <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" onClick={() => handleDelete(role._id)} >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No roles found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredRoles.length > 0 && (
          <div className="flex flex-col md:flex-row justify-between items-center mt-4">
            <div className="mb-4 md:mb-0">
              Showing {indexOfFirstRole + 1} - {Math.min(indexOfLastRole, filteredRoles.length)} of {filteredRoles.length} entries
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                Previous
              </button>
              <span className="px-3 py-1 bg-blue-600 text-white rounded">
                {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                Next
              </button>
              <div className="relative">
                <select
                  value={rowsPerPage}
                  className="appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 pr-8"
                  disabled
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <FiChevronDown className="text-gray-500" />
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default RolesPage;