import { createContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'

export const AuthContext = createContext(null)

const readStoredAuth = () => {
  const token = localStorage.getItem('rentFlatmateToken')
  const user = localStorage.getItem('rentFlatmateUser')

  return {
    token,
    user: user ? JSON.parse(user) : null,
  }
}

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate()
  const storedAuth = readStoredAuth()
  const [user, setUser] = useState(storedAuth.user)
  const [token, setToken] = useState(storedAuth.token)
  const [loading, setLoading] = useState(Boolean(storedAuth.token))
  const [error, setError] = useState('')

  useEffect(() => {
    const syncCurrentUser = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await authService.me()
        setUser(response.user)
        localStorage.setItem('rentFlatmateUser', JSON.stringify(response.user))
      } catch (requestError) {
        logout()
        setError(requestError?.response?.data?.message || 'Failed to load user session')
      } finally {
        setLoading(false)
      }
    }

    syncCurrentUser()
  }, [token])

  const persistAuth = (nextToken, nextUser) => {
    setToken(nextToken)
    setUser(nextUser)
    localStorage.setItem('rentFlatmateToken', nextToken)
    localStorage.setItem('rentFlatmateUser', JSON.stringify(nextUser))
  }

  const login = async (credentials) => {
    setError('')

    try {
      const response = await authService.login(credentials)
      persistAuth(response.token, response.user)
      return response
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'Login failed'
      setError(message)
      throw new Error(message)
    }
  }

  const register = async (payload) => {
    setError('')

    try {
      const response = await authService.register(payload)
      persistAuth(response.token, response.user)
      return response
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'Registration failed'
      setError(message)
      throw new Error(message)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setLoading(false)
    setError('')
    localStorage.removeItem('rentFlatmateToken')
    localStorage.removeItem('rentFlatmateUser')
    navigate('/')
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('rentFlatmateUser', JSON.stringify(updatedUser))
  }

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
    updateUser,
    clearError: () => setError(''),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}