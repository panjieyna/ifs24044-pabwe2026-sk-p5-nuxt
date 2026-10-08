import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getAccessToken,
  putAccessToken,
  removeAccessToken,
  getBaseUrl,
  buildUrl,
  fetchWithAuth,
  normalizeResponse,
  requestJson,
} from './apiHelper'

describe('apiHelper', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('handles token storage correctly', () => {
    expect(getAccessToken()).toBeNull()
    putAccessToken('token-123')
    expect(getAccessToken()).toBe('token-123')
    removeAccessToken()
    expect(getAccessToken()).toBeNull()
  })

  it('returns base url correctly', () => {
    expect(getBaseUrl()).toBe('https://open-api.delcom.org/api/v1')
  })

  it('builds URL properly with and without leading slash and query params', () => {
    const url1 = buildUrl('/cash-flows')
    expect(url1).toBe('https://open-api.delcom.org/api/v1/cash-flows')

    const url2 = buildUrl('users', {
      type: 'inflow',
      empty: '',
      undef: undefined,
      nil: null,
      count: 10,
    })
    expect(url2).toBe('https://open-api.delcom.org/api/v1/users?type=inflow&count=10')
  })

  it('fetchWithAuth sends correct headers without token', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'success' }),
    })
    vi.stubGlobal('fetch', mockFetch)

    await fetchWithAuth('https://example.com/api')
    expect(mockFetch).toHaveBeenCalledWith('https://example.com/api', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
  })

  it('fetchWithAuth adds Bearer token and merges custom headers', async () => {
    putAccessToken('auth-token')
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'success' }),
    })
    vi.stubGlobal('fetch', mockFetch)

    await fetchWithAuth('https://example.com/api', {
      headers: { 'X-Custom': 'header' },
    })
    expect(mockFetch).toHaveBeenCalledWith('https://example.com/api', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer auth-token',
        'X-Custom': 'header',
      },
    })
  })

  it('fetchWithAuth deletes Content-Type when body is FormData', async () => {
    const formData = new FormData()
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'success' }),
    })
    vi.stubGlobal('fetch', mockFetch)

    await fetchWithAuth('https://example.com/upload', {
      body: formData,
    })
    expect(mockFetch).toHaveBeenCalledWith('https://example.com/upload', {
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    })
  })

  it('normalizeResponse properly sets success flag', () => {
    expect(normalizeResponse({ status: 'success', data: 123 })).toEqual({
      status: 'success',
      data: 123,
      success: true,
    })
    expect(normalizeResponse({ status: 'fail', message: 'error' })).toEqual({
      status: 'fail',
      message: 'error',
      success: false,
    })
    expect(normalizeResponse(null)).toEqual({
      success: false,
    })
  })

  it('requestJson successfully parses json response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'success', data: { id: 1 } }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const result = await requestJson('/test')
    expect(result).toEqual({
      status: 'success',
      data: { id: 1 },
      success: true,
    })
  })

  it('requestJson throws error when response.ok is false with message in body', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ status: 'fail', message: 'Input tidak valid' }),
    })
    vi.stubGlobal('fetch', mockFetch)

    await expect(requestJson('/test')).rejects.toThrow('Input tidak valid')
  })

  it('requestJson throws error when response.ok is false with fallback statusText', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => {
        throw new Error('JSON parse error')
      },
    })
    vi.stubGlobal('fetch', mockFetch)

    await expect(requestJson('/test')).rejects.toThrow('Internal Server Error')
  })

  it('requestJson throws generic error when response.ok is false and no message/statusText', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: '',
      json: async () => null,
    })
    vi.stubGlobal('fetch', mockFetch)

    await expect(requestJson('/test')).rejects.toThrow('Terjadi kesalahan')
  })
})
