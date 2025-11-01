import apiClient from '../apiClient/apiClient';

export const reviewAgentSelfie = async ({ selfieId, action, rejectionReason }) => {
  try {
    const res = await apiClient.patch(
      `/admin/agent/selfie/${selfieId}/review`,
      {
        action,
        ...(action === 'reject' && { rejectionReason }), 
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};



export const getAgentCODMonitor = async (params = {}) => {
  try {
    const response = await apiClient.get("/admin/agent-cod-moniter", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching COD Monitoring:", error);
    throw error.response?.data || error;
  }
}



export const updateAgentCODLimit = async (agentId, newLimit) => {
  try {
    const res = await apiClient.put(`/admin/agents/${agentId}/cod-limit`, { newLimit });
    return res.data;
  } catch (error) {
    console.error("Failed to update COD limit:", error);
    throw error.response?.data || error;
  }
};




export const getAgentPayouts = async (
  periodType = "daily",
  fromDate = null,
  toDate = null
) => {
  try {
    const params = new URLSearchParams();
    params.append("period", periodType);

    if (fromDate) params.append("from", new Date(fromDate).toISOString());
    if (toDate) params.append("to", new Date(toDate).toISOString());

    const response = await apiClient.get(`/admin/agent/payouts?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching payouts:", error);
    throw error.response?.data || error;
  }
};

export const getAgentBasicDetails = async (agentId) => {
  try {
    const response = await apiClient.get(`/admin/agent/${agentId}/basic`);
    return response.data;
  } catch (error) {
    console.error("Error fetching agent basic details:", error);
    throw error.response?.data || error;
  }
};
export const getAgentLeaves = async (agentId) => {
  try {
    const response = await apiClient.get(`/admin/agent/${agentId}/leaves`);
    return response.data;
  } catch (error) {
    console.error("Error fetching agent leave records:", error);
    throw error.response?.data || error;
  }
};
export const getAgentCurrentTask = async (agentId) => {
  try {
    const response = await apiClient.get(`/admin/agent/${agentId}/current-task`);
    return response.data;
  } catch (error) {
    console.error("Error fetching agent current task:", error);
    throw error.response?.data || error;
  }
};


export const exportAgentPayoutsToExcel = async (periodType = "daily", fromDate = null, toDate = null) => {
  try {
    const params = new URLSearchParams();
    params.append("period", periodType);

    if (fromDate) params.append("startDate", new Date(fromDate).toISOString().split('T')[0]);
    if (toDate) params.append("endDate", new Date(toDate).toISOString().split('T')[0]);

    const response = await apiClient.get(`/admin/agent/payouts/export-excel?${params.toString()}`, {
      responseType: 'blob', // Important for file downloads
    });

    return response.data;
  } catch (error) {
    console.error("Error exporting payouts to Excel:", error);
    throw error.response?.data || error;
  }
};




export const getAgentEarningsSummary = async (agentId, fromDate = null, toDate = null) => {
  try {
    const params = new URLSearchParams();
    params.append('agentId', agentId);

    if (fromDate) params.append('from', new Date(fromDate).toISOString());
    if (toDate) params.append('to', new Date(toDate).toISOString());

    const response = await apiClient.get(`/admin/agent-earnings-summary?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching agent earnings summary:', error);
    throw error.response?.data || error;
  }
};

// Optional: If you want separate functions for different time periods
export const getAgentEarningsToday = async (agentId) => {
  return getAgentEarningsSummary(agentId);
};

export const getAgentEarningsByDateRange = async (agentId, fromDate, toDate) => {
  return getAgentEarningsSummary(agentId, fromDate, toDate);
};



export const getAgentMilestoneProgressSummary = async (agentId = null) => {
  try {
   
    const response = await apiClient.get(`/admin/agent-milestone-progress-summary`);
    return response.data;
  } catch (error) {
    console.error('Error fetching agent milestone progress summary:', error);
    throw error.response?.data || error;
  }
};






export const getAgentDisciplinarySummary = async (agentId) => {
  try {
    const response = await apiClient.get(`/admin/agent-discplinnarySummary/${agentId}`, {
     
    });

    return response.data;

  } catch (error) {
    console.error('Error fetching disciplinary summary:', error);
    throw error;
  }
};

 


export const getAgentTodaySummary = async (agentId) => {
  try {
    const response = await apiClient.get(`/admin/agent/${agentId}/today-summary`);
    return response.data;
  } catch (error) {
    console.error("Error fetching agent today summary:", error);
    throw error.response?.data || error;
  }
};