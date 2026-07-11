const TenantProfile = require('../models/TenantProfile')

/**
 * Fetch tenant profile by User ID
 * @param {string} userId
 * @returns {Promise<TenantProfile|null>}
 */
const getProfileByUserId = async (userId) => {
  return TenantProfile.findOne({ user: userId })
}

/**
 * Create or update a tenant profile
 * @param {string} userId
 * @param {object} data
 * @returns {Promise<TenantProfile>}
 */
const upsertProfile = async (userId, data) => {
  const profile = await TenantProfile.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        preferredLocations: data.preferredLocations,
        budgetRange: data.budgetRange,
        moveInDate: data.moveInDate,
        roomPreferences: data.roomPreferences || [],
        lifestylePreferences: data.lifestylePreferences || [],
        bio: data.bio || '',
        isSearching: data.isSearching !== undefined ? data.isSearching : true,
      },
    },
    { returnDocument: 'after', upsert: true, runValidators: true }
  )
  return profile
}

module.exports = {
  getProfileByUserId,
  upsertProfile,
}
