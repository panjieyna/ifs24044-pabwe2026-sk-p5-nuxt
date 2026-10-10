import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getUsers, getMe, updateMe, uploadPhoto, changePassword } from './userApi'
import { requestJson } from '../../../helpers/apiHelper'

vi.mock('../../../helpers/apiHelper', () => ({
  requestJson: vi.fn(),
}))

describe('userApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls getUsers endpoint', async () => {
    vi.mocked(requestJson).mockResolvedValueOnce({ success: true })
    await getUsers()
    expect(requestJson).toHaveBeenCalledWith('/users')
  })

  it('calls getMe endpoint', async () => {
    vi.mocked(requestJson).mockResolvedValueOnce({ success: true })
    await getMe()
    expect(requestJson).toHaveBeenCalledWith('/users/me')
  })

  it('calls updateMe endpoint with payload', async () => {
    vi.mocked(requestJson).mockResolvedValueOnce({ success: true })
    const body = { name: 'Budi', email: 'budi@delcom.org' }
    await updateMe(body)
    expect(requestJson).toHaveBeenCalledWith('/users/me', {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  })

  it('calls uploadPhoto with FormData', async () => {
    vi.mocked(requestJson).mockResolvedValueOnce({ success: true })
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    await uploadPhoto(file)
    expect(requestJson).toHaveBeenCalledWith(
      '/users/me/photo',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      })
    )
    const call = vi.mocked(requestJson).mock.calls[0]
    const formData = call[1]?.body as FormData
    expect(formData.get('photo')).toBe(file)
  })

  it('calls changePassword with default path', async () => {
    vi.mocked(requestJson).mockResolvedValueOnce({ success: true })
    const body = {
      password: 'old',
      new_password: 'new',
      new_password_confirmation: 'new',
    }
    await changePassword(body)
    expect(requestJson).toHaveBeenCalledWith('/users/password', {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  })

  it('calls changePassword with custom path', async () => {
    vi.mocked(requestJson).mockResolvedValueOnce({ success: true })
    const body = {
      password: 'old',
      new_password: 'new',
      new_password_confirmation: 'new',
    }
    await changePassword(body, '/users/me/password')
    expect(requestJson).toHaveBeenCalledWith('/users/me/password', {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  })
})
