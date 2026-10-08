<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../auth/states/authStore'
import { useUsersStore } from '../../users/states/usersStore'
import { showConfirmDialog, photoUrl } from '../../../helpers/toolsHelper'

defineEmits<{
  (e: 'toggle-sidebar'): void
}>()

const router = useRouter()
const authStore = useAuthStore()
const usersStore = useUsersStore()

const currentUser = () => usersStore.profile || authStore.user

async function handleLogout() {
  const confirmed = await showConfirmDialog('Konfirmasi Logout', 'Apakah Anda yakin ingin keluar?')
  if (confirmed) {
    await authStore.asyncLogout()
    router.push('/auth/login')
  }
}
</script>

<template>
  <header class="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 shadow-xs">
    <div class="flex items-center gap-3">
      <button
        type="button"
        aria-label="Toggle Sidebar"
        class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 lg:hidden"
        @click="$emit('toggle-sidebar')"
      >
        <span class="sr-only">Buka menu</span>
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div class="flex items-center gap-2.5">
        <div class="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
          D
        </div>
        <span class="font-bold tracking-tight text-slate-900 hidden sm:inline-block">Delcom Cash Flow</span>
      </div>
    </div>

    <div class="flex items-center gap-4">
      <div v-if="currentUser()" class="flex items-center gap-3 text-right">
        <div class="hidden sm:block">
          <p class="text-sm font-semibold text-slate-800 leading-tight" data-testid="navbar-user-name">
            {{ currentUser()?.name }}
          </p>
          <p class="text-xs text-slate-500 leading-tight" data-testid="navbar-user-email">
            {{ currentUser()?.email }}
          </p>
        </div>

        <div class="relative shrink-0">
          <img
            v-if="currentUser()?.photo"
            :src="photoUrl(currentUser()?.photo)"
            :alt="currentUser()?.name || 'User'"
            class="h-9 w-9 rounded-full object-cover border border-slate-200"
          />
          <div
            v-else
            class="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200"
          >
            {{ (currentUser()?.name || 'U').charAt(0).toUpperCase() }}
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label="Keluar"
        class="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
        @click="handleLogout"
      >
        <span>Keluar</span>
      </button>
    </div>
  </header>
</template>
