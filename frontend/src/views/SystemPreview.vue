// src/views/SystemPreview.vue
<template>
  <div class="flex">
    <aside class="w-64 bg-gray-800 text-white min-h-screen p-4 rounded-l-lg">
      <h3 class="text-lg font-bold mb-4 border-b border-gray-700 pb-2">預覽選單</h3>
      <nav class="space-y-2">
        <router-link
          v-for="menuItem in generatedMenuItems"
          :key="menuItem.name"
          :to="{ name: menuItem.name }"
          class="block py-2 px-3 rounded-md hover:bg-indigo-600 transition"
        >
          {{ menuItem.icon }} {{ menuItem.label }}
        </router-link>
        <router-link :to="{ name: 'GeneratorSetup' }" class="block py-2 px-3 rounded-md bg-red-700 hover:bg-red-600 transition mt-4">
          ↩️ 返回設定
        </router-link>
      </nav>
    </aside>

    <div class="flex-grow bg-white p-6 rounded-r-lg shadow-lg">
      <h2 class="text-2xl font-bold mb-4 border-b pb-2">
        預覽內容區
      </h2>
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

// **[核心修正 2]**：新增邏輯來動態獲取和篩選路由

const router = useRouter();

// 計算屬性：篩選出所有已生成的 List 頁面路由
const generatedMenuItems = computed(() => {
  // 1. 取得所有已註冊的路由 (包含動態載入的 ProductRoutes, UserRoutes 等)
  const allRoutes = router.getRoutes();
  
  // 2. 篩選出名稱以 'List' 結尾的路由 (例如: ProductList, UserList)
  const previewRoutes = allRoutes.filter(route => 
    // 檢查路由名稱是否存在且以 'List' 結尾
    route.name && route.name.toString().endsWith('List')
  );

  // 3. 將路由轉換為選單所需的格式
  return previewRoutes.map(route => {
    // 獲取路由名稱，例如 'ProductList'
    const routeName = route.name.toString();
    // 從路由名稱中提取實體名稱 (e.g., 'ProductList' -> 'Product')
    const entityName = routeName.replace('List', ''); 
    
    // 建立通用標籤和圖示
    let label = entityName;
    let icon = '📦';

    // 您可以在這裡擴展一個映射表，以提供更友好的中文標籤
    const labelMap = {
        'Product': '產品管理',
        'User': '用戶管理',
        'Role': '角色管理',
    };

    if (labelMap[entityName]) {
        label = labelMap[entityName];
    }

    return {
      name: routeName, // 例如 ProductList
      label: label,
      icon: icon
    };
  }).sort((a, b) => a.label.localeCompare(b.label)); // 依名稱排序
});
</script>