import { requestJson } from '../../../helpers/apiHelper'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export const login = async (payload: LoginPayload) =>
  requestJson('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const register = async (payload: RegisterPayload) =>
  requestJson('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const logout = async () =>
  requestJson('/auth/logout', {
    method: 'POST',
  })
