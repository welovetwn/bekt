// src/router/userRoutes.js
export const userRoutes = [
  { path: 'users', name: 'UserList', component: () => import('@/views/user/UserList.vue') },
  { path: 'users/create', name: 'UserCreate', component: () => import('@/views/user/UserForm.vue') },
  { path: 'users/:id/edit', name: 'UserEdit', component: () => import('@/views/user/UserForm.vue') },
];
