// src/layouts/MainLayout.vue
<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <header class="bg-indigo-600 shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <router-link :to="{ name: 'GeneratorSetup' }" class="text-xl font-bold text-white hover:text-indigo-200">
          🛠️ Code Generator
        </router-link>
        <nav class="flex items-center">
          <router-link :to="{ name: 'GeneratorSetup' }" 
                       class="text-white mx-3 hover:text-indigo-200 transition">
            設定
          </router-link>
          <router-link :to="{ name: 'SystemPreview' }" 
                       class="text-white mx-3 hover:text-indigo-200 transition">
            預覽
          </router-link>
          
          <button @click="handleLogout"
                  class="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 transition ml-4">
            登出
          </button>
        </nav>
      </div>
    </header>

	<main class="flex-grow w-full px-4 sm:px-6 lg:px-8 py-6">
	  <slot>
		<router-view />
	  </slot>
	</main>
    
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
    // 1. 呼叫 Store 內的登出函數，清除 JWT 和狀態
    authStore.logout()
    
    // 2. 導航到登入頁面 (Login)，使用 replace 避免用戶按後退鍵回到受保護頁面
    router.replace({ name: 'Login' })
}
</script>