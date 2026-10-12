import type { RouterConfig } from '@nuxt/schema'
import { routes } from './routes'

export { routes, authGuard } from './routes'

export default <RouterConfig>{
  routes: (_routes) => routes,
}
