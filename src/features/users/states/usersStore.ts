import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '../api/userApi'

export const useUsersStore = defineStore('users', () => {
  const users = ref<api.User[]>([])
  const profile = ref<api.User | null>(null)
  const user = ref<api.User | null>(null)

  const isLoading = ref<boolean>(false)
  const isLoadingUsers = ref<boolean>(false)
  const isLoadingProfile = ref<boolean>(false)
  const isProfileUpdated = ref<boolean>(false)
  const isPhotoUploaded = ref<boolean>(false)
  const isPasswordChanged = ref<boolean>(false)

  async function asyncGetUsers() {
    isLoadingUsers.value = true
    isLoading.value = true
    try {
      const res: any = await api.getUsers()
      if (res?.success || res?.status === 'success') {
        users.value = res?.data?.users || []
      }
      return res
    } finally {
      isLoadingUsers.value = false
      isLoading.value = false
    }
  }

  async function asyncGetMe() {
    isLoadingProfile.value = true
    isLoading.value = true
    try {
      const res: any = await api.getMe()
      if (res?.success || res?.status === 'success') {
        const u = res?.data?.user || null
        profile.value = u
        user.value = u
      }
      return res
    } finally {
      isLoadingProfile.value = false
      isLoading.value = false
    }
  }

  async function asyncUpdateProfile(payload: api.UpdateProfilePayload) {
    isLoading.value = true
    isProfileUpdated.value = false
    try {
      const res: any = await api.updateMe(payload)
      if (res?.success || res?.status === 'success') {
        isProfileUpdated.value = true
        await asyncGetMe()
      }
      return res
    } finally {
      isLoading.value = false
    }
  }

  async function asyncUploadPhoto(file: File) {
    isLoading.value = true
    isPhotoUploaded.value = false
    try {
      const res: any = await api.uploadPhoto(file)
      if (res?.success || res?.status === 'success') {
        isPhotoUploaded.value = true
        await asyncGetMe()
      }
      return res
    } finally {
      isLoading.value = false
    }
  }

  async function asyncChangePassword(payload: api.ChangePasswordPayload) {
    isLoading.value = true
    isPasswordChanged.value = false
    try {
      const res: any = await api.changePassword(payload)
      if (res?.success || res?.status === 'success') {
        isPasswordChanged.value = true
      }
      return res
    } finally {
      isLoading.value = false
    }
  }

  return {
    users,
    profile,
    user,
    isLoading,
    isLoadingUsers,
    isLoadingProfile,
    isProfileUpdated,
    isPhotoUploaded,
    isPasswordChanged,
    asyncGetUsers,
    asyncGetMe,
    asyncGetProfile: asyncGetMe,
    asyncUpdateProfile,
    asyncUploadPhoto,
    asyncChangePassword,
    loadUsers: asyncGetUsers,
    loadProfile: asyncGetMe,
    saveProfile: asyncUpdateProfile,
    savePhoto: asyncUploadPhoto,
    savePassword: asyncChangePassword,
  }
})
