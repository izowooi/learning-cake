// Simple password-based authentication config
// The actual password is stored in environment variables

export const AUTH_CONFIG = {
  // localStorage key for auth token
  TOKEN_KEY: 'learning_cake_auth',
  
  // Token expiry time (7 days in milliseconds)
  TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000,
  
  // API header name for authorization
  AUTH_HEADER: 'X-Access-Token',
}

// Generate a simple hash for the token (not cryptographically secure, but sufficient for this use case)
export function generateToken(password: string, timestamp: number): string {
  const data = `${password}-${timestamp}`
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return `${Math.abs(hash).toString(36)}-${timestamp}`
}

// Verify token structure and expiry
export function isValidTokenFormat(token: string): boolean {
  if (!token) return false
  const parts = token.split('-')
  if (parts.length !== 2) return false
  
  const timestamp = parseInt(parts[1], 10)
  if (isNaN(timestamp)) return false
  
  // Check if token is expired
  const now = Date.now()
  if (now - timestamp > AUTH_CONFIG.TOKEN_EXPIRY) return false
  
  return true
}

