import { describe, it, expect, vi } from 'vitest'
import { fireEvent } from '@testing-library/vue'
import NotFoundPage from './NotFoundPage.vue'
import { renderWithProviders } from '../../../test-utils'

describe('NotFoundPage', () => {
  it('renders 404 message and navigates home on click', async () => {
    const { getByRole, getByText, router } = renderWithProviders(NotFoundPage)
    const pushSpy = vi.spyOn(router, 'push')

    expect(getByText('Halaman Tidak Ditemukan')).toBeInTheDocument()
    expect(getByText(/tautan atau halaman/i)).toBeInTheDocument()

    const btn = getByRole('button', { name: 'Kembali ke Beranda' })
    await fireEvent.click(btn)
    expect(pushSpy).toHaveBeenCalledWith('/')
  })
})
