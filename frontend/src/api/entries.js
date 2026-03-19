import api from './axios'

export const getEntries = (city) => {
  const params = city ? { city } : {}
  return api.get('/entries', { params })
}
export const createEntry = (data) => api.post('/entries', data)
