import { requestJson } from '../../../helpers/apiHelper'

export interface User {
  id: number
  name: string
  email: string
  photo?: string | null
  created_at?: string
  updated_at?: string
  [key: string]: any
}

export interface UpdateProfilePayload {
  name: string
  email?: string
}

export interface ChangePasswordPayload {
  password: string
  new_password: string
  new_password_confirmation: string
}

export const getUsers = () => requestJson('/users')

export const getMe = () => requestJson('/users/me')

export const updateMe = (body: UpdateProfilePayload) =>
  requestJson('/users/me', {
    method: 'PUT',
    body: JSON.stringify(body),
  })

export const uploadPhoto = (file: File) => {
  const formData = new FormData()
  formData.append('photo', file)
  return requestJson('/users/me/photo', {
    method: 'POST',
    body: formData,
  })
}

export const changePassword = (body: ChangePasswordPayload, path = '/users/password') =>
  requestJson(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
