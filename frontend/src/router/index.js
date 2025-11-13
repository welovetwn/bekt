// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';
import GeneratorSetup from '@/views/GeneratorSetup.vue';
import SystemPreview from '@/views/SystemPreview.vue';
import Login from '@/views/auth/Login.vue';

// 動態載入所有 *Routes.js (大寫開頭)
const modules = import.meta.glob('./[A-Z]*Routes.js', { eager: true });
const generatedRoutes = Object.values(modules)
  .flatMap(m => Object.values(m).filter(Array.isArray))
  .flat();

const defaultRouteName = generatedRoutes.find(r => r.name?.endsWith('List'))?.name || null;

const routes = [
  // **[核心修正 1]** 標記 Login 頁面為公共頁面 (isPublic: true)
  { path: '/login', name: 'Login', component: Login, meta: { isPublic: true } }, 
  {
    path: '/',
    component: MainLayout,
    // **[修正 2]** 標記所有 MainLayout 的子路徑都需要驗證
    meta: { requiresAuth: true }, 
    children: [
      { path: '', name: 'GeneratorSetup', component: GeneratorSetup },
      {
        path: 'preview',
        // **[修正 3]** 移除父路由的 name (解決警告)，並移除重複的 requiresAuth (繼承自父層)
        component: SystemPreview,
        children: [
          ...generatedRoutes,
          // **[修正 4]** 將 SystemPreview 名稱賦予給處理空路徑的子路由 (解決 No match 錯誤)
          ...(defaultRouteName 
             ? [{ path: '', name: 'SystemPreview', redirect: { name: defaultRouteName } }]
             : [{ path: '', name: 'SystemPreview', component: SystemPreview }]
          )
        ]
      }
    ]
  }
];

const router = createRouter({ history: createWebHistory(), routes });


// ✅ 登入守衛 (核心修正邏輯：解決無限重定向)
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('jwt_token');

  // 檢查路由記錄 (matched records) 中是否有任何一項標註為 requiresAuth (來自父層 / 或 /preview)
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  // 檢查路由記錄中是否有任何一項標註為 isPublic (來自 /login)
  const isPublic = to.matched.some(record => record.meta.isPublic);

  // 1. 處理未登入狀態 (進入無限迴圈的根源)
  if (!isAuthenticated && requiresAuth && !isPublic) {
    // 條件：未登入 AND 訪問受保護路徑 AND 訪問的路徑不是公共頁面 (/login)
    // **這個邏輯確保當導航目標是 /login 時，!isPublic 為 false，條件不成立，從而終止迴圈**
    return next({ name: 'Login' });
  }

  // 2. 處理已登入狀態
  if (isAuthenticated && isPublic) {
    // 已登入，但嘗試訪問 Login 頁面，導向主頁
    return next({ name: 'GeneratorSetup' }); 
  }

  // 3. 允許所有其他導航 (已登入訪問受保護頁面，或未登入訪問公共頁面)
  next();
});


export default router;