export interface Status {
  name: string
  version: string
  message: string
  features: string[]
  updatedAt: string
}

export interface EchoRequest {
  text: string
}

export interface EchoResponse {
  text: string
  echoedAt: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: AuthUser
  issuedAt: string
}

export interface LogoutResponse {
  ok: boolean
  message: string
  loggedOutAt: string
}
