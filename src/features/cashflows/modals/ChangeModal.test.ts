import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent } from '@testing-library/vue'
import ChangeModal from './ChangeModal.vue'
import { renderWithProviders } from '../../../test-utils'
import { useCashFlowsStore } from '../states/cashFlowsStore'
import * as toolsHelper from '../../../helpers/toolsHelper'

vi.mock('../../../helpers/toolsHelper', () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}))

describe('ChangeModal', () => {
  const mockCashFlow = {
    id: 1,
    type: 'outflow' as const,
    source: 'savings' as const,
    label: 'Belanja Mingguan',
    nominal: 150000,
    description: 'Catatan belanja',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not render when isOpen is false', () => {
    const { queryByRole } = renderWithProviders(ChangeModal, {
      props: { isOpen: false, cashFlow: null },
    })
    expect(queryByRole('dialog')).toBeNull()
  })

  it('renders prefilled data and emits close on cancel', async () => {
    const { getByTestId, getByLabelText, getByRole, emitted } = renderWithProviders(ChangeModal, {
      props: { isOpen: true, cashFlow: mockCashFlow },
    })

    expect((getByLabelText('Label') as HTMLInputElement).value).toBe('Belanja Mingguan')
    expect((getByLabelText('Nominal') as HTMLInputElement).value).toBe('150000')

    const cancelBtn = getByRole('button', { name: 'Batal' })
    await fireEvent.click(cancelBtn)
    expect(emitted()['close']).toBeTruthy()

    const backdrop = getByTestId('change-modal-backdrop')
    await fireEvent.click(backdrop)
    expect(emitted()['close'].length).toBe(2)
  })

  it('toggles transaction type between inflow and outflow', async () => {
    const { getByText } = renderWithProviders(ChangeModal, {
      props: { isOpen: true, cashFlow: mockCashFlow },
    })

    const inflowBtn = getByText(/\+ Pemasukan/)
    await fireEvent.click(inflowBtn)

    const outflowBtn = getByText(/- Pengeluaran/)
    await fireEvent.click(outflowBtn)
  })

  it('validates empty label and zero nominal', async () => {
    const { getByLabelText, getByRole } = renderWithProviders(ChangeModal, {
      props: { isOpen: true, cashFlow: mockCashFlow },
    })
    const labelInput = getByLabelText('Label')
    const nominalInput = getByLabelText('Nominal')
    const submitBtn = getByRole('button', { name: 'Perbarui Transaksi' })

    // Empty label
    await fireEvent.input(labelInput, { target: { value: '' } })
    await fireEvent.click(submitBtn)
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Validasi Gagal', 'Label transaksi wajib diisi')

    // Zero nominal
    await fireEvent.input(labelInput, { target: { value: 'Valid Label' } })
    await fireEvent.input(nominalInput, { target: { value: '0' } })
    await fireEvent.click(submitBtn)
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Validasi Gagal', 'Nominal harus lebih dari 0')
  })

  it('handles successful update submission', async () => {
    const { getByLabelText, getByRole, emitted } = renderWithProviders(ChangeModal, {
      props: { isOpen: true, cashFlow: mockCashFlow },
    })
    const store = useCashFlowsStore()
    vi.spyOn(store, 'asyncUpdateCashFlow').mockResolvedValueOnce({
      success: true,
      status: 'success',
      message: 'Transaksi berhasil diubah',
    } as any)

    const labelInput = getByLabelText('Label')
    const submitBtn = getByRole('button', { name: 'Perbarui Transaksi' })

    await fireEvent.input(labelInput, { target: { value: 'Belanja Bulanan' } })
    await fireEvent.click(submitBtn)

    expect(store.asyncUpdateCashFlow).toHaveBeenCalledWith(1, {
      type: 'outflow',
      source: 'savings',
      label: 'Belanja Bulanan',
      nominal: 150000,
      description: 'Catatan belanja',
    })
    expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith('Berhasil', 'Transaksi berhasil diubah')
    expect(emitted()['success']).toBeTruthy()
    expect(emitted()['close']).toBeTruthy()
  })

  it('handles failed update submission', async () => {
    const { getByRole } = renderWithProviders(ChangeModal, {
      props: { isOpen: true, cashFlow: mockCashFlow },
    })
    const store = useCashFlowsStore()
    vi.spyOn(store, 'asyncUpdateCashFlow').mockResolvedValueOnce({
      success: false,
      status: 'fail',
      message: 'Gagal memperbarui',
    } as any)

    const submitBtn = getByRole('button', { name: 'Perbarui Transaksi' })
    await fireEvent.click(submitBtn)

    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Gagal', 'Gagal memperbarui')
  })

  it('does nothing when submitted without cashFlow', async () => {
    const { getByRole } = renderWithProviders(ChangeModal, {
      props: { isOpen: true, cashFlow: null },
    })
    const store = useCashFlowsStore()
    const updateSpy = vi.spyOn(store, 'asyncUpdateCashFlow')

    const submitBtn = getByRole('button', { name: 'Perbarui Transaksi' })
    await fireEvent.click(submitBtn)
    expect(updateSpy).not.toHaveBeenCalled()
  })
})
