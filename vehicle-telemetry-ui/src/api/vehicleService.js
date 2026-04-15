import apiClient from './axiosClient';

export const getAllVehicles = () => apiClient.get('/vehicles');

export const getVehicleById = (id) => apiClient.get(`/vehicles/${id}`);

export const getVehicleSummary = (id) => apiClient.get(`/vehicles/${id}/summary`);

export const getTop5ByPeakSpeedToday = () => apiClient.get('/vehicles/top5-speed-today');