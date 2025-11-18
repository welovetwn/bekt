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
  // 登入頁為公開頁面
  { path: '/login', name: 'Login', component: Login, meta: { isPublic: true } }, 
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true }, 
    children: [
      { path: '', name: 'GeneratorSetup', component: GeneratorSetup },
      {
        path: 'preview',
        component: SystemPreview,
        children: [
          ...generatedRoutes,
          ...(defaultRouteName 
             ? [{ path: '', name: 'SystemPreview', redirect: { name: defaultRouteName } }]
             : [{ path: '', name: 'SystemPreview', component: SystemPreview }]
          )
        ]
      }
    ]
  }
];

const router = createRouter({ 
  history: createWebHistory(), 
  routes 
});

// 最終安全版路由守衛（已實測無任何迴圈）
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('jwt_token');
  const isAuthenticated = !!token;

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isPublic = to.matched.some(record => record.meta.isPublic);

  // 情況1：未登入 + 要去需要驗證的頁面 → 導向登入（帶 redirect）
  if (!isAuthenticated && requiresAuth && !isPublic) {
    return next({
      name: 'Login',
      query: { redirect: to.fullPath }   // 登入後回原頁
    });
  }

  // 情況2：已登入卻想去登入頁 → 直接導回首頁
  if (isAuthenticated && to.name === 'Login') {
    return next({ name: 'GeneratorSetup' });
  }

  // 其他所有情況直接放行
  next();
});

export default router;