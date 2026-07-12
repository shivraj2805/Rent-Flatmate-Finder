import api from './api'

/**
 * Fetch the logged-in user's tenant profile
 * @returns {Promise<object>} response data containing profile
 */
const getProfile = async () => {
  const { data } = await api.get('/profile')
  return data
}

/**
 * Create or update the logged-in user's tenant profile
 * @param {object} payload - Profile fields
 * @returns {Promise<object>} response data containing updated profile
 */
const updateProfile = async (payload) => {
  const { data } = await api.put('/profile', payload)
  return data
}

export default {
  getProfile,
  updateProfile,
}
