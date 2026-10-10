import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent } from '@testing-library/vue'
import { nextTick } from 'vue'
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
      message: 'Registrasi berhasil',
    } as any)
    const pushSpy = vi.spyOn(router, 'push')

    await fireEvent.update(getByLabelText('Nama'), 'Budi')
    await fireEvent.update(getByLabelText('Email'), 'budi@delcom.org')
    await fireEvent.update(getByLabelText('Kata Sandi'), 'secret123')
    await fireEvent.click(getByRole('button', { name: 'Daftar' }))

    expect(store.asyncRegister).toHaveBeenCalled()
    expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith('Berhasil', 'Registrasi berhasil')
    expect(pushSpy).toHaveBeenCalledWith('/auth/login')
  })

  it('handles failed registration and displays error dialog', async () => {
    const { getByLabelText, getByRole } = renderWithProviders(RegisterPage)
    const store = useAuthStore()
    vi.spyOn(store, 'asyncRegister').mockResolvedValueOnce({
      success: false,
      status: 'fail',
      message: 'Email sudah digunakan',
    } as any)

    await fireEvent.update(getByLabelText('Nama'), 'Budi')
    await fireEvent.update(getByLabelText('Email'), 'budi@delcom.org')
    await fireEvent.update(getByLabelText('Kata Sandi'), 'secret123')
    await fireEvent.click(getByRole('button', { name: 'Daftar' }))

    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Gagal', 'Email sudah digunakan')
  })

  it('handles success via status field and default message', async () => {
    const { getByLabelText, getByRole, router } = renderWithProviders(RegisterPage)
    const store = useAuthStore()
    vi.spyOn(store, 'asyncRegister').mockResolvedValueOnce({ status: 'success' } as any)
    const pushSpy = vi.spyOn(router, 'push')

    await fireEvent.update(getByLabelText('Nama'), 'Budi')
    await fireEvent.update(getByLabelText('Email'), 'budi@delcom.org')
    await fireEvent.update(getByLabelText('Kata Sandi'), 'secret123')
    await fireEvent.click(getByRole('button', { name: 'Daftar' }))

    expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith('Berhasil', 'Registrasi berhasil')
    expect(pushSpy).toHaveBeenCalledWith('/auth/login')
  })

  it('shows loading button text', async () => {
    const { getByRole } = renderWithProviders(RegisterPage)
    const store = useAuthStore()
    store.isLoadingRegister = true
    await nextTick()
    const btn = getByRole('button', { name: 'Daftar' })
    expect(btn).toHaveTextContent('Memproses...')
    expect(btn).toBeDisabled()
  })

  it('uses default error message', async () => {
    const { getByLabelText, getByRole } = renderWithProviders(RegisterPage)
    const store = useAuthStore()
    vi.spyOn(store, 'asyncRegister').mockResolvedValueOnce({ success: false } as any)

    await fireEvent.update(getByLabelText('Nama'), 'Budi')
    await fireEvent.update(getByLabelText('Email'), 'budi@delcom.org')
    await fireEvent.update(getByLabelText('Kata Sandi'), 'secret')
    await fireEvent.click(getByRole('button', { name: 'Daftar' }))

    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Gagal', 'Registrasi gagal')
  })
})
