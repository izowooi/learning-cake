'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

// Custom hook for authenticated API calls
export function useAuthenticatedFetch() {
  const { getAuthHeader, logout } = useAuth()
  const router = useRouter()

  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const authHeaders = getAuthHeader()

      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          ...authHeaders,
        },
      })

      // Handle unauthorized response
      if (response.status === 401) {
        const data = await response.json()
        if (data.unauthorized) {
          logout()
          router.push('/login')
        }
      }

      return response
    },
    [getAuthHeader, logout, router]
  )

  return authFetch
}

