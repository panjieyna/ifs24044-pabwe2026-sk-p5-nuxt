import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent } from '@testing-library/vue'
import AddModal from './AddModal.vue'
import { renderWithProviders } from '../../../test-utils'
import { useCashFlowsStore } from '../states/cashFlowsStore'
import * as toolsHelper from '../../../helpers/toolsHelper'

vi.mock('../../../helpers/toolsHelper', () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}))

describe('AddModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not render when isOpen is false', () => {
    const { queryByRole } = renderWithProviders(AddModal, {
      props: { isOpen: false },
    })
    expect(queryByRole('dialog')).toBeNull()
  })

  it('renders and closes when backdrop or close button is clicked', async () => {
    const { getByTestId, getByRole, emitted } = renderWithProviders(AddModal, {
      props: { isOpen: true },
    })

    const backdrop = getByTestId('add-modal-backdrop')
    await fireEvent.click(backdrop)
    expect(emitted()['close']).toBeTruthy()

    const closeBtn = getByRole('button', { name: 'Tutup' })
    await fireEvent.click(closeBtn)
    expect(emitted()['close'].length).toBe(2)
  })

  it('toggles transaction type between inflow and outflow', async () => {
    const { getByText } = renderWithProviders(AddModal, {
      props: { isOpen: true },
    })

    const outflowBtn = getByText(/- Pengeluaran/)
    await fireEvent.click(outflowBtn)

    const inflowBtn = getByText(/\+ Pemasukan/)
    await fireEvent.click(inflowBtn)
  })

  it('validates empty label and zero nominal', async () => {
    const { getByLabelText, getByRole } = renderWithProviders(AddModal, {
      props: { isOpen: true },
    })
    const submitBtn = getByRole('button', { name: 'Simpan Transaksi' })

    // Empty label
    await fireEvent.click(submitBtn)
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Validasi Gagal', 'Label transaksi wajib diisi')

    // Empty nominal
    const labelInput = getByLabelText('Label')
    await fireEvent.input(labelInput, { target: { value: 'Makan' } })
    await fireEvent.click(submitBtn)
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Validasi Gagal', 'Nominal harus lebih dari 0')
  })

  it('handles successful transaction submission', async () => {
    const { getByLabelText, getByRole, emitted } = renderWithProviders(AddModal, {
      props: { isOpen: true },
    })
    const store = useCashFlowsStore()
    vi.spyOn(store, 'asyncAddCashFlow').mockResolvedValueOnce({
      success: true,
      status: 'success',
      message: 'Transaksi berhasil ditambahkan',
    } as any)

    const labelInput = getByLabelText('Label')
    const nominalInput = getByLabelText('Nominal')
    const sourceSelect = getByLabelText('Sumber Dana')
    const descInput = getByLabelText('Deskripsi')
    const submitBtn = getByRole('button', { name: 'Simpan Transaksi' })

    await fireEvent.input(labelInput, { target: { value: 'Gaji Bulanan' } })
    await fireEvent.input(nominalInput, { target: { value: '3000000' } })
    await fireEvent.change(sourceSelect, { target: { value: 'savings' } })
    await fireEvent.input(descInput, { target: { value: 'Keterangan gaji' } })
    await fireEvent.click(submitBtn)

    expect(store.asyncAddCashFlow).toHaveBeenCalledWith({
      type: 'inflow',
      source: 'savings',
      label: 'Gaji Bulanan',
      nominal: 3000000,
      description: 'Keterangan gaji',
    })
    expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith('Berhasil', 'Transaksi berhasil ditambahkan')
    expect(emitted()['success']).toBeTruthy()
    expect(emitted()['close']).toBeTruthy()
  })

  it('handles failed transaction submission', async () => {
    const { getByLabelText, getByRole } = renderWithProviders(AddModal, {
      props: { isOpen: true },
    })
    const store = useCashFlowsStore()
    vi.spyOn(store, 'asyncAddCashFlow').mockResolvedValueOnce({
      success: false,
      status: 'fail',
      message: 'Server error',
    } as any)

    const labelInput = getByLabelText('Label')
    const nominalInput = getByLabelText('Nominal')
    const submitBtn = getByRole('button', { name: 'Simpan Transaksi' })

    await fireEvent.input(labelInput, { target: { value: 'Gaji Bulanan' } })
    await fireEvent.input(nominalInput, { target: { value: '3000000' } })
    await fireEvent.click(submitBtn)

    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Gagal', 'Server error')
  })
})
