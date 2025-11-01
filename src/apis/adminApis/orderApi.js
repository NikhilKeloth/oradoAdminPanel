import apiClient from "../apiClient/apiClient";






export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const response = await apiClient.patch(`/admin/orders/${orderId}/status`, {
      status: newStatus
    });
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};


export const getSalesGraphData = async (period = 'week', startDate = null, endDate = null) => {
  try {
    const params = new URLSearchParams();
    params.append('period', period);
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiClient.get(`/admin/sales/graph?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sales graph data:', error);
    throw error;
  }
};



export const getPeakHoursData = async (period = 'daily', startDate = null, endDate = null) => {
  try {
    const params = new URLSearchParams();
    params.append('period', period);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiClient.get(`/admin/analytics/peak-hours?${params}`);
    return response.data; // { success, period, startDate, endDate, data, peakHours }
  } catch (error) {
    console.error('Error fetching peak hours:', error);
    throw error;
  }
};




export const getTopMerchantsByRevenue = async (period = 'monthly', limit = 5) => {
  try {
    const params = new URLSearchParams();
    params.append('period', period);
    params.append('limit', limit);

    const response = await apiClient.get(`/admin/store/revenue/stats?${params}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch top merchants by revenue:', error);
    throw error;
  }
};
export const getMostOrderedAreas = async (period = 'month', limit = 5, groupBy = 'city') => {
  try {
    const params = new URLSearchParams();
    params.append('period', period);
    params.append('limit', limit);
    params.append('groupBy', groupBy);

    const response = await apiClient.get(`/admin/analytics/most-ordered-area?${params}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch most ordered areas:', error);
    throw error;
  }
};


export const getOrdersSummary = async ({ period = "today" }) => {
  try {
    const response = await apiClient.get(`/admin/order/summary`, {
      params: { period }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching orders summary:", error);
    throw error.response?.data || error;
  }
};

export const getOrdersDetailsTable = async (filters = {}) => {
  try {
    // Destructure possible filters with defaults
    const {
      page = 1,
      limit = 10,
      search = "",
      paymentMethod = "all",
      status = "all",
      fromDate = "",
      toDate = "",
      sort = "desc",
    } = filters;

    const queryParams = new URLSearchParams({
      page,
      limit,
      search,
      paymentMethod,
      status,
      fromDate,
      toDate,
      sort,
    });

    const response = await apiClient.get(
      `admin/order/order-details?${queryParams.toString()}`
    );

    console.log("Fetched order details table:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching order details table:", error);
    throw error;
  }
};



// Export Orders to Excel
export const exportOrdersToExcel = async (filters = {}) => {
  try {
    const {
      search = "",
      paymentMethod = "all",
      status = "all",
      fromDate = "",
      toDate = "",
      sort = "desc",
    } = filters;

    const queryParams = new URLSearchParams({
      search,
      paymentMethod,
      status,
      fromDate,
      toDate,
      sort,
    });

    // Make GET request with responseType 'blob' to handle Excel file
    const response = await apiClient.get(
      `/admin/order/export-excel?${queryParams.toString()}`,
      { responseType: "blob" }
    );

    // Create a URL for the downloaded file
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Orders_Report.xlsx"); // file name
    document.body.appendChild(link);
    link.click();
    link.remove();

    console.log("Orders exported successfully!");
    return true;
  } catch (error) {
    console.error("Error exporting orders to Excel:", error);
    throw error;
  }
};
