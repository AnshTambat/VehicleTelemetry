import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://localhost:5084/api',
});

export default apiClient;