import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, register, logout, type LoginPayload, type RegisterPayload } from '../api/authApi'
import { getAccessToken, putAccessToken, removeAccessToken } from '../../../helpers/apiHelper'

export interface AuthUser {
  id: number
  name: string
  email: string
  photo?: string | null
  [key: string]: any
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(getAccessToken())
  const user = ref<AuthUser | null>(null)
  const isAuthLogin = ref<boolean>(false)
  const isAuthRegister = ref<boolean>(false)
  const isAuthLogout = ref<boolean>(false)
  const isLoading = ref<boolean>(false)
  const isLoadingLogin = ref<boolean>(false)
  const isLoadingRegister = ref<boolean>(false)
  const isLoadingLogout = ref<boolean>(false)

  async function asyncLogin(payload: LoginPayload) {
    isLoadingLogin.value = true
    isLoading.value = true
    try {
      const res: any = await login(payload)
      const success = Boolean(res?.success || res?.status === 'success')
      isAuthLogin.value = success
      if (success) {
        const authToken = res?.data?.token
        token.value = authToken
        if (authToken) {
          putAccessToken(authToken)
        }
        if (res?.data?.user) {
          user.value = res.data.user
        }
      }
      isLoadingLogin.value = false
      isLoading.value = false
      return res
    } catch (err: any) {
      isAuthLogin.value = false
      isLoadingLogin.value = false
      isLoading.value = false
      const message = err?.message ? err.message : 'Login gagal'
      return { success: false, message }
    }
  }

  async function asyncRegister(payload: RegisterPayload) {
    isLoadingRegister.value = true
    isLoading.value = true
    try {
      const res: any = await register(payload)
      const success = Boolean(res?.success || res?.status === 'success')
      isAuthRegister.value = success
      isLoadingRegister.value = false
      isLoading.value = false
      return res
    } catch (err: any) {
      isAuthRegister.value = false
      isLoadingRegister.value = false
      isLoading.value = false
      const message = err?.message ? err.message : 'Registrasi gagal'
      return { success: false, message }
    }
  }

  async function asyncLogout() {
    isLoadingLogout.value = true
    isLoading.value = true
    try {
      await logout()
    } catch {
      // Ignore logout error to ensure local session is cleared
    }
    removeAccessToken()
    token.value = null
    user.value = null
    isAuthLogin.value = false
    isAuthLogout.value = true
    isLoadingLogout.value = false
    isLoading.value = false
  }

  return {
    token,
    user,
    isAuthLogin,
    isAuthRegister,
    isAuthLogout,
    isLoading,
    isLoadingLogin,
    isLoadingRegister,
    isLoadingLogout,
    asyncLogin,
    asyncRegister,
    asyncLogout,
    loginUser: asyncLogin,
    registerUser: asyncRegister,
    logoutUser: asyncLogout,
  }
})
