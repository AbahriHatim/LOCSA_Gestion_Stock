import api from './axios'

export const getAuditLogs = (page = 0, size = 20, entityType = null) => {
  const params = { page, size }
  if (entityType) params.entityType = entityType
  return api.get('/audit', { params })
}
