<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useInput } from '../../../hooks/useInput'
import { useAuthStore } from '../states/authStore'
import { showErrorDialog, showSuccessDialog } from '../../../helpers/toolsHelper'

const router = useRouter()
const auth = useAuthStore()
const { value: email, onInput: onEmail } = useInput()
const { value: password, onInput: onPassword } = useInput()

async function submit() {
  if (!email.value.trim() || !password.value.trim()) {
    showErrorDialog('Validasi Gagal', 'Semua kolom wajib diisi')
    return
  }

  const res = await auth.asyncLogin({
    email: email.value.trim(),
    password: password.value,
  })

  if (res.success || res.status === 'success') {
    showSuccessDialog('Berhasil', res.message || 'Login berhasil')
    router.push('/')
  } else {
    showErrorDialog('Gagal', res.message || 'Email atau kata sandi tidak valid')
  }
}
</script>

<template>
  <form class="space-y-4" novalidate @submit.prevent="submit">
    <div>
      <h2 class="text-xl font-bold text-slate-900">Masuk ke Akun Anda</h2>
      <p class="text-xs text-slate-500 mt-1">Masukkan kredensial Anda untuk melanjutkan</p>
    </div>

    <div>
      <label for="login-email-input" class="block text-sm font-semibold text-slate-700 mb-1">Email</label>
      <input
        id="login-email-input"
        type="email"
        aria-label="Email"
        placeholder="nama@email.com"
        required
        :value="email"
        @input="onEmail"
        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
      />
    </div>

    <div>
      <label for="login-password-input" class="block text-sm font-semibold text-slate-700 mb-1">Kata Sandi</label>
      <input
        id="login-password-input"
        type="password"
        aria-label="Kata Sandi"
        placeholder="••••••••"
        required
        :value="password"
        @input="onPassword"
        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
      />
    </div>

    <button
      id="login-submit-button"
      type="submit"
      :disabled="auth.isLoadingLogin"
      class="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
    >
      {{ auth.isLoadingLogin ? 'Memproses...' : 'Masuk' }}
    </button>

    <p class="text-center text-sm text-slate-600">
      Belum punya akun?
      <RouterLink to="/auth/register" class="font-semibold text-blue-600 hover:underline">
        Daftar Sekarang
      </RouterLink>
    </p>
  </form>
</template>
