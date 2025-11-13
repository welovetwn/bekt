// src/services/apiClient.js

import axios from 'axios';

// **[修正 1]**：將 baseURL 的計算移到 axios.create 呼叫的外部
const baseURL = import.meta.env.VITE_API_URL + '/api/';

const apiClient = axios.create({
    // **[修正 2]**：使用正確的鍵值對語法來設定 baseURL
    baseURL: baseURL, 
    withCredentials: true 
});

// 攔截器邏輯保持不變，用於夾帶 JWT Token
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('jwt_token'); 
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; 
    }
    return config;
});
 
export default apiClient;