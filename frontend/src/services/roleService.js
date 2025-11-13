// src/services/roleService.js
import apiClient from '@/services/apiClient';
const RESOURCE_URL = '/Roles';
export const roleService = {
  getAll: (params = {}) => apiClient.get(RESOURCE_URL, { params }),
  getById: (id) => apiClient.get(`${RESOURCE_URL}/${id}`),
  create: (data) => apiClient.post(RESOURCE_URL, data),
  update: (id, data) => apiClient.put(`${RESOURCE_URL}/${id}`, data),
  remove: (id) => apiClient.delete(`${RESOURCE_URL}/${id}`),
};
