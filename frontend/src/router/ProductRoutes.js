// src/router/productRoutes.js
export const productRoutes = [
  { path: 'products', name: 'ProductList', component: () => import('@/views/product/ProductList.vue') },
  { path: 'products/create', name: 'ProductCreate', component: () => import('@/views/product/ProductForm.vue') },
  { path: 'products/:id/edit', name: 'ProductEdit', component: () => import('@/views/product/ProductForm.vue') },
];
