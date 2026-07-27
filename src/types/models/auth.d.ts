export type UserRole = 'player' | 'developer' | 'admin'

export interface AuthServiceUser {
  id: string
  email?: string
  roles: UserRole[]
  uid?: string
  displayName?: string
  photoURL?: string
}

// Response from Auth Service POST /auth/login and POST /auth/register.
// Shape matches the actual Auth Service DTO (snake_case fields).
export interface AuthServiceResponse {
  access_token: string
  isNewUser: boolean
  user: AuthServiceUser
}
