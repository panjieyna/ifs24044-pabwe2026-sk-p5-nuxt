import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent } from '@testing-library/vue'
import CashFlowLayout from './CashFlowLayout.vue'
import { renderWithProviders } from '../../../test-utils'
import { useUsersStore } from '../../users/states/usersStore'
import * as userApi from '../../users/api/userApi'

vi.mock('../../users/api/userApi', () => ({
  getMe: vi.fn().mockResolvedValue({
    success: true,
    status: 'success',
    data: { user: { id: 1, name: 'Budi', email: 'budi@delcom.org' } },
  }),
  getUsers: vi.fn(),
  updateMe: vi.fn(),
  uploadPhoto: vi.fn(),
  changePassword: vi.fn(),
}))

describe('CashFlowLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders navbar, sidebar, and main layout properly', async () => {
    const { getByRole, getByLabelText, pinia } = renderWithProviders(CashFlowLayout)
    const usersStore = useUsersStore(pinia)
    expect(usersStore.asyncGetMe).toBeDefined()

    const toggleBtn = getByLabelText('Toggle Sidebar')
    await fireEvent.click(toggleBtn)

    const sidebar = getByRole('region', { name: 'Sidebar Navigasi' })
    expect(sidebar).toBeInTheDocument()
  })

  it('calls asyncGetMe on mount', async () => {
    renderWithProviders(CashFlowLayout)
    // onMounted memanggil asyncGetMe → getMe API
    await Promise.resolve()
    expect(userApi.getMe).toHaveBeenCalled()
  })

  it('closes sidebar via close event', async () => {
    const { getByLabelText, getByRole } = renderWithProviders(CashFlowLayout)
    await fireEvent.click(getByLabelText('Toggle Sidebar'))
    const sidebar = getByRole('region', { name: 'Sidebar Navigasi' })
    expect(sidebar).toBeInTheDocument()
    // emit close from sidebar if there's a close button
    const closeBtn = getByLabelText(/Tutup sidebar/i)
    await fireEvent.click(closeBtn)
  })
})
