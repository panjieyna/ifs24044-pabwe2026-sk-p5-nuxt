<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useUsersStore } from '../states/usersStore'
import { showSuccessDialog, showErrorDialog, photoUrl } from '../../../helpers/toolsHelper'

const store = useUsersStore()
const form = reactive({ name: '', email: '' })
const pw = reactive({ password: '', new_password: '', new_password_confirmation: '' })

const notify = (res: any) => {
  const isOk = Boolean(res?.success || res?.status === 'success')
  if (isOk) {
    showSuccessDialog('Berhasil', res?.message || 'Operasi berhasil dilakukan')
  } else {
    showErrorDialog('Gagal', res?.message || 'Terjadi kesalahan')
  }
}

onMounted(async () => {
  await store.asyncGetMe()
  if (store.profile) {
    form.name = store.profile.name || ''
    form.email = store.profile.email || ''
  }
})

const submitProfile = async () => {
  const res = await store.asyncUpdateProfile({ name: form.name, email: form.email })
  notify(res)
}

const submitPassword = async () => {
  const res = await store.asyncChangePassword({ ...pw })
  notify(res)
  if (res?.success || res?.status === 'success') {
    pw.password = ''
    pw.new_password = ''
    pw.new_password_confirmation = ''
  }
}

const submitPhoto = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target?.files?.[0]
  if (file) {
    const res = await store.asyncUploadPhoto(file)
    notify(res)
  }
}
</script>

<template>
  <section aria-label="Profil" class="max-w-3xl space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Profil Saya</h1>
      <p class="text-sm text-slate-500 mt-0.5">Kelola informasi akun dan pengaturan keamanan</p>
    </div>

    <!-- Profile Overview & Photo -->
    <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
      <div v-if="store.profile" class="flex flex-col sm:flex-row sm:items-center gap-4">
        <div class="relative shrink-0">
          <img
            v-if="store.profile.photo"
            :src="photoUrl(store.profile.photo)"
            :alt="store.profile.name"
            class="h-20 w-20 rounded-full object-cover border-2 border-blue-200 shadow-sm"
          />
          <div
            v-else
            class="h-20 w-20 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-2xl border-2 border-blue-200"
          >
            {{ (store.profile.name || 'U').charAt(0).toUpperCase() }}
          </div>
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900">{{ store.profile.name }}</h2>
          <p class="text-sm text-slate-500">{{ store.profile.email }}</p>
          <p v-if="store.profile.created_at" class="text-xs text-slate-600 mt-1">
            Bergabung sejak: {{ store.profile.created_at }}
          </p>
        </div>
      </div>

      <div>
        <label
          for="profile-photo"
          class="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50 cursor-pointer"
        >
          Ganti Foto Profil
        </label>
        <input
          id="profile-photo"
          type="file"
          accept="image/*"
          aria-label="Foto profil"
          class="sr-only"
          @change="submitPhoto"
        />
      </div>
    </div>

    <!-- Data Diri Form -->
    <form class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4" @submit.prevent="submitProfile">
      <div>
        <h2 class="text-base font-bold text-slate-900">Data Diri</h2>
        <p class="text-xs text-slate-500 mt-0.5">Perbarui nama lengkap dan email Anda</p>
      </div>

      <div>
        <label for="profile-name" class="block text-sm font-semibold text-slate-700 mb-1">Nama</label>
        <input
          id="profile-name"
          v-model="form.name"
          aria-label="Nama"
          required
          class="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label for="profile-email" class="block text-sm font-semibold text-slate-700 mb-1">Email</label>
        <input
          id="profile-email"
          v-model="form.email"
          type="email"
          aria-label="Email"
          required
          class="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <button
        type="submit"
        aria-label="Simpan profil"
        class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Simpan Profil
      </button>
    </form>

    <!-- Ubah Kata Sandi Form -->
    <form class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4" @submit.prevent="submitPassword">
      <div>
        <h2 class="text-base font-bold text-slate-900">Ubah Kata Sandi</h2>
        <p class="text-xs text-slate-500 mt-0.5">Amankan akun Anda dengan kata sandi yang kuat</p>
      </div>

      <div>
        <label for="profile-password" class="block text-sm font-semibold text-slate-700 mb-1">Kata Sandi Saat Ini</label>
        <input
          id="profile-password"
          v-model="pw.password"
          type="password"
          aria-label="Kata sandi saat ini"
          required
          class="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label for="profile-new-password" class="block text-sm font-semibold text-slate-700 mb-1">Kata Sandi Baru</label>
        <input
          id="profile-new-password"
          v-model="pw.new_password"
          type="password"
          aria-label="Kata sandi baru"
          required
          class="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label for="profile-confirm-password" class="block text-sm font-semibold text-slate-700 mb-1">Konfirmasi Kata Sandi Baru</label>
        <input
          id="profile-confirm-password"
          v-model="pw.new_password_confirmation"
          type="password"
          aria-label="Konfirmasi kata sandi baru"
          required
          class="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <button
        type="submit"
        aria-label="Ubah kata sandi"
        class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Ubah Kata Sandi
      </button>
    </form>
  </section>
</template>
