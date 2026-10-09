<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUsersStore } from '../states/usersStore'
import { formatDate, photoUrl } from '../../../helpers/toolsHelper'

const usersStore = useUsersStore()
const searchQuery = ref('')

onMounted(async () => {
  await usersStore.asyncGetUsers()
})

const filteredUsers = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return usersStore.users
  return usersStore.users.filter(
    (u) =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
  )
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">Direktori Pengguna</h1>
        <p class="text-sm text-slate-500 mt-0.5">Daftar pengguna terdaftar di Delcom Cash Flow</p>
      </div>

      <div class="relative w-full sm:w-72">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari nama atau email..."
          aria-label="Cari pengguna"
          class="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="usersStore.isLoadingUsers" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="users-loading">
      <div v-for="i in 6" :key="i" class="animate-pulse rounded-xl border border-slate-200 bg-white p-5 flex items-center gap-4">
        <div class="h-12 w-12 rounded-full bg-slate-200 shrink-0"></div>
        <div class="space-y-2 flex-1">
          <div class="h-4 bg-slate-200 rounded w-3/4"></div>
          <div class="h-3 bg-slate-100 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredUsers.length === 0"
      class="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"
      data-testid="users-empty"
    >
      <div class="mx-auto h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg mb-3">
        ?
      </div>
      <h3 class="text-base font-semibold text-slate-900">Tidak ada pengguna ditemukan</h3>
      <p class="text-sm text-slate-500 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
    </div>

    <!-- Users Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="users-list">
      <div
        v-for="user in filteredUsers"
        :key="user.id"
        class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
      >
        <div class="relative shrink-0">
          <img
            v-if="user.photo"
            :src="photoUrl(user.photo)"
            :alt="user.name"
            class="h-12 w-12 rounded-full object-cover border border-slate-200"
          />
          <div
            v-else
            class="h-12 w-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg border border-blue-200"
          >
            {{ user.name.charAt(0).toUpperCase() }}
          </div>
        </div>

        <div class="min-w-0 flex-1">
          <h2 class="text-sm font-semibold text-slate-900 truncate">{{ user.name }}</h2>
          <p class="text-xs text-slate-500 truncate mt-0.5">{{ user.email }}</p>
          <p v-if="user.created_at" class="text-[11px] text-slate-600 mt-1">
            Bergabung {{ formatDate(user.created_at) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
