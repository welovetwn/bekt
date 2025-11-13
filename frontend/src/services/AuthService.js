// src/services/AuthService.js

// 確保引入了配置好的 axios 實例
import axios from '@/axios'; 

const API_URL = '/Auth/';

class AuthService {
    /**
     * 嘗試登入，成功則儲存 Token 並設定 axios 標頭
     * @param {string} username
     * @param {string} password
     * @returns {Promise<any>}
     */
    async login(username, password) {
        try {
            // 假設後端登入 API 位於 /api/Auth/login
            const response = await axios.post(API_URL + 'login', { username, password });
            
            // **修改重點：儲存 Token 並設定預設標頭**
            if (response.data.token) {
                // 將 JWT Token 存入 localStorage
                localStorage.setItem('userToken', response.data.token);
                
                // 設定 axios 實例的預設授權標頭
                this.setAuthHeader(response.data.token); 
            }

            return response.data; // 回傳包含 Token 的 JwtResponse
        } catch (error) {
            console.error('Login failed:', error);
            // 拋出錯誤讓上層處理
            throw error; 
        }
    }

    /**
     * 清除本地 Token 並移除 axios 預設標頭
     */
    logout() {
        localStorage.removeItem('userToken');
        // 清除 axios 實例上的預設標頭
        this.removeAuthHeader(); 
    }

    /**
     * 取得本地儲存的 Token
     * @returns {string | null}
     */
    getCurrentToken() {
        return localStorage.getItem('userToken');
    }

    /**
     * 設定 axios 實例的預設授權標頭
     * @param {string} token
     */
    setAuthHeader(token) {
        // 設定所有 axios 請求的預設授權標頭
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    /**
     * 移除 axios 實例的預設授權標頭
     */
    removeAuthHeader() {
        delete axios.defaults.headers.common['Authorization'];
    }
}

// **新增邏輯：應用程式啟動時檢查 Token**
// 確保在應用程式重載後，如果 localStorage 裡有 Token，仍能自動設定標頭
const authService = new AuthService();
const initialToken = authService.getCurrentToken();
if (initialToken) {
    authService.setAuthHeader(initialToken);
}

export default authService;