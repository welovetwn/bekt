// src/generator/templates.js

// ----------------------------------------------------
// 輔助函式 1: 安全轉義函式
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

// ----------------------------------------------------
// 輔助函式 2: 根據 Key 創建預設的 Label
// ----------------------------------------------------
function toLabel(str) {
  const label = str.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
  return escapeJsString(label);
}

// ----------------------------------------------------
// 輔助函式 3: 設置 Form 初始值的預設值
// ----------------------------------------------------
function defaultValue(type) {
  return type === 'number' ? '0' : "''";
}

// ----------------------------------------------------
// 版型類型定義
// ----------------------------------------------------
export const TEMPLATE_TYPES = {
  SIMPLE_LIST: 'simple-list',           // 簡單列表
  CARD_GRID: 'card-grid',              // 卡片網格
  MASTER_DETAIL: 'master-detail'       // 主從表單 (原版型)
};

// ----------------------------------------------------
// 核心 TEMPLATES 邏輯
// ----------------------------------------------------
export const TEMPLATES = {
  // ⭐ Schema 保持不變
  schema: (e) => {
    const tableColumns = Object.entries(e.properties)
      .filter(([k]) => !['createdAt', 'updatedAt'].includes(k))
      .map(([k, p]) => {
        return `{ key: '${k}', label: '${toLabel(k)}', displayName: '${escapeJsString(p.displayName)}', isSortable: true }`;
      })
      .join(',\n  ');

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

  // ⭐ Service 保持不變
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

  // ⭐ Store 保持不變
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
  // 🆕 版型 1: 簡單列表 (Simple List)
  // ============================================================
  simpleListVue: (e) => `<template>
  <CrudPageLayout title="${e.name} 管理" add-route-name="${e.name}Create">
    <GenericDataTable
      :data="store.items"
      :columns="${e.lowerName}TableColumns"
      :loading="store.loading"
      @refresh="store.fetchAll"
    >
      <template #cell-actions="{ item }">
        <button @click="$router.push({ name: '${e.name}Edit', params: { id: item.id } })" class="text-blue-600 hover:underline">編輯</button>
        <button @click="del(item.id)" class="text-red-600 hover:underline ml-2">刪除</button>
      </template>
    </GenericDataTable>
  </CrudPageLayout>
</template>

<script setup>
import { onMounted } from 'vue';
import { use${e.name}Store } from '@/stores/${e.lowerName}Store';
import { ${e.lowerName}TableColumns } from '@/schema/${e.lowerName}Schema';
import { ${e.lowerName}Service } from '@/services/${e.lowerName}Service';
import CrudPageLayout from '@/components/common/CrudPageLayout.vue';
import GenericDataTable from '@/components/common/GenericDataTable.vue';

const store = use${e.name}Store();
onMounted(() => store.fetchAll());

const del = async (id) => {
  if (confirm('確定刪除？')) {
    await ${e.lowerName}Service.remove(id);
    store.fetchAll();
  }
};
</script>
`,

  // ============================================================
  // 🆕 版型 2: 卡片網格 (Card Grid)
  // ============================================================
  cardGridVue: (e) => {
    // 生成欄位的動態顯示邏輯
    const displayFields = Object.entries(e.properties)
      .filter(([k]) => !['id', 'createdAt', 'updatedAt'].includes(k))
      .slice(0, 3) // 只取前3個欄位顯示在卡片上
      .map(([k, p]) => `<div class="text-sm text-gray-600"><span class="font-medium">${escapeJsString(p.displayName)}:</span> {{ item.${k} }}</div>`)
      .join('\n              ');

    return `<template>
  <div class="max-w-7xl mx-auto p-6">
    <!-- 標題列 -->
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

    <!-- 搜尋列 -->
    <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
      <input v-model="searchTerm" @input="handleSearch"
        placeholder="搜尋資料..."
        class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
    </div>

    <!-- 卡片網格 -->
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

const handleSearch = () => {
  // 搜尋邏輯已在 computed 中處理
};

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
  // 🔄 原版型: 主從表單列表 (保留原邏輯)
  // ============================================================
  listVue: (e) => `<template>
  <CrudPageLayout title="${e.name} 管理" add-route-name="${e.name}Create">
    <GenericDataTable
      :data="store.items"
      :columns="${e.lowerName}TableColumns"
      :loading="store.loading"
      @refresh="store.fetchAll"
    >
      <template #cell-actions="{ item }">
        <button @click="$router.push({ name: '${e.name}Edit', params: { id: item.id } })" class="text-blue-600 hover:underline">編輯</button>
        <button @click="del(item.id)" class="text-red-600 hover:underline ml-2">刪除</button>
      </template>
    </GenericDataTable>
  </CrudPageLayout>
</template>

<script setup>
import { onMounted } from 'vue';
import { use${e.name}Store } from '@/stores/${e.lowerName}Store';
import { ${e.lowerName}TableColumns } from '@/schema/${e.lowerName}Schema';
import { ${e.lowerName}Service } from '@/services/${e.lowerName}Service';
import CrudPageLayout from '@/components/common/CrudPageLayout.vue';
import GenericDataTable from '@/components/common/GenericDataTable.vue';

const store = use${e.name}Store();
onMounted(() => store.fetchAll());

const del = async (id) => {
  if (confirm('確定刪除？')) {
    await ${e.lowerName}Service.remove(id);
    store.fetchAll();
  }
};
</script>
`,

  // ⭐ Form 保持不變
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

  // ⭐ Routes 保持不變
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
    default:
      return TEMPLATES.listVue;
  }
}