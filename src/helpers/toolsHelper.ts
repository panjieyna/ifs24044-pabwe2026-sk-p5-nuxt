import Swal from 'sweetalert2'

export const showSuccessDialog = (title: string, text?: string) =>
  Swal.fire({
    icon: 'success',
    title,
    text,
  })

export const showErrorDialog = (title: string, text?: string) =>
  Swal.fire({
    icon: 'error',
    title,
    text,
  })

export const showConfirmDialog = async (title: string, text?: string): Promise<boolean> => {
  const result = await Swal.fire({
    icon: 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: 'Ya',
    cancelButtonText: 'Batal',
  })
  return Boolean(result.isConfirmed)
}

export const formatRupiah = (amount: number): string =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  })
    .format(amount || 0)
    .replaceAll('\u00a0', ' ')

export const formatDate = (dateString?: string): string => {
  if (!dateString) return ''
  const clean = dateString.includes('T') ? dateString : dateString.replace(' ', 'T')
  const date = new Date(clean)
  if (isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export const photoUrl = (photo?: string | null): string => {
  if (!photo) return ''
  if (/^https?:\/\//.test(photo)) return photo
  const base = typeof DELCOM_BASEURL !== 'undefined' ? DELCOM_BASEURL : 'https://open-api.delcom.org/api/v1'
  return `${new URL(base).origin}/${photo.replace(/^\//, '')}`
}
