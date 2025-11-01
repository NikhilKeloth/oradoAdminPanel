import apiClient from "../apiClient/apiClient";


  export const saveGlobalSettings = async (settings) => {
    try {
      console.log("Saving global settings:", settings);

      const response = await apiClient.post(`/admin/agent-earnings/settings`, {
        mode: 'global',
        baseFee: settings.baseFee,
        baseKm: settings.baseKm,
        perKmFeeBeyondBase: settings.perKmFeeBeyondBase,
        bonuses: {
          peakHour: settings.peakHourBonus ?? 0,
          rain: settings.rainBonus ?? 0,
          zone: settings.zoneBonus ?? 0,
        },
        isOverride: false, // global is never an override
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

export const fetchGlobalSettings = async () => {
  try {

    const response = await apiClient.get(`/admin/agent-earnings/settings?mode=global`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};



export const fetchCitySettings = async (city) => {
  try {
    const response = await apiClient.get(`/admin/agent-earnings/settings`, {
      params: { mode: "city", city },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


export const fetchAllCitySettings = async () => {
  try {
    const response = await apiClient.get(`/admin/agent-earnings/settings`, {
      params: { mode: "city" },
    });
    return response.data; // expect this to be an array of settings per city
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


export const saveCitySettings = async (settings) => {
  try {
    console.log("Saving city settings:", settings);

    const response = await apiClient.post(`/admin/agent-earnings/settings`, {
      mode: 'city',
      cityId: settings.cityId, // required
      baseFee: settings.baseFee,
      baseKm: settings.baseKm,
      perKmFeeBeyondBase: settings.perKmFeeBeyondBase,
      bonuses: {
        peakHour: settings.peakHourBonus ?? 0,
        rain: settings.rainBonus ?? 0,
        zone: settings.zoneBonus ?? 0,
      },
      isOverride: true // city always overrides global
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


export const updateCitySettings = async (id, settings) => {
  try {
    const response = await apiClient.put(`/admin/agent-earnings/settings/${id}`, {
      baseFee: settings.baseFee,
      baseKm: settings.baseKm,
      perKmFeeBeyondBase: settings.perKmFeeBeyondBase,
      bonuses: {
        peakHour: settings.peakHourBonus ?? 0,
        rain: settings.rainBonus ?? 0,
        zone: settings.zoneBonus ?? 0,
      },
      isOverride: true,
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}; 




export const deleteEarningsSetting = async (id) => {
  try {
    const response = await apiClient.delete(`/admin/agent-earnings/settings/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};