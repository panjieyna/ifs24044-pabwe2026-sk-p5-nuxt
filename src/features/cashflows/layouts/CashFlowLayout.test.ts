import { describe, it, expect, vi } from 'vitest'
import { fireEvent } from '@testing-library/vue'
import CashFlowLayout from './CashFlowLayout.vue'
import { renderWithProviders } from '../../../test-utils'
import { useUsersStore } from '../../users/states/usersStore'

describe('CashFlowLayout', () => {
  it('renders navbar, sidebar, and main layout properly', async () => {
    const { getByRole, getByLabelText } = renderWithProviders(CashFlowLayout)
    const usersStore = useUsersStore()
    expect(usersStore.asyncGetMe).toBeDefined()

    const toggleBtn = getByLabelText('Toggle Sidebar')
    await fireEvent.click(toggleBtn)

    const sidebar = getByRole('region', { name: 'Sidebar Navigasi' })
    expect(sidebar).toBeInTheDocument()
  })
})
