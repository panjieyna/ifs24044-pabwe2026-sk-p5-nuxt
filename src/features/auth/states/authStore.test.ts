import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from './authStore'
import * as authApi from '../api/authApi'
import * as apiHelper from '../../../helpers/apiHelper'

vi.mock('../api/authApi')

describe('authStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('handles asyncLogin success correctly', async () => {
    const store = useAuthStore()
    const mockUser = { id: 1, name: 'Budi', email: 'budi@delcom.org' }

    vi.mocked(authApi.login).mockResolvedValueOnce({
      success: true,
      status: 'success',
      data: {
        token: 'token-xyz',
        user: mockUser,
      },
    } as any)

    const res = await store.asyncLogin({ email: 'budi@delcom.org', password: 'password123' })
    expect(res.success).toBe(true)
    expect(store.isAuthLogin).toBe(true)
    expect(store.token).toBe('token-xyz')
    expect(store.user).toEqual(mockUser)
    expect(apiHelper.getAccessToken()).toBe('token-xyz')
  })

  it('handles asyncLogin failure response', async () => {
    const store = useAuthStore()
    vi.mocked(authApi.login).mockResolvedValueOnce({
      success: false,
      status: 'fail',
      message: 'Kredensial salah',
    } as any)

    const res = await store.asyncLogin({ email: 'budi@delcom.org', password: 'wrong' })
    expect(store.isAuthLogin).toBe(false)
    expect(res.message).toBe('Kredensial salah')
  })

  it('handles asyncLogin throw error', async () => {
    const store = useAuthStore()
    vi.mocked(authApi.login).mockRejectedValueOnce(new Error('Network error'))

    const res = await store.asyncLogin({ email: 'budi@delcom.org', password: 'wrong' })
    expect(store.isAuthLogin).toBe(false)
    expect(res.success).toBe(false)
    expect(res.message).toBe('Network error')
  })

  it('handles asyncRegister success and failure', async () => {
    const store = useAuthStore()
    vi.mocked(authApi.register).mockResolvedValueOnce({
      success: true,
      status: 'success',
      message: 'Registrasi berhasil',
    } as any)

    const resSuccess = await store.asyncRegister({
      name: 'Budi',
      email: 'budi@delcom.org',
      password: 'password123',
    })
    expect(store.isAuthRegister).toBe(true)
    expect(resSuccess.success).toBe(true)

    vi.mocked(authApi.register).mockRejectedValueOnce(new Error('Email sudah digunakan'))
    const resFail = await store.asyncRegister({
      name: 'Budi',
      email: 'budi@delcom.org',
      password: 'password123',
    })
    expect(store.isAuthRegister).toBe(false)
    expect(resFail.success).toBe(false)
    expect(resFail.message).toBe('Email sudah digunakan')
  })

  it('handles asyncLogout success and failure', async () => {
    const store = useAuthStore()
    store.token = 'existing-token'
    store.user = { id: 1, name: 'Budi', email: 'budi@delcom.org' }
    store.isAuthLogin = true

    vi.mocked(authApi.logout).mockResolvedValueOnce({ success: true } as any)
    await store.asyncLogout()

    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
    expect(store.isAuthLogin).toBe(false)
    expect(store.isAuthLogout).toBe(true)

    // Logout error fallback
    vi.mocked(authApi.logout).mockRejectedValueOnce(new Error('Server error'))
    await store.asyncLogout()
    expect(store.isAuthLogout).toBe(true)
  })
})
