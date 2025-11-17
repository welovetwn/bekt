// src/services/AuthService.js

// 引入統一的 apiClient
import apiClient from '@/services/apiClient';

const API_URL = 'Auth/'; // 相對路徑，apiClient 已設定 baseURL 為 /api/

class AuthService {
    /**
     * 嘗試登入
     * @param {string} username
     * @param {string} password
     * @returns {Promise<any>}
     */
    async login(username, password) {
        try {
            // 使用 apiClient 發送請求
            const response = await apiClient.post(API_URL + 'login', { username, password });
            
            if (response.data.token) {
                // 統一使用 'jwt_token'
                localStorage.setItem('jwt_token', response.data.token);
                // 注意：不再需要手動呼叫 setAuthHeader，攔截器會處理
            }

            return response.data;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    /**
     * 登出：清除本地 Token
     */
    logout() {
        // 統一 Key
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user');
    }

    /**
     * 取得本地儲存的 Token
     * @returns {string | null}
     */
    getCurrentToken() {
        return localStorage.getItem('jwt_token');
    }
    
    // 移除 setAuthHeader 與 removeAuthHeader 方法，
    // 因為 apiClient 的 interceptors 已經動態處理了 Authorization header
}

export default new AuthService();