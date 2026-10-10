import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/vue'
import ProfilePage from './ProfilePage.vue'
import { renderWithProviders, createMockPinia } from '../../../test-utils'
import { useUsersStore } from '../states/usersStore'
import * as toolsHelper from '../../../helpers/toolsHelper'

vi.mock('../../../helpers/toolsHelper', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    showSuccessDialog: vi.fn(),
    showErrorDialog: vi.fn(),
  }
})

const mockProfile = {
  id: 1,
  name: 'Budi Santoso',
  email: 'budi@delcom.org',
  photo: null as string | null,
  created_at: '2024-01-01',
}

function setupProfilePage(profile = mockProfile) {
  const pinia = createMockPinia()
  const store = useUsersStore(pinia)
  vi.spyOn(store, 'asyncGetMe').mockImplementation(async () => {
    store.profile = { ...profile }
    store.user = { ...profile }
    return { success: true, status: 'success' } as any
  })
  const utils = renderWithProviders(ProfilePage, { pinia })
  return { ...utils, store }
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads profile on mount and fills form', async () => {
    const { getByLabelText, getByText } = setupProfilePage()

    await waitFor(() => {
      expect(getByText('Budi Santoso')).toBeInTheDocument()
    })
    await waitFor(() => {
      expect((getByLabelText('Nama') as HTMLInputElement).value).toBe('Budi Santoso')
    })
    expect((getByLabelText('Email') as HTMLInputElement).value).toBe('budi@delcom.org')
  })

  it('submits profile update successfully', async () => {
    const { getByLabelText, getByRole, store } = setupProfilePage()

    await waitFor(() => {
      expect((getByLabelText('Nama') as HTMLInputElement).value).toBe('Budi Santoso')
    })

    vi.spyOn(store, 'asyncUpdateProfile').mockResolvedValueOnce({
      success: true,
      status: 'success',
      message: 'Profil diperbarui',
    } as any)

    await fireEvent.update(getByLabelText('Nama'), 'Budi Updated')
    await fireEvent.update(getByLabelText('Email'), 'budi@delcom.org')
    await fireEvent.click(getByRole('button', { name: 'Simpan profil' }))

    await waitFor(() => {
      expect(store.asyncUpdateProfile).toHaveBeenCalledWith({
        name: 'Budi Updated',
        email: 'budi@delcom.org',
      })
    })
    await waitFor(() => {
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith('Berhasil', 'Profil diperbarui')
    })
  })

  it('shows error dialog on failed profile update', async () => {
    const { getByLabelText, getByRole, store } = setupProfilePage()

    await waitFor(() => {
      expect((getByLabelText('Nama') as HTMLInputElement).value).toBe('Budi Santoso')
    })

    vi.spyOn(store, 'asyncUpdateProfile').mockResolvedValueOnce({
      success: false,
      message: 'Gagal update',
    } as any)

    await fireEvent.click(getByRole('button', { name: 'Simpan profil' }))

    await waitFor(() => {
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Gagal', 'Gagal update')
    })
  })

  it('submits password change and clears fields on success', async () => {
    const { getByLabelText, getByRole, store } = setupProfilePage()

    await waitFor(() => {
      expect((getByLabelText('Nama') as HTMLInputElement).value).toBe('Budi Santoso')
    })

    vi.spyOn(store, 'asyncChangePassword').mockResolvedValueOnce({
      success: true,
      status: 'success',
      message: 'Password diubah',
    } as any)

    await fireEvent.update(getByLabelText('Kata sandi saat ini'), 'oldpass')
    await fireEvent.update(getByLabelText('Kata sandi baru'), 'newpass')
    await fireEvent.update(getByLabelText('Konfirmasi kata sandi baru'), 'newpass')
    await fireEvent.click(getByRole('button', { name: 'Ubah kata sandi' }))

    await waitFor(() => {
      expect(store.asyncChangePassword).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect((getByLabelText('Kata sandi saat ini') as HTMLInputElement).value).toBe('')
    })
  })

  it('handles photo upload when file selected', async () => {
    const { container, store } = setupProfilePage()

    await waitFor(() => {
      expect(store.profile?.name).toBe('Budi Santoso')
    })

    vi.spyOn(store, 'asyncUploadPhoto').mockResolvedValueOnce({
      success: true,
      status: 'success',
      message: 'Foto diunggah',
    } as any)

    const fileInput = container.querySelector('#profile-photo') as HTMLInputElement
    const file = new File(['img'], 'avatar.png', { type: 'image/png' })
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      configurable: true,
    })
    await fireEvent.change(fileInput)

    await waitFor(() => {
      expect(store.asyncUploadPhoto).toHaveBeenCalledWith(file)
    })
    await waitFor(() => {
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalled()
    })
  })

  it('does not upload photo when no file selected', async () => {
    const { container, store } = setupProfilePage()

    await waitFor(() => {
      expect(store.profile?.name).toBe('Budi Santoso')
    })

    const uploadSpy = vi.spyOn(store, 'asyncUploadPhoto')
    const fileInput = container.querySelector('#profile-photo') as HTMLInputElement
    Object.defineProperty(fileInput, 'files', {
      value: [],
      configurable: true,
    })
    await fireEvent.change(fileInput)

    expect(uploadSpy).not.toHaveBeenCalled()
  })

  it('renders photo when profile has photo', async () => {
    const { getByAltText } = setupProfilePage({
      ...mockProfile,
      name: 'Budi',
      photo: 'https://example.com/a.png',
    })

    await waitFor(() => {
      expect(getByAltText('Budi')).toBeInTheDocument()
    })
  })

  it('shows default initial when no photo', async () => {
    const { getByText } = setupProfilePage({
      ...mockProfile,
      name: 'Budi Santoso',
      photo: null,
    })

    await waitFor(() => {
      expect(getByText('B')).toBeInTheDocument()
    })
  })

  it('uses default success message when message missing', async () => {
    const { getByLabelText, getByRole, store } = setupProfilePage()

    await waitFor(() => {
      expect((getByLabelText('Nama') as HTMLInputElement).value).toBe('Budi Santoso')
    })

    vi.spyOn(store, 'asyncUpdateProfile').mockResolvedValueOnce({
      success: true,
      status: 'success',
    } as any)

    await fireEvent.click(getByRole('button', { name: 'Simpan profil' }))

    await waitFor(() => {
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith(
        'Berhasil',
        'Operasi berhasil dilakukan'
      )
    })
  })

  it('uses default error message when message missing', async () => {
    const { getByLabelText, getByRole, store } = setupProfilePage()

    await waitFor(() => {
      expect((getByLabelText('Nama') as HTMLInputElement).value).toBe('Budi Santoso')
    })

    vi.spyOn(store, 'asyncUpdateProfile').mockResolvedValueOnce({
      success: false,
    } as any)

    await fireEvent.click(getByRole('button', { name: 'Simpan profil' }))

    await waitFor(() => {
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Gagal', 'Terjadi kesalahan')
    })
  })

  it('handles mount when profile is null', async () => {
    const pinia = createMockPinia()
    const store = useUsersStore(pinia)
    vi.spyOn(store, 'asyncGetMe').mockImplementation(async () => {
      store.profile = null
      return { success: true } as any
    })
    const { getByLabelText } = renderWithProviders(ProfilePage, { pinia })
    await waitFor(() => {
      expect(store.asyncGetMe).toHaveBeenCalled()
    })
    expect((getByLabelText('Nama') as HTMLInputElement).value).toBe('')
  })

  it('does not clear password fields on failed change', async () => {
    const { getByLabelText, getByRole, store } = setupProfilePage()
    await waitFor(() => {
      expect((getByLabelText('Nama') as HTMLInputElement).value).toBe('Budi Santoso')
    })
    vi.spyOn(store, 'asyncChangePassword').mockResolvedValueOnce({
      success: false,
      message: 'Salah',
    } as any)
    await fireEvent.update(getByLabelText('Kata sandi saat ini'), 'oldpass')
    await fireEvent.update(getByLabelText('Kata sandi baru'), 'newpass')
    await fireEvent.update(getByLabelText('Konfirmasi kata sandi baru'), 'newpass')
    await fireEvent.click(getByRole('button', { name: 'Ubah kata sandi' }))
    await waitFor(() => {
      expect(toolsHelper.showErrorDialog).toHaveBeenCalled()
    })
    expect((getByLabelText('Kata sandi saat ini') as HTMLInputElement).value).toBe('oldpass')
  })

  it('renders without created_at', async () => {
    const { queryByText } = setupProfilePage({
      id: 1,
      name: 'Budi',
      email: 'b@delcom.org',
      photo: null,
      created_at: undefined as any,
    })
    await waitFor(() => {
      expect(queryByText(/Bergabung sejak/)).toBeNull()
    })
  })

  it('uses U initial when name empty', async () => {
    const { getByText } = setupProfilePage({
      id: 1,
      name: '',
      email: 'b@delcom.org',
      photo: null,
      created_at: '2024-01-01',
    })
    await waitFor(() => {
      expect(getByText('U')).toBeInTheDocument()
    })
  })

  it('fills form with empty email when profile email missing', async () => {
    const { getByLabelText } = setupProfilePage({
      id: 1,
      name: 'Budi',
      email: undefined as any,
      photo: null,
      created_at: '2024-01-01',
    })
    await waitFor(() => {
      expect((getByLabelText('Nama') as HTMLInputElement).value).toBe('Budi')
    })
    expect((getByLabelText('Email') as HTMLInputElement).value).toBe('')
  })
})
