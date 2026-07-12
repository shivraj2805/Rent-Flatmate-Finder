import api from './api'

const adminService = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard')
    return response.data
  },

  getStats: async () => {
    const response = await api.get('/admin/stats')
    return response.data
  },

  getActivity: async (params = {}) => {
    const response = await api.get('/admin/activity', { params })
    return response.data
  },

  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params })
    return response.data
  },

  getUserById: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`)
    return response.data
  },

  updateUserRole: async (userId, role) => {
    const response = await api.put(`/admin/users/${userId}/role`, { role })
    return response.data
  },

  updateUserStatus: async (userId, isActive) => {
    const response = await api.patch(`/admin/users/${userId}/status`, { isActive })
    return response.data
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`)
    return response.data
  },

  bulkUpdateUserStatus: async (userIds, isActive) => {
    const response = await api.post('/admin/users/bulk-status', { userIds, isActive })
    return response.data
  },

  bulkDeleteUsers: async (userIds) => {
    const response = await api.post('/admin/users/bulk-delete', { userIds })
    return response.data
  },

  getListings: async (params = {}) => {
    const response = await api.get('/admin/listings', { params })
    return response.data
  },

  getListingById: async (listingId) => {
    const response = await api.get(`/admin/listings/${listingId}`)
    return response.data
  },

  toggleListingStatus: async (listingId, isActive) => {
    const response = await api.patch(`/admin/listings/${listingId}/status`, { isActive })
    return response.data
  },

  deleteListing: async (listingId) => {
    const response = await api.delete(`/admin/listings/${listingId}`)
    return response.data
  },

  bulkUpdateListingStatus: async (listingIds, isActive) => {
    const response = await api.post('/admin/listings/bulk-status', { listingIds, isActive })
    return response.data
  },

  bulkDeleteListings: async (listingIds) => {
    const response = await api.post('/admin/listings/bulk-delete', { listingIds })
    return response.data
  },

  getInterests: async () => {
    const response = await api.get('/admin/interests')
    return response.data
  },

  deleteInterest: async (interestId) => {
    const response = await api.delete(`/admin/interests/${interestId}`)
    return response.data
  },

  getChats: async () => {
    const response = await api.get('/admin/chats')
    return response.data
  },

  getChatMessages: async (chatId) => {
    const response = await api.get(`/admin/chats/${chatId}/messages`) 
    return response.data
  },

  deleteChat: async (chatId) => {
    const response = await api.delete(`/admin/chats/${chatId}`)
    return response.data
  },
}

export default adminService
