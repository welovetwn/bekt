// src/services/apiClient.js

import axios from 'axios';

// 確保 baseURL 邏輯正確，從環境變數讀取
// 若 .env 未設定，預設回退到 localhost:5001 (或根據需求調整)
const baseURL = (import.meta.env.VITE_API_URL || 'https://localhost:5001') + '/api/';

const apiClient = axios.create({
    baseURL: baseURL,
    withCredentials: true, // 允許跨域傳遞 Cookie (如果後端需要)
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// 請求攔截器：自動夾帶 JWT Token
apiClient.interceptors.request.use(config => {
    // 統一使用 'jwt_token' 作為 Key
    const token = localStorage.getItem('jwt_token'); 
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; 
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// 回應攔截器：可在此統一處理 401/403 錯誤 (例如自動登出)
apiClient.interceptors.response.use(response => {
    return response;
}, error => {
    if (error.response && error.response.status === 401) {
        // 可以在這裡處理 Token 過期的邏輯，例如清除 localStorage 並導向登入頁
        // console.warn('Token expired or unauthorized');
    }
    return Promise.reject(error);
});

export default apiClient;