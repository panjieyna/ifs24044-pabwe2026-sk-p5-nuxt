import { render, type RenderOptions } from '@testing-library/vue'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { createRouter, createMemoryHistory, type Router, type RouteRecordRaw } from 'vue-router'
import { defineComponent, type Component } from 'vue'

const DummyComponent = defineComponent({
  template: '<div data-testid="dummy-route">Stub</div>',
})

export function createMockPinia(): Pinia {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'global'> {
  route?: string
  pinia?: Pinia
  router?: Router
  routes?: RouteRecordRaw[]
  global?: Record<string, any>
}

export function renderWithProviders(
  component: Component,
  options: RenderWithProvidersOptions = {}
) {
  const { route = '/', pinia = createMockPinia(), routes = [], global = {}, ...rest } = options

  const defaultRoutes: RouteRecordRaw[] = [
    { path: '/', component: DummyComponent },
    { path: '/cash-flows/:cashFlowId', component: DummyComponent },
    { path: '/users', component: DummyComponent },
    { path: '/profile', component: DummyComponent },
    { path: '/auth/login', component: DummyComponent },
    { path: '/auth/register', component: DummyComponent },
    { path: '/:pathMatch(.*)*', component: DummyComponent },
    ...routes,
  ]

  const history = createMemoryHistory()
  // Set location BEFORE router init so currentRoute has params on first render
  history.replace(route)

  const router =
    options.router ||
    createRouter({
      history,
      routes: defaultRoutes,
    })

  const utils = render(component, {
    global: {
      plugins: [pinia, router],
      stubs: {
        RouterLink: false,
        NuxtLink: {
          props: ['to'],
          template: '<a :href="to"><slot /></a>',
        },
        ...global.stubs,
      },
      ...global,
    },
    ...rest,
  })

  return {
    router,
    pinia,
    ...utils,
  }
}
