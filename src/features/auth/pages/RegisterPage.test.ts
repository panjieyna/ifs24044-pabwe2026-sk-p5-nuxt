import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent } from '@testing-library/vue'
import RegisterPage from './RegisterPage.vue'
import { renderWithProviders } from '../../../test-utils'
import { useAuthStore } from '../states/authStore'
import * as toolsHelper from '../../../helpers/toolsHelper'

vi.mock('../../../helpers/toolsHelper', () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}))

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders register form properly', () => {
    const { getByLabelText, getByRole } = renderWithProviders(RegisterPage)
    expect(getByLabelText('Nama')).toBeInTheDocument()
    expect(getByLabelText('Email')).toBeInTheDocument()
    expect(getByLabelText('Kata Sandi')).toBeInTheDocument()
    expect(getByRole('button', { name: 'Daftar' })).toBeInTheDocument()
  })

  it('validates empty inputs on submit', async () => {
    const { getByRole } = renderWithProviders(RegisterPage)
    const button = getByRole('button', { name: 'Daftar' })

    await fireEvent.click(button)
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Validasi Gagal', 'Semua kolom wajib diisi')
  })

  it('handles successful registration and redirects to login', async () => {
    const { getByLabelText, getByRole, router } = renderWithProviders(RegisterPage)
    const store = useAuthStore()
    vi.spyOn(store, 'asyncRegister').mockResolvedValueOnce({
      success: true,
      status: 'success',
      message: 'Akun berhasil dibuat',
    } as any)
    const pushSpy = vi.spyOn(router, 'push')

    const nameInput = getByLabelText('Nama')
    const emailInput = getByLabelText('Email')
    const passwordInput = getByLabelText('Kata Sandi')
    const button = getByRole('button', { name: 'Daftar' })

    await fireEvent.input(nameInput, { target: { value: 'Budi Santoso' } })
    await fireEvent.input(emailInput, { target: { value: 'budi@delcom.org' } })
    await fireEvent.input(passwordInput, { target: { value: 'secret123' } })
    await fireEvent.click(button)

    expect(store.asyncRegister).toHaveBeenCalledWith({
      name: 'Budi Santoso',
      email: 'budi@delcom.org',
      password: 'secret123',
    })
    expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith('Berhasil', 'Akun berhasil dibuat')
    expect(pushSpy).toHaveBeenCalledWith('/auth/login')
  })

  it('handles failed registration and displays error dialog', async () => {
    const { getByLabelText, getByRole } = renderWithProviders(RegisterPage)
    const store = useAuthStore()
    vi.spyOn(store, 'asyncRegister').mockResolvedValueOnce({
      success: false,
      status: 'fail',
      message: 'Email sudah terdaftar',
    } as any)

    const nameInput = getByLabelText('Nama')
    const emailInput = getByLabelText('Email')
    const passwordInput = getByLabelText('Kata Sandi')
    const button = getByRole('button', { name: 'Daftar' })

    await fireEvent.input(nameInput, { target: { value: 'Budi Santoso' } })
    await fireEvent.input(emailInput, { target: { value: 'budi@delcom.org' } })
    await fireEvent.input(passwordInput, { target: { value: 'secret123' } })
    await fireEvent.click(button)

    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Gagal', 'Email sudah terdaftar')
  })
})
