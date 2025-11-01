import apiClient from "../apiClient/apiClient";



// ✅ Get roles (with optional pagination)
export const getRoles = async (page = 1, limit = 10) => {
  try {
    const response = await apiClient.get(`/admin/role`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error.response?.data || { message: 'Error fetching roles' };
  }
};


export const getRoleByid = async (id) => {
  try {
    const response = await apiClient.get(`/admin/role/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error.response?.data || { message: 'Error fetching roles' };
  }
};
// ✅ Create a new role
export const createRole = async (roleData) => {
  try {
    const response = await apiClient.post('/admin/role', roleData);
    return response.data;
  } catch (error) {
    console.error('Error creating role:', error);
    throw error.response?.data || { message: 'Error creating role' };
  }
};


export const updateRole = async (roleId, roleData) => {
  try {
    const response = await apiClient.put(`/admin/role/${roleId}`, roleData);
    return response.data;
  } catch (error) {
    console.error('Error updating role:', error);
    throw error.response?.data || { message: 'Error updating role' };
  }
};

export const deleteRole = async (roleId) => {
  try {
    const response = await apiClient.delete(`/admin/role/${roleId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting role:", error);
    throw error.response?.data || { message: "Error deleting role" };
  }
};