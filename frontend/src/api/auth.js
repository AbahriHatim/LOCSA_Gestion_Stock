import api from './axios'

export const login = (credentials) => api.post('/auth/login', credentials)
export const logout = () => api.post('/auth/logout')
export const register = (userData) => api.post('/auth/register', userData)
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email })
export const resetPassword = (token, newPassword) => api.post('/auth/reset-password', { token, newPassword })
