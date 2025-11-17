// src/stores/authStore.ts

import { defineStore } from 'pinia'
import { ref } from 'vue'
// 引入統一的 apiClient
import apiClient from '@/services/apiClient' 
// 引入 AuthService (選用，若您希望邏輯集中在 Service 層，也可以在這裡呼叫 AuthService.login)
// 但為了保持您原本的 Store 結構，我們直接使用 apiClient

// 定義 User 介面 (根據您的 UserDto)
interface User {
  id: number;
  username: string;
  displayName: string;
  roleId: number;
  roleName: string;
  isActive: boolean;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const error = ref<string | null>(null)

  // 初始化：檢查 localStorage 是否有 Token
  const init = () => {
    const storedUser = localStorage.getItem('user')
    // 統一從 'jwt_token' 讀取
    const authToken = localStorage.getItem('jwt_token') 

    if (storedUser && authToken) {
      try {
        user.value = JSON.parse(storedUser)
        isAuthenticated.value = true
      } catch (e) {
        console.error('解析 User 資料失敗', e)
        logout()
      }
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    error.value = null;
    try {
      // 使用 apiClient，路徑相對於 baseURL (/api/)
      const response = await apiClient.post('Auth/login', { username, password });
      
      // 處理登入成功邏輯
      if (response.data && response.data.token) {
        const token = response.data.token;
        const userPayload = response.data.user; 

        // 儲存 Token 與 User 資訊 (統一 Key)
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('user', JSON.stringify(userPayload));
        
        user.value = userPayload
        isAuthenticated.value = true
        return true
      }

      error.value = '登入失敗：後端未返回 Token';
      return false;
      
    } catch (err: any) {
      console.error('Login 請求失敗:', err);
      
      if (err.response) {
        // 處理 HTTP 錯誤回應
        const status = err.response.status;
        if (status === 401) {
          error.value = '帳號或密碼錯誤';
        } else if (status === 500) {
          error.value = '伺服器錯誤，請稍後再試';
        } else {
          error.value = `登入失敗 (${status})`;
        }
      } else if (err.request) {
        error.value = '無法連線到伺服器，請檢查網路或後端狀態';
      } else {
        error.value = '發生未預期的錯誤';
      }
      
      return false;
    }
  }

  const logout = () => {
    // 清除所有相關資料
    localStorage.removeItem('jwt_token') 
    localStorage.removeItem('user')
    user.value = null
    isAuthenticated.value = false
  }

  return { user, isAuthenticated, error, init, login, logout }
})