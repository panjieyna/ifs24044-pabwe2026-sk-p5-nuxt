import { describe, it, expect } from 'vitest'
import { fireEvent } from '@testing-library/vue'
import SidebarComponent from './SidebarComponent.vue'
import { renderWithProviders } from '../../../test-utils'

describe('SidebarComponent', () => {
  it('renders navigation links and handles active route', () => {
    const { getByText } = renderWithProviders(SidebarComponent, {
      props: { isOpen: false },
      route: '/',
    })

    expect(getByText('Ringkasan Arus Kas')).toBeInTheDocument()
    expect(getByText('Direktori Pengguna')).toBeInTheDocument()
    expect(getByText('Profil Saya')).toBeInTheDocument()
  })

  it('renders mobile backdrop when isOpen is true and emits close on click', async () => {
    const { getByTestId, emitted } = renderWithProviders(SidebarComponent, {
      props: { isOpen: true },
    })

    const backdrop = getByTestId('sidebar-backdrop')
    expect(backdrop).toBeInTheDocument()

    await fireEvent.click(backdrop)
    expect(emitted()['close']).toBeTruthy()
  })

  it('emits close when close button is clicked', async () => {
    const { getByRole, emitted } = renderWithProviders(SidebarComponent, {
      props: { isOpen: true },
    })

    const closeBtn = getByRole('button', { name: 'Tutup sidebar' })
    await fireEvent.click(closeBtn)
    expect(emitted()['close']).toBeTruthy()
  })

  it('emits close when navigation link is clicked', async () => {
    const { getByText, emitted } = renderWithProviders(SidebarComponent, {
      props: { isOpen: true },
      route: '/users',
    })

    const link = getByText('Direktori Pengguna')
    await fireEvent.click(link)
    expect(emitted()['close']).toBeTruthy()
  })
})
