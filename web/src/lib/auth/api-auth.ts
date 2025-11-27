import { NextRequest, NextResponse } from 'next/server'
import { AUTH_CONFIG, isValidTokenFormat } from './config'

export interface AuthResult {
  authorized: boolean
  error?: string
}

export function verifyApiAuth(request: NextRequest): AuthResult {
  // Skip auth check if ACCESS_PASSWORD is not set (development mode)
  const password = process.env.ACCESS_PASSWORD
  if (!password) {
    return { authorized: true }
  }

  // Get token from header
  const token = request.headers.get(AUTH_CONFIG.AUTH_HEADER)

  if (!token) {
    return { authorized: false, error: '인증 토큰이 필요합니다.' }
  }

  if (!isValidTokenFormat(token)) {
    return { authorized: false, error: '유효하지 않거나 만료된 토큰입니다.' }
  }

  return { authorized: true }
}

export function unauthorizedResponse(error: string = '인증이 필요합니다.'): NextResponse {
  return NextResponse.json(
    { error, unauthorized: true },
    { status: 401 }
  )
}

// Helper to wrap API handlers with auth check
export function withAuth<T>(
  handler: (request: NextRequest) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest): Promise<NextResponse<T | { error: string; unauthorized: boolean }>> => {
    const authResult = verifyApiAuth(request)
    
    if (!authResult.authorized) {
      return unauthorizedResponse(authResult.error) as NextResponse<{ error: string; unauthorized: boolean }>
    }
    
    return handler(request)
  }
}

