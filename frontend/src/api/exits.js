import api from './axios'

export const getExits = (city) => {
  const params = city ? { city } : {}
  return api.get('/exits', { params })
}
export const createExit = (data) => api.post('/exits', data)
