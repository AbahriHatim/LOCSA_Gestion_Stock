import api from './axios'

export const getUsers = () => api.get('/users')
export const createUser = (data) => api.post('/users', data)
export const updateUser = (id, data) => api.put(`/users/${id}`, data)
export const changePassword = (id, newPassword) => api.put(`/users/${id}/password`, { newPassword })
export const toggleActive = (id) => api.put(`/users/${id}/toggle-active`)
export const deleteUser = (id) => api.delete(`/users/${id}`)
