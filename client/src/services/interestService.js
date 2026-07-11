import api from './api'

/**
 * Send interest to a listing
 * @param {string} listingId
 * @param {string} tenantMessage
 * @returns {Promise<object>} response data containing created interest
 */
const sendInterest = async (listingId, tenantMessage) => {
  const { data } = await api.post('/interests', { listingId, tenantMessage })
  return data
}

/**
 * Get interests (sent for tenants, received for owners)
 * @returns {Promise<object>} response data containing interests list
 */
const getMyInterests = async () => {
  const { data } = await api.get('/interests')
  return data
}

/**
 * Respond to an interest request
 * @param {string} interestId
 * @param {string} status - 'accepted' or 'declined'
 * @param {string} responseMessage - response comment from owner
 * @returns {Promise<object>} response data containing updated interest
 */
const respondToInterest = async (interestId, status, responseMessage) => {
  const { data } = await api.patch(`/interests/${interestId}/status`, { status, responseMessage })
  return data
}

export default {
  sendInterest,
  getMyInterests,
  respondToInterest,
}
