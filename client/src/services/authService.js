import api from './api'

const register = async (payload) => {
  const { data } = await api.post('/auth/register', payload)
  return data
}

const login = async (payload) => {
  const { data } = await api.post('/auth/login', payload)
  return data
}

const me = async () => {
  const { data } = await api.get('/auth/me')
  return data
}

export default {
  register,
  login,
  me,
}