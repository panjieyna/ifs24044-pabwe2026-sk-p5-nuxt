import { describe, it, expect, vi } from 'vitest'
import Swal from 'sweetalert2'
import {
  showSuccessDialog,
  showErrorDialog,
  showConfirmDialog,
  formatRupiah,
  formatDate,
  photoUrl,
} from './toolsHelper'

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
  },
}))

describe('toolsHelper', () => {
  it('calls showSuccessDialog with correct parameters', () => {
    showSuccessDialog('Berhasil', 'Data disimpan')
    expect(Swal.fire).toHaveBeenCalledWith({
      icon: 'success',
      title: 'Berhasil',
      text: 'Data disimpan',
    })
  })

  it('calls showErrorDialog with correct parameters', () => {
    showErrorDialog('Gagal', 'Terjadi error')
    expect(Swal.fire).toHaveBeenCalledWith({
      icon: 'error',
      title: 'Gagal',
      text: 'Terjadi error',
    })
  })

  it('calls showConfirmDialog and returns confirmation boolean', async () => {
    vi.mocked(Swal.fire).mockResolvedValueOnce({ isConfirmed: true } as any)
    const confirmed = await showConfirmDialog('Yakin?', 'Hapus data')
    expect(confirmed).toBe(true)

    vi.mocked(Swal.fire).mockResolvedValueOnce({ isConfirmed: false } as any)
    const cancelled = await showConfirmDialog('Yakin?')
    expect(cancelled).toBe(false)
  })

  it('formats Rupiah currency properly', () => {
    expect(formatRupiah(1250000)).toMatch(/Rp\s1\.250\.000/)
    expect(formatRupiah(0)).toMatch(/Rp\s0/)
  })

  it('formats date properly in Indonesian locale', () => {
    expect(formatDate('')).toBe('')
    expect(formatDate(undefined)).toBe('')
    expect(formatDate('2024-10-05T12:00:00.000Z')).toContain('2024')
    expect(formatDate('2024-10-05 12:00:00')).toContain('2024')
    expect(formatDate('invalid-date')).toBe('invalid-date')
  })

  it('formats photo url properly', () => {
    expect(photoUrl('')).toBe('')
    expect(photoUrl(null)).toBe('')
    expect(photoUrl('https://img.example.com/avatar.png')).toBe('https://img.example.com/avatar.png')
    expect(photoUrl('http://img.example.com/avatar.png')).toBe('http://img.example.com/avatar.png')
    expect(photoUrl('images/user.png')).toBe('https://open-api.delcom.org/images/user.png')
    expect(photoUrl('/images/user.png')).toBe('https://open-api.delcom.org/images/user.png')
  })

  it('photoUrl with relative path covering base', () => {
    expect(photoUrl('uploads/x.png')).toContain('uploads/x.png')
    expect(photoUrl('/uploads/x.png')).toContain('uploads/x.png')
  })
})
