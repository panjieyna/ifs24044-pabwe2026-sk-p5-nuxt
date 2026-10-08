const TOKEN_KEY = 'accessToken'

export const getAccessToken = (): string | null => localStorage.getItem(TOKEN_KEY)
export const putAccessToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token)
export const removeAccessToken = (): void => localStorage.removeItem(TOKEN_KEY)

export const getBaseUrl = (): string =>
  typeof DELCOM_BASEURL !== 'undefined' ? DELCOM_BASEURL : 'https://open-api.delcom.org/api/v1'

export interface RequestOptions extends RequestInit {
  params?: Record<string, any>
}

export function buildUrl(path: string, params?: Record<string, any>): string {
  const baseUrl = getBaseUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${baseUrl}${cleanPath}`)

  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        url.searchParams.append(key, String(val))
      }
    })
  }

  return url.toString()
}

export async function fetchWithAuth(url: string, options: RequestOptions = {}): Promise<Response> {
  const token = getAccessToken()
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  }

  if (options.body instanceof FormData) {
    delete headers['Content-Type']
  }

  return fetch(url, { ...options, headers })
}

export const normalizeResponse = <T = any>(json: any): T & { success: boolean } => ({
  ...json,
  success: json?.status === 'success',
})

export async function requestJson<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const fullUrl = buildUrl(path, options.params)
  const response = await fetchWithAuth(fullUrl, options)

  let data: any
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (response.ok === false) {
    const errorMsg = data?.message || response.statusText || 'Terjadi kesalahan'
    const error: any = new Error(errorMsg)
    error.data = data
    error.status = response.status
    throw error
  }

  return normalizeResponse<T>(data) as T
}
