import { describe, it, expect, vi, beforeEach } from 'vitest'
import { login, register, logout } from './authApi'
import { requestJson } from '../../../helpers/apiHelper'

vi.mock('../../../helpers/apiHelper', () => ({
  requestJson: vi.fn(),
}))

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls login endpoint with correct params', async () => {
    vi.mocked(requestJson).mockResolvedValueOnce({ success: true })
    const payload = { email: 'test@delcom.org', password: 'password123' }

    await login(payload)
    expect(requestJson).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  })

  it('calls register endpoint with correct params', async () => {
    vi.mocked(requestJson).mockResolvedValueOnce({ success: true })
    const payload = { name: 'User Test', email: 'test@delcom.org', password: 'password123' }

    await register(payload)
    expect(requestJson).toHaveBeenCalledWith('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  })

  it('calls logout endpoint with correct params', async () => {
    vi.mocked(requestJson).mockResolvedValueOnce({ success: true })

    await logout()
    expect(requestJson).toHaveBeenCalledWith('/auth/logout', {
      method: 'POST',
    })
  })
})
