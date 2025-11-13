// src/axios.js

import axios from 'axios';

const instance = axios.create({
    // **[關鍵修正]** 必須確保 baseURL 與後端啟動的根路徑完全一致
    // 預設後端為 https://localhost:5001，且 API 位於 /api/
    baseURL: 'https://localhost:5001/api/', 
    
    // 為了安全起見，通常在本地開發時，將 withCredentials 設為 true
    withCredentials: true 
});

// 攔截器 (Interceptor) 邏輯保持不變 (用於夾帶 JWT Token)
instance.interceptors.request.use(config => {
    const token = localStorage.getItem('jwt_token'); 
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; 
    }
    return config;
});
 
export default instance;