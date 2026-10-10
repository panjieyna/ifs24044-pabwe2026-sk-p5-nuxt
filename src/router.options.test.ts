import { describe, it, expect } from 'vitest'
import routerConfig, { routes, authGuard } from './router.options'

describe('router.options', () => {
  it('exports routes and authGuard', () => {
    expect(routes).toBeDefined()
    expect(typeof authGuard).toBe('function')
  })

  it('default export provides routes function', () => {
    expect(routerConfig).toBeDefined()
    expect(typeof routerConfig.routes).toBe('function')
    const result = routerConfig.routes?.([] as any)
    expect(result).toBe(routes)
  })
})
