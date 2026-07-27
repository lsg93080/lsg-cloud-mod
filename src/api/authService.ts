import axios from 'axios'
import type { AuthServiceResponse } from '@/types/models/auth'

// Same-origin gateway path by default; .env overrides it for local dev.
const AUTH_SERVICE_URL = import.meta.env.VITE_AUTH_SERVICE_URL ?? '/auth/api/v1'

// Standalone instance: Does NOT use http.ts (different base URL, ADR-002)
const authHttp = axios.create({
  baseURL: AUTH_SERVICE_URL,
  timeout: 10000
})

// Exchanges a Firebase ID token for a Vitrina platform JWT (existing user login).
// Auth Service expects the Firebase token in the Authorization header, not the request body.
export const loginWithFirebase = async (firebaseIdToken: string): Promise<AuthServiceResponse> => {
  const response = await authHttp.post<AuthServiceResponse>('/auth/login', null, {
    headers: { Authorization: `Bearer ${firebaseIdToken}` }
  })
  return response.data
}

// Registers a new user on the platform using a Firebase ID token.
// Used after Firebase account creation to obtain a platform JWT.
// Auth Service expects the Firebase token in the Authorization header.
export const registerWithFirebase = async (
  firebaseIdToken: string
): Promise<AuthServiceResponse> => {
  const response = await authHttp.post<AuthServiceResponse>('/auth/register', null, {
    headers: { Authorization: `Bearer ${firebaseIdToken}` }
  })
  return response.data
}
