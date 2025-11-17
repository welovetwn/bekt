<template>
  <div class="flex min-h-screen bg-gray-50">
    <aside 
      :class="[
        'bg-gray-800 text-white min-h-screen flex flex-col transition-all duration-300 ease-in-out shadow-xl z-10',
        isSidebarOpen ? 'w-64' : 'w-20'
      ]"
    >
      <div class="h-16 flex items-center justify-between px-4 border-b border-gray-700">
        <h3 
          v-show="isSidebarOpen" 
          class="text-lg font-bold whitespace-nowrap overflow-hidden transition-opacity duration-200"
        >
          預覽選單
        </h3>
        
        <button 
          @click="toggleSidebar"
          class="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition focus:outline-none"
          :class="{ 'mx-auto': !isSidebarOpen }"
          title="切換選單"
        >
          <svg v-if="isSidebarOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <nav class="flex-1 overflow-y-auto py-4 space-y-2 px-3">
        <router-link
          v-for="menuItem in generatedMenuItems"
          :key="menuItem.name"
          :to="{ name: menuItem.name }"
          class="flex items-center py-3 px-3 rounded-md hover:bg-indigo-600 transition group relative"
          :class="{ 'justify-center': !isSidebarOpen }"
          :title="!isSidebarOpen ? menuItem.label : ''"
        >
          <span class="text-xl flex-shrink-0">{{ menuItem.icon }}</span>
          
          <span 
            v-show="isSidebarOpen" 
            class="ml-3 whitespace-nowrap overflow-hidden transition-opacity duration-200"
          >
            {{ menuItem.label }}
          </span>

          <div 
            v-if="!isSidebarOpen"
            class="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition z-50 whitespace-nowrap"
          >
            {{ menuItem.label }}
          </div>
        </router-link>
      </nav>

      <div class="p-4 border-t border-gray-700">
        <router-link 
          :to="{ name: 'GeneratorSetup' }" 
          class="flex items-center py-2 px-3 rounded-md bg-red-700 hover:bg-red-600 transition text-white"
          :class="{ 'justify-center': !isSidebarOpen }"
          title="返回設定"
        >
          <span class="text-xl flex-shrink-0">↩️</span>
          <span v-show="isSidebarOpen" class="ml-3 whitespace-nowrap overflow-hidden">返回設定</span>
        </router-link>
      </div>
    </aside>

    <div class="flex-grow bg-gray-100 p-6 overflow-auto h-screen w-full">
      <div class="bg-white rounded-lg shadow-lg min-h-[calc(100vh-3rem)] p-6">
        <h2 class="text-2xl font-bold mb-6 border-b pb-4 text-gray-800">
          預覽內容區
        </h2>
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'; // 加入 ref
import { useRouter } from 'vue-router';

const router = useRouter();

// **[新增]** 控制側邊欄展開/收合的狀態
const isSidebarOpen = ref(true);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

// 計算屬性：篩選出所有已生成的 List 頁面路由 (邏輯保持不變)
const generatedMenuItems = computed(() => {
  const allRoutes = router.getRoutes();
  
  const previewRoutes = allRoutes.filter(route => 
    route.name && route.name.toString().endsWith('List')
  );

  return previewRoutes.map(route => {
    const routeName = route.name.toString();
    const entityName = routeName.replace('List', ''); 
    
    let label = entityName;
    let icon = '📦';

    const labelMap = {
        'Product': '產品管理',
        'User': '用戶管理',
        'Role': '角色管理',
    };

    if (labelMap[entityName]) {
        label = labelMap[entityName];
    }

    return {
      name: routeName,
      label: label,
      icon: icon
    };
  }).sort((a, b) => a.label.localeCompare(b.label));
});
</script>