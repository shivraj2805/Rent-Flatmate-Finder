import api from './api'

const chatService = {
  /**
   * Fetch all chats for logged in user
   */
  getChats: async () => {
    const response = await api.get('/chats')
    return response.data
  },

  /**
   * Get historical messages for a chat
   */
  getMessages: async (chatId) => {
    const response = await api.get(`/chats/${chatId}/messages`)
    return response.data
  },

  /**
   * Post a new message
   */
  sendMessage: async (chatId, content) => {
    const response = await api.post(`/chats/${chatId}/messages`, { content })
    return response.data
  },
}

export default chatService
