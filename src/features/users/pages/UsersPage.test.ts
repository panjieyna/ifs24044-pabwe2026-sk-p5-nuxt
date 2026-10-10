import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/vue'
import { nextTick } from 'vue'
import UsersPage from './UsersPage.vue'
import { renderWithProviders } from '../../../test-utils'
import { useUsersStore } from '../states/usersStore'
import * as userApi from '../api/userApi'

vi.mock('../api/userApi', () => ({
  getUsers: vi.fn().mockResolvedValue({
    success: true,
    status: 'success',
    data: {
      users: [
        { id: 1, name: 'Budi Santoso', email: 'budi@delcom.org', created_at: '2024-01-01' },
        { id: 2, name: 'Ani', email: 'ani@delcom.org', photo: 'img/a.png' },
      ],
    },
  }),
  getMe: vi.fn(),
  updateMe: vi.fn(),
  uploadPhoto: vi.fn(),
  changePassword: vi.fn(),
}))

describe('UsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(userApi.getUsers).mockResolvedValue({
      success: true,
      status: 'success',
      data: {
        users: [
          { id: 1, name: 'Budi Santoso', email: 'budi@delcom.org', created_at: '2024-01-01' },
          { id: 2, name: 'Ani', email: 'ani@delcom.org', photo: 'img/a.png' },
        ],
      },
    } as any)
  })

  it('loads users on mount and shows list', async () => {
    const { getByTestId, getByText, findByText } = renderWithProviders(UsersPage)

    await findByText('Budi Santoso')
    expect(getByTestId('users-list')).toBeInTheDocument()
    expect(getByText('ani@delcom.org')).toBeInTheDocument()
  })

  it('shows loading state', async () => {
    // keep getUsers pending so loading stays true briefly
    let resolveFn: any
    vi.mocked(userApi.getUsers).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFn = resolve
        }) as any
    )

    const { getByTestId } = renderWithProviders(UsersPage)
    const store = useUsersStore()
    store.isLoadingUsers = true
    await nextTick()
    expect(getByTestId('users-loading')).toBeInTheDocument()
    resolveFn?.({ success: true, data: { users: [] } })
  })

  it('shows empty state when no users match filter', async () => {
    const { getByTestId, getByLabelText, findByText } = renderWithProviders(UsersPage)
    await findByText('Budi Santoso')

    const search = getByLabelText('Cari pengguna')
    await fireEvent.update(search, 'xyz-not-found')
    await nextTick()

    expect(getByTestId('users-empty')).toBeInTheDocument()
  })

  it('filters users by name and email', async () => {
    const { getByLabelText, getByText, queryByText, findByText } = renderWithProviders(UsersPage)
    await findByText('Budi Santoso')

    const search = getByLabelText('Cari pengguna')
    await fireEvent.update(search, 'ani')
    await nextTick()

    expect(getByText('Ani')).toBeInTheDocument()
    expect(queryByText('Budi Santoso')).not.toBeInTheDocument()
  })

  it('shows initial avatar when photo is missing', async () => {
    vi.mocked(userApi.getUsers).mockResolvedValueOnce({
      success: true,
      status: 'success',
      data: { users: [{ id: 1, name: 'Budi', email: 'budi@delcom.org' }] },
    } as any)

    const { getByText, findByText } = renderWithProviders(UsersPage)
    await findByText('Budi')
    expect(getByText('B')).toBeInTheDocument()
  })
})
