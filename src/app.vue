<script setup lang="ts">
import { useRouter } from 'vue-router'
import { authGuard } from './routes'

const router = useRouter()
if (router && typeof router.beforeEach === 'function') {
  router.beforeEach((to) => {
    const redirect = authGuard(to)
    if (typeof redirect === 'string') {
      return redirect
    }
  })
}
</script>

<template>
  <div id="app" class="min-h-screen font-sans text-slate-800 antialiased bg-slate-50">
    <RouterView />
  </div>
</template>
