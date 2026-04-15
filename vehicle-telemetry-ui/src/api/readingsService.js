import apiClient from './axiosClient';

export const getReadings = (vehicleId, from, to) => {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;
  return apiClient.get(`/vehicles/${vehicleId}/readings`, { params });
};

export const getLatestReading = (vehicleId) =>
  apiClient.get(`/vehicles/${vehicleId}/readings/latest`);