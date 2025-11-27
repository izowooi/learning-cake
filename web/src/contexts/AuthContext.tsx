'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AUTH_CONFIG, generateToken, isValidTokenFormat } from '@/lib/auth/config'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (password: string) => Promise<boolean>
  logout: () => void
  getAuthHeader: () => Record<string, string>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === 'undefined') return
      
      const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY)
      if (token && isValidTokenFormat(token)) {
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY)
        setIsAuthenticated(false)
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (password: string): Promise<boolean> => {
    try {
      // Verify password with server
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (data.success) {
        // Generate and store token
        const timestamp = Date.now()
        const token = generateToken(password, timestamp)
        localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token)
        setIsAuthenticated(true)
        return true
      }

      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY)
    setIsAuthenticated(false)
  }

  const getAuthHeader = (): Record<string, string> => {
    if (typeof window === 'undefined') return {}
    const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY)
    if (!token) return {}
    return { [AUTH_CONFIG.AUTH_HEADER]: token }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, getAuthHeader }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

