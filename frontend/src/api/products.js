import api from './axios'

export const getProducts = () => api.get('/products')
export const getProduct = (id) => api.get(`/products/${id}`)
export const createProduct = (data) => api.post('/products', data)
export const updateProduct = (id, data) => api.put(`/products/${id}`, data)
export const deleteProduct = (id) => api.delete(`/products/${id}`)
export const getProductsPaginated = (page = 0, size = 20) => api.get('/products', { params: { page, size } })
export const getProductHistory = (id, city) => {
  const params = {}
  if (city) params.city = city
  return api.get(`/products/${id}/history`, { params })
}
