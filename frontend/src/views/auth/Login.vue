<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-lg shadow-lg p-8">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-grocy-cyan">Grocy</h1>
          <p class="text-gray-600 mt-2">家用庫存管理系統</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">使用者名稱</label>
            <input
              v-model="form.username"
              type="text"
              required
              class="input-field"
              placeholder="輸入使用者名稱"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">密碼</label>
            <input
              v-model="form.password"
              type="password"
              required
              class="input-field"
              placeholder="輸入密碼"
            />
          </div>

          <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full btn-primary py-3 text-lg"
          >
            {{ loading ? '登入中...' : '登入' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'   // ← 加入 useRoute
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()                     // ← 新增：取得 query 參數
const authStore = useAuthStore()

const form = ref({ username: '', password: '' })
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  authStore.error = null

  try {
    const success = await authStore.login(form.value.username, form.value.password)
    
    if (success) {
      // 登入成功：支援 redirect 回原本想去的頁面
      const redirectPath = route.query.redirect as string || { name: 'GeneratorSetup' }
      
      // 使用 replace 避免登入頁殘留在 history
      router.replace(typeof redirectPath === 'string' ? redirectPath : redirectPath)
    } else {
      error.value = authStore.error || '登入失敗，請檢查帳號密碼。'
    }
  } catch (err) {
    console.error("Login 組件發生未預期錯誤:", err);
    error.value = '連線錯誤，請檢查後端服務是否啟動。'
  } finally {
    loading.value = false
  }
}
</script>