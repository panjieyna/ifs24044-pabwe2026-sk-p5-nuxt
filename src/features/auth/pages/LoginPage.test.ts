import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent } from '@testing-library/vue'
import { nextTick } from 'vue'
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

    await fireEvent.update(getByLabelText('Email'), 'user@delcom.org')
    await fireEvent.update(getByLabelText('Kata Sandi'), 'secret123')
    await fireEvent.click(getByRole('button', { name: 'Masuk' }))

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

    await fireEvent.update(getByLabelText('Email'), 'user@delcom.org')
    await fireEvent.update(getByLabelText('Kata Sandi'), 'wrongpass')
    await fireEvent.click(getByRole('button', { name: 'Masuk' }))

    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Gagal', 'Kredensial tidak valid')
  })

  it('handles success via status field and default message', async () => {
    const { getByLabelText, getByRole, router } = renderWithProviders(LoginPage)
    const store = useAuthStore()
    vi.spyOn(store, 'asyncLogin').mockResolvedValueOnce({
      status: 'success',
    } as any)
    const pushSpy = vi.spyOn(router, 'push')

    await fireEvent.update(getByLabelText('Email'), 'user@delcom.org')
    await fireEvent.update(getByLabelText('Kata Sandi'), 'secret123')
    await fireEvent.click(getByRole('button', { name: 'Masuk' }))

    expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith('Berhasil', 'Login berhasil')
    expect(pushSpy).toHaveBeenCalledWith('/')
  })

  it('shows loading button text when isLoadingLogin', async () => {
    const { getByRole } = renderWithProviders(LoginPage)
    const store = useAuthStore()
    store.isLoadingLogin = true
    await nextTick()
    // aria-label tetap "Masuk", teks tombol jadi "Memproses..."
    const btn = getByRole('button', { name: 'Masuk' })
    expect(btn).toHaveTextContent('Memproses...')
    expect(btn).toBeDisabled()
  })

  it('uses default error message when response has no message', async () => {
    const { getByLabelText, getByRole } = renderWithProviders(LoginPage)
    const store = useAuthStore()
    vi.spyOn(store, 'asyncLogin').mockResolvedValueOnce({
      success: false,
    } as any)

    await fireEvent.update(getByLabelText('Email'), 'user@delcom.org')
    await fireEvent.update(getByLabelText('Kata Sandi'), 'wrong')
    await fireEvent.click(getByRole('button', { name: 'Masuk' }))

    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith(
      'Gagal',
      'Email atau kata sandi tidak valid'
    )
  })
})
