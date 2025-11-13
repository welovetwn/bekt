// src/stores/authStore.ts

import { defineStore } from 'pinia'
import { ref } from 'vue'
// ===============================================
// **[修正 1]**：移除舊的、不正確的匯入 (apiService)，並加入正確的 apiClient 匯入
import apiClient from '@/services/apiClient' 
// ===============================================

import type { User } from '@/types'
// **[修正 2]**：RESOURCE_URL 不再需要，因為 apiClient.post 中會定義路徑
// const RESOURCE_URL = '/api/Auth/login'; 

const MOCK_USER: User = {
  id: 1,
  username: 'test',
  displayName: '系統管理員',
  roleId: 1,
  roleName: 'Admin',
  isActive: true
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const error = ref<string | null>(null)

  const init = () => {
    const storedUser = localStorage.getItem('user')
    // =============================================
    // **[修改重點 1]** 從 'jwt_token' 讀取
    // =============================================
    const authToken = localStorage.getItem('jwt_token') 

    if (storedUser && authToken) {
      user.value = JSON.parse(storedUser)
      isAuthenticated.value = true
    }
  }

    const login = async (username: string, password: string): Promise<boolean> => {
        error.value = null;
        console.log('--- 1. 準備發送登入請求 ---'); 
        try {
            console.log('--- 2. 進入 Try 區塊 ---'); 

            // **[修正 3]**：移除冗餘的 apiClient 檢查，因為它現在已經被匯入了
            // if (!apiClient) {
            //     console.error("apiClient 實例未正確初始化！");
            //     error.value = '系統初始化錯誤：API 連線服務遺失。';
            //     return false;
            // }

            // 確保您的 .env.development 已經修正為 http://localhost:5000
            // 且 apiClient.js 中 baseURL 為 http://localhost:5000/api/
            
            const response = await apiClient.post('Auth/login', { username, password });
            
            console.log('--- 3. 成功收到 API 回應 ---'); 
            
            // 處理登入成功邏輯：
            if (response.data.token) {
                const token = response.data.token;
                const userPayload = response.data.user; 

                localStorage.setItem('jwt_token', token);
                localStorage.setItem('user', JSON.stringify(userPayload));
                
                user.value = userPayload
                isAuthenticated.value = true
                return true
            }

            error.value = '登入失敗：後端未返回 Token';
            return false;
            
        } catch (err) {
            // **[關鍵]** 顯示錯誤的詳細訊息，而不是通用的訊息
            console.error('Login 請求失敗！原始錯誤物件:', err); 

            if (err.response) {
                // 處理 4xx, 5xx 錯誤
                const status = err.response.status;
                
                if (status === 401) {
                    error.value = err.response.data.detail || err.response.data.title || '帳號或密碼錯誤 (401)';
                } else if (status === 500) {
                    error.value = `伺服器錯誤 (500)：請檢查後端日誌。`;
                } else {
                    error.value = `登入失敗：錯誤碼 ${status}。`;
                }
            } else if (err.request) {
                // 請求發出但未收到響應 (網路或連線問題)
                error.value = '連線失敗：請檢查後端服務是否啟動或連線設置。';
            } else {
                // 程式內部同步錯誤
                error.value = `程式內部錯誤：登入請求未發出。詳情請見 Console。`;
            }
            
            return false;
        }
    }

  const logout = () => {
    // ... (登出邏輯保持不變)
    localStorage.removeItem('jwt_token') 
    localStorage.removeItem('user')
    user.value = null
    isAuthenticated.value = false
  }

  return { user, isAuthenticated, error, init, login, logout }
})