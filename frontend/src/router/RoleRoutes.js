// src/router/roleRoutes.js
export const roleRoutes = [
  { path: 'roles', name: 'RoleList', component: () => import('@/views/role/RoleList.vue') },
  { path: 'roles/create', name: 'RoleCreate', component: () => import('@/views/role/RoleForm.vue') },
  { path: 'roles/:id/edit', name: 'RoleEdit', component: () => import('@/views/role/RoleForm.vue') },
];
