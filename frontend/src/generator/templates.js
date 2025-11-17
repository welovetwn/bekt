// src/generator/templates.js

// ----------------------------------------------------
// 輔助函式
// ----------------------------------------------------
const escapeJsString = (str) => {
    if (typeof str !== 'string') {
        if (str === 0 || str === false) return str;
        return '';
    }
    return str
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
};

function toLabel(str) {
  const label = str.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
  return escapeJsString(label);
}

function defaultValue(type) {
  return type === 'number' ? '0' : "''";
}

// ----------------------------------------------------
// 版型類型定義
// ----------------------------------------------------
export const TEMPLATE_TYPES = {
  SIMPLE_LIST: 'simple-list',       // 簡單列表
  CARD_GRID: 'card-grid',          // 卡片網格
  MASTER_DETAIL: 'master-detail',  // ⭐ 主從表單 (真正的訂單結構)
  KANBAN: 'kanban',                // 🆕 看板
  TIMELINE: 'timeline'             // 🆕 時間軸
};

// ----------------------------------------------------
// Schema, Service, Store 保持不變
// ----------------------------------------------------
export const TEMPLATES = {
  schema: (e) => {
    const tableColumns = Object.entries(e.properties)
      .filter(([k]) => !['createdAt', 'updatedAt'].includes(k))
      .map(([k, p]) => {
        return `{ key: '${k}', label: '${toLabel(k)}', displayName: '${escapeJsString(p.displayName)}', isSortable: true }`;
      })
      .join(',\n  ');

    // ⭐ 新增：添加操作欄位定義
    const tableColumnsWithActions = tableColumns + ',\n  { key: \'actions\', label: \'操作\', displayName: \'操作\', isSortable: false }';

    const formFields = Object.entries(e.properties)
      .filter(([k]) => k !== 'id' && !['createdAt', 'updatedAt'].includes(k))
      .map(([k, p]) => {
        const type = p.type === 'number' ? 'number' : p.type === 'date' ? 'date' : 'text';
        return `{ key: '${k}', label: '${toLabel(k)}', displayName: '${escapeJsString(p.displayName)}', type: '${type}', validation: { required: ${p.required} } }`;
      })
      .join(',\n  ');

    const initialForm = Object.keys(e.properties)
      .filter(k => k !== 'id')
      .map(k => `${k}: ${defaultValue(e.properties[k].type)},`)
      .join('\n  ');

    return `// src/schema/${e.lowerName}Schema.js
export const ${e.lowerName}TableColumns = [
  ${tableColumns}
];

export const ${e.lowerName}FormFields = [
  { key: 'id', type: 'hidden' },
  ${formFields}
];

export const initial${e.name}Form = {
  ${initialForm}
};
`;
  },

  service: (e) => `// src/services/${e.lowerName}Service.js
import apiClient from '@/services/apiClient';
const RESOURCE_URL = '${e.apiPath.replace('/api', '')}';
export const ${e.lowerName}Service = {
  getAll: (params = {}) => apiClient.get(RESOURCE_URL, { params }),
  getById: (id) => apiClient.get(\`\${RESOURCE_URL}/\${id}\`),
  create: (data) => apiClient.post(RESOURCE_URL, data),
  update: (id, data) => apiClient.put(\`\${RESOURCE_URL}/\${id}\`, data),
  remove: (id) => apiClient.delete(\`\${RESOURCE_URL}/\${id}\`),
};
`,

  store: (e) => `// src/stores/${e.lowerName}Store.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ${e.lowerName}Service } from '@/services/${e.lowerName}Service';
import { initial${e.name}Form } from '@/schema/${e.lowerName}Schema';

export const use${e.name}Store = defineStore('${e.lowerName}', () => {
  const items = ref([]);
  const current = ref({ ...initial${e.name}Form });
  const loading = ref(false);

  const fetchAll = async () => {
    loading.value = true;
    try {
      const res = await ${e.lowerName}Service.getAll();
      items.value = res.data;
    } finally {
      loading.value = false;
    }
  };

  const fetchOne = async (id) => {
    const res = await ${e.lowerName}Service.getById(id);
    current.value = res.data;
  };

  const save = async (data) => {
    if (data.id) {
      await ${e.lowerName}Service.update(data.id, data);
    } else {
      await ${e.lowerName}Service.create(data);
    }
  };

  const remove = async (id) => {
    await ${e.lowerName}Service.remove(id);
  };

  const reset = () => current.value = { ...initial${e.name}Form };

  return { items, current, loading, fetchAll, fetchOne, save, remove, reset };
});
`,

	// ============================================================
	// 版型 1: 簡單列表 (傳統表格) - ✅ 完全移除組件依賴
	// ============================================================
	simpleListVue: (e) => {
	  // 動態生成表頭欄位
	  const tableHeaders = Object.entries(e.properties)
		.filter(([k]) => !['id', 'createdAt', 'updatedAt'].includes(k))
		.slice(0, 4)
		.map(([k, p]) => `            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
				  ${p.displayName}
				</th>`)
		.join('\n');

	  // 動態生成表格數據欄位
	  const tableColumns = Object.keys(e.properties)
		.filter(k => !['id', 'createdAt', 'updatedAt'].includes(k))
		.slice(0, 4)
		.map(k => `            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
				  {{ item.${k} }}
				</td>`)
		.join('\n');

	  return `<template>
	  <div class="max-w-7xl mx-auto p-6">
		<!-- 標題區：與其他版型一致 -->
		<header class="bg-white rounded-xl shadow-sm p-6 mb-6">
		  <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
			<div>
			  <h1 class="text-3xl font-bold text-gray-800">${e.name} 管理</h1>
			  <p class="text-gray-600 mt-1">共 {{ store.items.length }} 筆資料</p>
			</div>
			<button @click="$router.push({ name: '${e.name}Create' })"
			  class="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium flex items-center gap-2 transition-all">
			  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
			  </svg>
			  新增
			</button>
		  </div>
		</header>

		<!-- 表格區：完整的 Tailwind 樣式 -->
		<div class="bg-white rounded-xl shadow-sm overflow-hidden">
		  <!-- 載入狀態 -->
		  <div v-if="store.loading" class="p-8 text-center">
			<div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
			<p class="mt-2 text-gray-600">載入中...</p>
		  </div>

		  <!-- 資料表格 -->
		  <table v-else class="min-w-full divide-y divide-gray-200">
			<thead class="bg-gray-50">
			  <tr>
				<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
				  ID
				</th>
	${tableHeaders}
				<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
				  操作
				</th>
			  </tr>
			</thead>
			<tbody class="bg-white divide-y divide-gray-200">
			  <tr v-for="item in store.items" :key="item.id" class="hover:bg-gray-50 transition">
				<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
				  {{ item.id }}
				</td>
	${tableColumns}
				<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
				  <div class="flex justify-end gap-2">
					<button @click="editItem(item.id)"
					  class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-all">
					  編輯
					</button>
					<button @click="deleteItem(item.id)"
					  class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md transition-all">
					  刪除
					</button>
				  </div>
				</td>
			  </tr>
			</tbody>
		  </table>

		  <!-- 空資料提示 -->
		  <div v-if="!store.loading && !store.items.length" class="p-8 text-center text-gray-500">
			<svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
			</svg>
			<p class="text-lg font-medium mb-2">尚無資料</p>
			<button @click="store.fetchAll()" class="text-blue-600 hover:text-blue-800 text-sm">
			  點擊重新載入
			</button>
		  </div>
		</div>
	  </div>
	</template>

	<script setup>
	import { onMounted } from 'vue';
	import { useRouter } from 'vue-router';
	import { use${e.name}Store } from '@/stores/${e.lowerName}Store';
	import { ${e.lowerName}Service } from '@/services/${e.lowerName}Service';

	const router = useRouter();
	const store = use${e.name}Store();

	const editItem = (id) => {
	  router.push({ name: '${e.name}Edit', params: { id } });
	};

	const deleteItem = async (id) => {
	  if (confirm('確定刪除？')) {
		await ${e.lowerName}Service.remove(id);
		store.fetchAll();
	  }
	};

	onMounted(() => store.fetchAll());
	</script>
	`;
	},

  // ============================================================
  // 版型 2: 卡片網格 (保持不變)
  // ============================================================
  cardGridVue: (e) => {
    const displayFields = Object.entries(e.properties)
      .filter(([k]) => !['id', 'createdAt', 'updatedAt'].includes(k))
      .slice(0, 3)
      .map(([k, p]) => `<div class="text-sm text-gray-600"><span class="font-medium">${escapeJsString(p.displayName)}:</span> {{ item.${k} }}</div>`)
      .join('\n              ');

    return `<template>
  <div class="max-w-7xl mx-auto p-6">
    <header class="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">${e.name} 管理</h1>
          <p class="text-gray-600 mt-1">共 {{ store.items.length }} 筆資料</p>
        </div>
        <button @click="$router.push({ name: '${e.name}Create' })"
          class="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium flex items-center gap-2 transition-all">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          新增
        </button>
      </div>
    </header>

    <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
      <input v-model="searchTerm" @input="handleSearch"
        placeholder="搜尋資料..."
        class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="item in filteredItems" :key="item.id"
        class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all cursor-pointer"
        @click="$router.push({ name: '${e.name}Edit', params: { id: item.id } })">
        
        <div class="h-48 bg-gradient-to-br from-blue-400 to-purple-500"></div>
        
        <div class="p-5">
          <h3 class="text-lg font-bold text-gray-800 mb-3">{{ item.name || item.title || 'N/A' }}</h3>
          
          <div class="space-y-2 mb-4">
            ${displayFields}
          </div>
          
          <div class="flex gap-2 pt-4 border-t">
            <button @click.stop="$router.push({ name: '${e.name}Edit', params: { id: item.id } })"
              class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all">
              編輯
            </button>
            <button @click.stop="handleDelete(item.id)"
              class="flex-1 px-4 py-2 border-2 border-red-500 text-red-600 hover:bg-red-50 rounded-lg transition-all">
              刪除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { use${e.name}Store } from '@/stores/${e.lowerName}Store';
import { ${e.lowerName}Service } from '@/services/${e.lowerName}Service';

const router = useRouter();
const store = use${e.name}Store();
const searchTerm = ref('');

const filteredItems = computed(() => {
  if (!searchTerm.value) return store.items;
  const term = searchTerm.value.toLowerCase();
  return store.items.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(term)
    )
  );
});

const handleSearch = () => {};

const handleDelete = async (id) => {
  if (confirm('確定刪除？')) {
    await ${e.lowerName}Service.remove(id);
    store.fetchAll();
  }
};

onMounted(() => store.fetchAll());
</script>
`;
  },

  // ============================================================
  // 🆕 版型 3: 主從表單 (真正的訂單結構)
  // ============================================================
  masterDetailVue: (e) => {
    const mainFields = Object.entries(e.properties)
      .filter(([k]) => !['id', 'createdAt', 'updatedAt'].includes(k))
      .slice(0, 2)
      .map(([k, p]) => `<div><span class="font-medium">${escapeJsString(p.displayName)}:</span> {{ selected.${k} }}</div>`)
      .join('\n            ');

    return `<template>
  <div class="flex h-screen bg-gray-100">
    <!-- 左側列表 (Master) -->
    <div class="w-1/3 bg-white border-r overflow-y-auto">
      <div class="p-4 border-b sticky top-0 bg-white z-10">
        <h2 class="text-xl font-bold mb-3">${e.name} 列表</h2>
        <button @click="$router.push({ name: '${e.name}Create' })"
          class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          ➕ 新增 ${e.name}
        </button>
      </div>
      
      <div class="divide-y">
        <div v-for="item in store.items" :key="item.id"
          @click="selectItem(item)"
          :class="[
            'p-4 cursor-pointer hover:bg-blue-50 transition',
            selected?.id === item.id ? 'bg-blue-100 border-l-4 border-blue-600' : ''
          ]">
          <div class="font-semibold">{{ item.name || item.title || '#' + item.id }}</div>
          <div class="text-sm text-gray-600 mt-1">{{ formatDate(item.createdAt) }}</div>
        </div>
      </div>
    </div>

    <!-- 右側詳情 (Detail) -->
    <div class="flex-1 overflow-y-auto p-6">
      <div v-if="selected" class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h3 class="text-2xl font-bold">{{ selected.name || selected.title || '詳細資料' }}</h3>
            <p class="text-gray-500 text-sm mt-1">ID: {{ selected.id }}</p>
          </div>
          <div class="flex gap-2">
            <button @click="editItem"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              ✏️ 編輯
            </button>
            <button @click="deleteItem"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              🗑️ 刪除
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          ${mainFields}
        </div>

        <!-- 🆕 可擴展: 明細表格區 (適合訂單明細) -->
        <div class="mt-6 border-t pt-6">
          <h4 class="text-lg font-bold mb-3">相關明細</h4>
          <div class="text-gray-500 text-sm">
            此處可擴展顯示子項目列表 (例如: 訂單明細、任務子項等)
          </div>
        </div>
      </div>
      
      <div v-else class="flex items-center justify-center h-full text-gray-400">
        <div class="text-center">
          <svg class="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <p>請從左側選擇一個項目</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { use${e.name}Store } from '@/stores/${e.lowerName}Store';
import { ${e.lowerName}Service } from '@/services/${e.lowerName}Service';

const router = useRouter();
const store = use${e.name}Store();
const selected = ref(null);

const selectItem = (item) => {
  selected.value = item;
};

const editItem = () => {
  router.push({ name: '${e.name}Edit', params: { id: selected.value.id } });
};

const deleteItem = async () => {
  if (confirm('確定刪除？')) {
    await ${e.lowerName}Service.remove(selected.value.id);
    selected.value = null;
    store.fetchAll();
  }
};

const formatDate = (dateStr) => {
  return dateStr ? new Date(dateStr).toLocaleDateString('zh-TW') : 'N/A';
};

onMounted(() => store.fetchAll());
</script>
`;
  },

  // ============================================================
  // 🆕 版型 4: 看板 (Kanban)
  // ============================================================
  kanbanVue: (e) => {
    return `<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">${e.name} 看板</h1>
      <button @click="$router.push({ name: '${e.name}Create' })"
        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
        ➕ 新增
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- 待處理 -->
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold">📋 待處理</h2>
          <span class="text-sm text-gray-500">{{ pendingItems.length }}</span>
        </div>
        <div class="space-y-3">
          <div v-for="item in pendingItems" :key="item.id"
            @click="$router.push({ name: '${e.name}Edit', params: { id: item.id } })"
            class="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg cursor-pointer hover:shadow-md transition">
            <h3 class="font-semibold">{{ item.name || item.title || '#' + item.id }}</h3>
            <p class="text-sm text-gray-600 mt-1">{{ formatDate(item.createdAt) }}</p>
          </div>
        </div>
      </div>

      <!-- 進行中 -->
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold">🚀 進行中</h2>
          <span class="text-sm text-gray-500">{{ inProgressItems.length }}</span>
        </div>
        <div class="space-y-3">
          <div v-for="item in inProgressItems" :key="item.id"
            @click="$router.push({ name: '${e.name}Edit', params: { id: item.id } })"
            class="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg cursor-pointer hover:shadow-md transition">
            <h3 class="font-semibold">{{ item.name || item.title || '#' + item.id }}</h3>
            <p class="text-sm text-gray-600 mt-1">{{ formatDate(item.createdAt) }}</p>
          </div>
        </div>
      </div>

      <!-- 已完成 -->
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold">✅ 已完成</h2>
          <span class="text-sm text-gray-500">{{ completedItems.length }}</span>
        </div>
        <div class="space-y-3">
          <div v-for="item in completedItems" :key="item.id"
            @click="$router.push({ name: '${e.name}Edit', params: { id: item.id } })"
            class="p-4 bg-green-50 border-l-4 border-green-400 rounded-lg cursor-pointer hover:shadow-md transition">
            <h3 class="font-semibold">{{ item.name || item.title || '#' + item.id }}</h3>
            <p class="text-sm text-gray-600 mt-1">{{ formatDate(item.createdAt) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { use${e.name}Store } from '@/stores/${e.lowerName}Store';

const store = use${e.name}Store();

// 🎯 根據狀態欄位分組 (假設有 status 欄位，可自行調整)
const pendingItems = computed(() => 
  store.items.filter(item => !item.status || item.status === 'pending')
);
const inProgressItems = computed(() => 
  store.items.filter(item => item.status === 'in_progress')
);
const completedItems = computed(() => 
  store.items.filter(item => item.status === 'completed')
);

const formatDate = (dateStr) => {
  return dateStr ? new Date(dateStr).toLocaleDateString('zh-TW') : 'N/A';
};

onMounted(() => store.fetchAll());
</script>
`;
  },

  // ============================================================
  // 🆕 版型 5: 時間軸 (Timeline)
  // ============================================================
  timelineVue: (e) => {
    const displayFields = Object.entries(e.properties)
      .filter(([k]) => !['id', 'createdAt', 'updatedAt'].includes(k))
      .slice(0, 2)
      .map(([k, p]) => `<div class="text-sm"><span class="font-medium">${escapeJsString(p.displayName)}:</span> {{ item.${k} }}</div>`)
      .join('\n              ');

    return `<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">${e.name} 時間軸</h1>
      <button @click="$router.push({ name: '${e.name}Create' })"
        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
        ➕ 新增
      </button>
    </div>

    <div class="relative border-l-4 border-blue-400 pl-8 space-y-8">
      <div v-for="(item, index) in sortedItems" :key="item.id" class="relative">
        <!-- 時間點標記 -->
        <div class="absolute -left-10 w-6 h-6 bg-blue-500 rounded-full border-4 border-white"></div>
        
        <!-- 時間標籤 -->
        <div class="text-sm text-gray-500 mb-2">
          {{ formatDateTime(item.createdAt) }}
        </div>

        <!-- 內容卡片 -->
        <div class="bg-white rounded-lg shadow-lg p-5 hover:shadow-xl transition">
          <div class="flex justify-between items-start mb-3">
            <h3 class="text-xl font-bold">{{ item.name || item.title || '#' + item.id }}</h3>
            <div class="flex gap-2">
              <button @click="$router.push({ name: '${e.name}Edit', params: { id: item.id } })"
                class="text-blue-600 hover:text-blue-800">✏️</button>
              <button @click="deleteItem(item.id)"
                class="text-red-600 hover:text-red-800">🗑️</button>
            </div>
          </div>
          
          <div class="space-y-1 text-gray-700">
            ${displayFields}
          </div>

          <!-- 更新時間 -->
          <div v-if="item.updatedAt" class="mt-3 pt-3 border-t text-xs text-gray-400">
            最後更新: {{ formatDateTime(item.updatedAt) }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="!store.items.length" class="text-center text-gray-400 py-12">
      <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <p>尚無任何記錄</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { use${e.name}Store } from '@/stores/${e.lowerName}Store';
import { ${e.lowerName}Service } from '@/services/${e.lowerName}Service';

const store = use${e.name}Store();

// 按建立時間排序 (最新在上)
const sortedItems = computed(() => 
  [...store.items].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  )
);

const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const deleteItem = async (id) => {
  if (confirm('確定刪除？')) {
    await ${e.lowerName}Service.remove(id);
    store.fetchAll();
  }
};

onMounted(() => store.fetchAll());
</script>
`;
  },

  // ============================================================
  // Form 保持不變
  // ============================================================
  formVue: (e) => `<template>
  <CrudPageLayout :title="\`\${isEdit ? '編輯' : '新增'} ${e.name}\`">
    <div class="max-w-2xl mx-auto">
      <GenericCrudForm
        :fields="${e.lowerName}FormFields"
        :initial-data="store.current"
        @submit="save"
        @cancel="$router.push({ name: '${e.name}List' })"
      />
    </div>
  </CrudPageLayout>
</template>

<script setup>
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { use${e.name}Store } from '@/stores/${e.lowerName}Store';
import { ${e.lowerName}FormFields } from '@/schema/${e.lowerName}Schema';
import GenericCrudForm from '@/components/common/GenericCrudForm.vue';
import CrudPageLayout from '@/components/common/CrudPageLayout.vue';

const store = use${e.name}Store();
const route = useRoute();
const router = useRouter();

const isEdit = computed(() => !!route.params.id);

watch(
  () => route.params.id,
  async (id) => {
    if (id) {
      await store.fetchOne(id);
    } else {
      store.reset();
    }
  },
  { immediate: true }
);

const save = async (data) => {
  await store.save(data);
  router.push({ name: '${e.name}List' });
};
</script>
`,

  // ============================================================
  // Routes 保持不變
  // ============================================================
routes: (e) => `// src/router/${e.lowerName}Routes.js
export const ${e.lowerName}Routes = [
  { path: '${e.lowerName}s', name: '${e.name}List', component: () => import('@/views/${e.lowerName}/${e.name}List.vue') },
  { path: '${e.lowerName}s/create', name: '${e.name}Create', component: () => import('@/views/${e.lowerName}/${e.name}Form.vue') },
  { path: '${e.lowerName}s/:id/edit', name: '${e.name}Edit', component: () => import('@/views/${e.lowerName}/${e.name}Form.vue') },
];
`,
};

// ============================================================
// 🆕 根據版型類型選擇對應的 Vue 檔案生成函數
// ============================================================
export function getListTemplate(templateType) {
  switch (templateType) {
    case TEMPLATE_TYPES.SIMPLE_LIST:
      return TEMPLATES.simpleListVue;
    case TEMPLATE_TYPES.CARD_GRID:
      return TEMPLATES.cardGridVue;
    case TEMPLATE_TYPES.MASTER_DETAIL:
      return TEMPLATES.masterDetailVue; // ⭐ 修復：使用正確的主從表單版型
    case TEMPLATE_TYPES.KANBAN:
      return TEMPLATES.kanbanVue; // 🆕 看板版型
    case TEMPLATE_TYPES.TIMELINE:
      return TEMPLATES.timelineVue; // 🆕 時間軸版型
    default:
      return TEMPLATES.simpleListVue;
  }
}