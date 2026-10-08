import { describe, it, expect } from 'vitest'
import AuthLayout from './AuthLayout.vue'
import { renderWithProviders } from '../../../test-utils'

describe('AuthLayout', () => {
  it('renders title and container properly', () => {
    const { getByRole, getByText } = renderWithProviders(AuthLayout)
    expect(getByRole('region', { name: 'Autentikasi' })).toBeInTheDocument()
    expect(getByText('Delcom Cash Flow')).toBeInTheDocument()
  })
})
