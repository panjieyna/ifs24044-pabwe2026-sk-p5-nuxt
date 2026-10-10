import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUsersStore } from './usersStore'
import * as userApi from '../api/userApi'

vi.mock('../api/userApi')

describe('usersStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('handles asyncGetUsers success and failure', async () => {
    const store = useUsersStore()
    const mockUsers = [{ id: 1, name: 'Budi', email: 'budi@delcom.org' }]

    vi.mocked(userApi.getUsers).mockResolvedValueOnce({
      success: true,
      status: 'success',
      data: { users: mockUsers },
    } as any)

    const res = await store.asyncGetUsers()
    expect(res.success).toBe(true)
    expect(store.users).toEqual(mockUsers)
    expect(store.isLoadingUsers).toBe(false)
    expect(store.isLoading).toBe(false)

    vi.mocked(userApi.getUsers).mockResolvedValueOnce({
      success: false,
      status: 'fail',
    } as any)
    await store.asyncGetUsers()
    expect(store.isLoadingUsers).toBe(false)
  })

  it('handles asyncGetMe success with status success and empty data', async () => {
    const store = useUsersStore()
    const mockUser = { id: 1, name: 'Budi', email: 'budi@delcom.org' }

    vi.mocked(userApi.getMe).mockResolvedValueOnce({
      success: true,
      status: 'success',
      data: { user: mockUser },
    } as any)

    const res = await store.asyncGetMe()
    expect(res.success).toBe(true)
    expect(store.profile).toEqual(mockUser)
    expect(store.user).toEqual(mockUser)
    expect(store.isLoadingProfile).toBe(false)

    vi.mocked(userApi.getMe).mockResolvedValueOnce({
      success: false,
      status: 'fail',
      data: {},
    } as any)
    await store.asyncGetMe()
    expect(store.isLoadingProfile).toBe(false)
  })

  it('handles asyncUpdateProfile success and failure', async () => {
    const store = useUsersStore()
    vi.mocked(userApi.updateMe).mockResolvedValueOnce({
      success: true,
      status: 'success',
    } as any)
    vi.mocked(userApi.getMe).mockResolvedValueOnce({
      success: true,
      status: 'success',
      data: { user: { id: 1, name: 'Updated', email: 'u@delcom.org' } },
    } as any)

    const res = await store.asyncUpdateProfile({ name: 'Updated', email: 'u@delcom.org' })
    expect(res.success).toBe(true)
    expect(store.isProfileUpdated).toBe(true)
    expect(store.isLoading).toBe(false)

    vi.mocked(userApi.updateMe).mockResolvedValueOnce({
      success: false,
      status: 'fail',
    } as any)
    await store.asyncUpdateProfile({ name: 'X' })
    expect(store.isProfileUpdated).toBe(false)
  })

  it('handles asyncUploadPhoto success and failure', async () => {
    const store = useUsersStore()
    const file = new File(['x'], 'a.png', { type: 'image/png' })

    vi.mocked(userApi.uploadPhoto).mockResolvedValueOnce({
      success: true,
      status: 'success',
    } as any)
    vi.mocked(userApi.getMe).mockResolvedValueOnce({
      success: true,
      status: 'success',
      data: { user: { id: 1, name: 'Budi', email: 'b@delcom.org', photo: 'p.png' } },
    } as any)

    const res = await store.asyncUploadPhoto(file)
    expect(res.success).toBe(true)
    expect(store.isPhotoUploaded).toBe(true)

    vi.mocked(userApi.uploadPhoto).mockResolvedValueOnce({
      success: false,
      status: 'fail',
    } as any)
    await store.asyncUploadPhoto(file)
    expect(store.isPhotoUploaded).toBe(false)
  })

  it('handles asyncChangePassword success and failure', async () => {
    const store = useUsersStore()
    const payload = {
      password: 'old',
      new_password: 'new',
      new_password_confirmation: 'new',
    }

    vi.mocked(userApi.changePassword).mockResolvedValueOnce({
      success: true,
      status: 'success',
    } as any)

    const res = await store.asyncChangePassword(payload)
    expect(res.success).toBe(true)
    expect(store.isPasswordChanged).toBe(true)

    vi.mocked(userApi.changePassword).mockResolvedValueOnce({
      success: false,
      status: 'fail',
    } as any)
    await store.asyncChangePassword(payload)
    expect(store.isPasswordChanged).toBe(false)
  })

  it('exposes alias methods', async () => {
    const store = useUsersStore()
    // Pinia wraps actions, jadi tidak bisa toBe identity — cek callable saja
    expect(typeof store.asyncGetProfile).toBe('function')
    expect(typeof store.loadUsers).toBe('function')
    expect(typeof store.loadProfile).toBe('function')
    expect(typeof store.saveProfile).toBe('function')
    expect(typeof store.savePhoto).toBe('function')
    expect(typeof store.savePassword).toBe('function')

    vi.mocked(userApi.getUsers).mockResolvedValueOnce({
      success: true,
      status: 'success',
      data: { users: [] },
    } as any)
    await store.loadUsers()
    expect(userApi.getUsers).toHaveBeenCalled()
  })

  it('handles empty users and user data', async () => {
    const store = useUsersStore()
    vi.mocked(userApi.getUsers).mockResolvedValueOnce({
      status: 'success',
      data: {},
    } as any)
    await store.asyncGetUsers()
    expect(store.users).toEqual([])

    vi.mocked(userApi.getMe).mockResolvedValueOnce({
      status: 'success',
      data: {},
    } as any)
    await store.asyncGetMe()
    expect(store.profile).toBeNull()
  })
})
