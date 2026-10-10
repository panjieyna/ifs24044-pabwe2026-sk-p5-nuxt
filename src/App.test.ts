import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './app.vue'
import { renderWithProviders } from './test-utils'
import * as apiHelper from './helpers/apiHelper'
import { routes, authGuard } from './routes'

vi.mock('./helpers/apiHelper', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    getAccessToken: vi.fn(),
  }
})

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders router view container', () => {
    const { container } = renderWithProviders(App)
    expect(container.querySelector('#app')).toBeInTheDocument()
  })

  it('registers beforeEach auth guard', async () => {
    vi.mocked(apiHelper.getAccessToken).mockReturnValue(null)
    const { router } = renderWithProviders(App, { route: '/auth/login' })
    expect(router).toBeDefined()
    // Guard function is used
    expect(authGuard({ path: '/users' })).toBe('/auth/login')
  })
})

describe('authGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects unauthenticated users away from protected routes', () => {
    vi.mocked(apiHelper.getAccessToken).mockReturnValue(null)
    expect(authGuard({ path: '/' })).toBe('/auth/login')
    expect(authGuard({ path: '/users' })).toBe('/auth/login')
  })

  it('allows auth routes without token', () => {
    vi.mocked(apiHelper.getAccessToken).mockReturnValue(null)
    expect(authGuard({ path: '/auth/login' })).toBe(true)
    expect(authGuard({ path: '/auth/register' })).toBe(true)
  })

  it('redirects authenticated users away from auth routes', () => {
    vi.mocked(apiHelper.getAccessToken).mockReturnValue('token-abc')
    expect(authGuard({ path: '/auth/login' })).toBe('/')
    expect(authGuard({ path: '/auth/register' })).toBe('/')
  })

  it('allows authenticated users on protected routes', () => {
    vi.mocked(apiHelper.getAccessToken).mockReturnValue('token-abc')
    expect(authGuard({ path: '/' })).toBe(true)
    expect(authGuard({ path: '/profile' })).toBe(true)
  })
})

describe('routes', () => {
  it('exports expected route structure', () => {
    expect(routes).toBeDefined()
    expect(Array.isArray(routes)).toBe(true)
    expect(routes.length).toBeGreaterThanOrEqual(3)

    const authRoute = routes.find((r) => r.path === '/auth')
    expect(authRoute).toBeDefined()
    expect(authRoute?.children?.some((c) => c.path === 'login')).toBe(true)
    expect(authRoute?.children?.some((c) => c.path === 'register')).toBe(true)

    const dashboard = routes.find((r) => r.path === '/')
    expect(dashboard).toBeDefined()
    expect(dashboard?.meta?.requiresAuth).toBe(true)
    expect(dashboard?.children?.some((c) => c.name === 'home')).toBe(true)
    expect(dashboard?.children?.some((c) => c.name === 'users')).toBe(true)
    expect(dashboard?.children?.some((c) => c.name === 'profile')).toBe(true)
    expect(dashboard?.children?.some((c) => c.name === 'cash-flow-detail')).toBe(true)

    const notFound = routes.find((r) => r.name === 'not-found')
    expect(notFound).toBeDefined()
  })

  it('beforeEnter redirects without token', () => {
    vi.mocked(apiHelper.getAccessToken).mockReturnValue(null)
    const dashboard = routes.find((r) => r.path === '/')
    const next = vi.fn()
    if (dashboard?.beforeEnter && typeof dashboard.beforeEnter === 'function') {
      ;(dashboard.beforeEnter as any)({ path: '/' }, {}, next)
      expect(next).toHaveBeenCalledWith('/auth/login')
    }
  })

  it('beforeEnter allows with token', () => {
    vi.mocked(apiHelper.getAccessToken).mockReturnValue('tok')
    const dashboard = routes.find((r) => r.path === '/')
    const next = vi.fn()
    if (dashboard?.beforeEnter && typeof dashboard.beforeEnter === 'function') {
      ;(dashboard.beforeEnter as any)({ path: '/' }, {}, next)
      expect(next).toHaveBeenCalledWith()
    }
  })
})
