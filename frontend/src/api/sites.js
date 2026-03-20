import api from './axios'

export const getSites = (city) =>
  api.get('/sites', { params: city ? { city } : {} })

export const createSite = (data) => api.post('/sites', data)
export const updateSite = (id, data) => api.put(`/sites/${id}`, data)
export const deleteSite = (id) => api.delete(`/sites/${id}`)
