import type { RouterConfig } from '@nuxt/schema'
import { routes, authGuard } from './routes'

export { authGuard, routes }

export default <RouterConfig>{
  routes: (_routes) => routes,
}
