import api from './axios'

export const getInventories = (city, page = 0, size = 20) => {
  const params = { page, size }
  if (city) params.city = city
  return api.get('/inventory', { params })
}
export const createInventory = (data) => api.post('/inventory', data)
export const adjustStock = (id, adjustmentComment) => api.post(`/inventory/${id}/adjust`, { adjustmentComment })
