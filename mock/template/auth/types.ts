export interface User {
  id: string
  name: string
  email: string
}

export interface AuthBody {
  token: string
  user: User
  issuedAt: string
}

export interface LogoutBody {
  ok: boolean
  message: string
  loggedOutAt: string
}
