import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent } from '@testing-library/vue'
import { nextTick } from 'vue'
import NavbarComponent from './NavbarComponent.vue'
import { renderWithProviders } from '../../../test-utils'
import { useAuthStore } from '../../auth/states/authStore'
import { useUsersStore } from '../../users/states/usersStore'
import * as toolsHelper from '../../../helpers/toolsHelper'

vi.mock('../../../helpers/toolsHelper', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    showConfirmDialog: vi.fn(),
  }
})

describe('NavbarComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders navbar brand and emits toggle-sidebar', async () => {
    const { getByRole, emitted } = renderWithProviders(NavbarComponent)
    const toggleButton = getByRole('button', { name: 'Toggle Sidebar' })

    await fireEvent.click(toggleButton)
    expect(emitted()['toggle-sidebar']).toBeTruthy()
  })

  it('displays user profile with initials when photo is not present', async () => {
    const { getByTestId, getByText } = renderWithProviders(NavbarComponent)
    const usersStore = useUsersStore()
    usersStore.profile = { id: 1, name: 'Budi Santoso', email: 'budi@delcom.org', photo: null }
    await nextTick()

    expect(getByTestId('navbar-user-name')).toHaveTextContent('Budi Santoso')
    expect(getByTestId('navbar-user-email')).toHaveTextContent('budi@delcom.org')
    expect(getByText('B')).toBeInTheDocument()
  })

  it('displays user profile with photo when available', async () => {
    const { getByAltText } = renderWithProviders(NavbarComponent)
    const usersStore = useUsersStore()
    usersStore.profile = { id: 1, name: 'Budi Santoso', email: 'budi@delcom.org', photo: 'img/avatar.png' }
    await nextTick()

    expect(getByAltText('Budi Santoso')).toBeInTheDocument()
  })

  it('handles logout confirmed', async () => {
    const { getByRole, router } = renderWithProviders(NavbarComponent)
    const authStore = useAuthStore()
    vi.spyOn(authStore, 'asyncLogout').mockResolvedValueOnce(undefined)
    vi.mocked(toolsHelper.showConfirmDialog).mockResolvedValueOnce(true)
    const pushSpy = vi.spyOn(router, 'push')

    const logoutButton = getByRole('button', { name: 'Keluar' })
    await fireEvent.click(logoutButton)

    expect(toolsHelper.showConfirmDialog).toHaveBeenCalled()
    expect(authStore.asyncLogout).toHaveBeenCalled()
    expect(pushSpy).toHaveBeenCalledWith('/auth/login')
  })

  it('cancels logout when not confirmed', async () => {
    const { getByRole, router } = renderWithProviders(NavbarComponent)
    const authStore = useAuthStore()
    const logoutSpy = vi.spyOn(authStore, 'asyncLogout')
    vi.mocked(toolsHelper.showConfirmDialog).mockResolvedValueOnce(false)
    const pushSpy = vi.spyOn(router, 'push')

    const logoutButton = getByRole('button', { name: 'Keluar' })
    await fireEvent.click(logoutButton)

    expect(logoutSpy).not.toHaveBeenCalled()
    expect(pushSpy).not.toHaveBeenCalled()
  })

  it('falls back to U initial when name is empty', async () => {
    const { getByText } = renderWithProviders(NavbarComponent)
    const usersStore = useUsersStore()
    usersStore.profile = { id: 1, name: '', email: 'x@delcom.org', photo: null }
    await nextTick()
    expect(getByText('U')).toBeInTheDocument()
  })

  it('uses authStore user when profile is null', async () => {
    const { getByTestId } = renderWithProviders(NavbarComponent)
    const usersStore = useUsersStore()
    const authStore = useAuthStore()
    usersStore.profile = null
    authStore.user = { id: 2, name: 'From Auth', email: 'auth@delcom.org' }
    await nextTick()
    expect(getByTestId('navbar-user-name')).toHaveTextContent('From Auth')
  })

  it('photo with empty name uses User alt', async () => {
    const { getByAltText } = renderWithProviders(NavbarComponent)
    const usersStore = useUsersStore()
    usersStore.profile = { id: 1, name: '', email: 'x@delcom.org', photo: 'https://example.com/p.png' }
    await nextTick()
    expect(getByAltText('User')).toBeInTheDocument()
  })
})
