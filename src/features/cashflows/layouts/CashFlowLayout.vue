<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NavbarComponent from '../components/NavbarComponent.vue'
import SidebarComponent from '../components/SidebarComponent.vue'
import { useUsersStore } from '../../users/states/usersStore'

const sidebarOpen = ref(false)
const usersStore = useUsersStore()

onMounted(async () => {
  await usersStore.asyncGetMe()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col text-slate-800">
    <NavbarComponent @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    <div class="flex flex-1">
      <SidebarComponent :is-open="sidebarOpen" @close="sidebarOpen = false" />
      <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
        <RouterView />
      </main>
    </div>
  </div>
</template>
