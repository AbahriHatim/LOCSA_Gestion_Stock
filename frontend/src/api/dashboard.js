import api from './axios'

export const getDashboard = () => api.get('/dashboard')
export const getDashboardStats = (period, city) => {
  const params = { period }
  if (city) params.city = city
  return api.get('/dashboard/stats', { params })
}
export const getStockByCity = () => api.get('/dashboard/by-city')
export const getStockByProduct = () => api.get('/dashboard/by-product')
