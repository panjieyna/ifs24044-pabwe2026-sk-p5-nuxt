import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent } from '@testing-library/vue'
import LoginPage from './LoginPage.vue'
import { renderWithProviders } from '../../../test-utils'
import { useAuthStore } from '../states/authStore'
import * as toolsHelper from '../../../helpers/toolsHelper'

vi.mock('../../../helpers/toolsHelper', () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form properly', () => {
    const { getByLabelText, getByRole } = renderWithProviders(LoginPage)
    expect(getByLabelText('Email')).toBeInTheDocument()
    expect(getByLabelText('Kata Sandi')).toBeInTheDocument()
    expect(getByRole('button', { name: 'Masuk' })).toBeInTheDocument()
  })

  it('validates empty inputs on submit', async () => {
    const { getByRole } = renderWithProviders(LoginPage)
    const button = getByRole('button', { name: 'Masuk' })

    await fireEvent.click(button)
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Validasi Gagal', 'Semua kolom wajib diisi')
  })

  it('handles successful login and redirects to home', async () => {
    const { getByLabelText, getByRole, router } = renderWithProviders(LoginPage)
    const store = useAuthStore()
    vi.spyOn(store, 'asyncLogin').mockResolvedValueOnce({
      success: true,
      status: 'success',
      message: 'Login sukses',
    } as any)
    const pushSpy = vi.spyOn(router, 'push')

    const emailInput = getByLabelText('Email')
    const passwordInput = getByLabelText('Kata Sandi')
    const button = getByRole('button', { name: 'Masuk' })

    await fireEvent.input(emailInput, { target: { value: 'user@delcom.org' } })
    await fireEvent.input(passwordInput, { target: { value: 'secret123' } })
    await fireEvent.click(button)

    expect(store.asyncLogin).toHaveBeenCalledWith({
      email: 'user@delcom.org',
      password: 'secret123',
    })
    expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith('Berhasil', 'Login sukses')
    expect(pushSpy).toHaveBeenCalledWith('/')
  })

  it('handles failed login and displays error dialog', async () => {
    const { getByLabelText, getByRole } = renderWithProviders(LoginPage)
    const store = useAuthStore()
    vi.spyOn(store, 'asyncLogin').mockResolvedValueOnce({
      success: false,
      status: 'fail',
      message: 'Kredensial tidak valid',
    } as any)

    const emailInput = getByLabelText('Email')
    const passwordInput = getByLabelText('Kata Sandi')
    const button = getByRole('button', { name: 'Masuk' })

    await fireEvent.input(emailInput, { target: { value: 'user@delcom.org' } })
    await fireEvent.input(passwordInput, { target: { value: 'wrongpass' } })
    await fireEvent.click(button)

    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Gagal', 'Kredensial tidak valid')
  })
})
