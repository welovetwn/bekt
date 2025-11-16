// src/generator/templates.js

// ----------------------------------------------------
// 輔助函式 1: 安全轉義函式 (必須定義在 TEMPLATES 之前)
// ----------------------------------------------------
const escapeJsString = (str) => {
    if (typeof str !== 'string') {
        if (str === 0 || str === false) return str;
        return '';
    }
    // 進行多步轉義：捕捉最常見的破壞性字元
    return str
        .replace(/\\/g, '\\\\') // 1. 轉義所有的反斜線 (\)
        .replace(/'/g, "\\'")   // 2. 轉義單引號
        .replace(/"/g, '\\"')   // 3. 轉義雙引號
        .replace(/\n/g, '\\n')  // 4. 轉義換行符號
        .replace(/\r/g, '\\r')  // 5. 轉義回車符號
        .replace(/\t/g, '\\t');  // 6. 轉義 Tab 符號
};

// ----------------------------------------------------
// 輔助函式 2: 根據 Key 創建預設的 Label (確保轉義)
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
// 核心 TEMPLATES 邏輯
// ----------------------------------------------------
export const TEMPLATES = {
  // ⭐ 修正 Schema 模板: 採用 function 寫法並在 Node.js 中先計算字串
  schema: (e) => {
    // 1. 計算 tableColumns 陣列字串 (確保 displayName 被轉義且執行)
    const tableColumns = Object.entries(e.properties)
      .filter(([k]) => !['createdAt', 'updatedAt'].includes(k))
      .map(([k, p]) => {
        // 使用字串串接，確保 escapeJsString 在這裡被執行
        return `{ key: '${k}', label: '${toLabel(k)}', displayName: '${escapeJsString(p.displayName)}', isSortable: true }`;
      })
      .join(',\n  ');

    // 2. 計算 formFields 陣列字串 (確保 displayName 被轉義且執行)
    const formFields = Object.entries(e.properties)
      .filter(([k]) => k !== 'id' && !['createdAt', 'updatedAt'].includes(k))
      .map(([k, p]) => {
        const type = p.type === 'number' ? 'number' : p.type === 'date' ? 'date' : 'text';
        // 使用字串串接，確保 escapeJsString 在這裡被執行
        return `{ key: '${k}', label: '${toLabel(k)}', displayName: '${escapeJsString(p.displayName)}', type: '${type}', validation: { required: ${p.required} } }`;
      })
      .join(',\n  ');

    // 3. 計算 initialForm 物件字串
    const initialForm = Object.keys(e.properties)
      .filter(k => k !== 'id')
      .map(k => `${k}: ${defaultValue(e.properties[k].type)},`)
      .join('\n  ');


    // 返回最終的模板字串
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
  // 保持其他模板不變 (與您的原始檔案一致)
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

  routes: (e) => `// src/router/${e.lowerName}Routes.js
export const ${e.lowerName}Routes = [
  { path: '${e.lowerName}s', name: '${e.name}List', component: () => import('@/views/${e.lowerName}/${e.name}List.vue') },
  { path: '${e.lowerName}s/create', name: '${e.name}Create', component: () => import('@/views/${e.lowerName}/${e.name}Form.vue') },
  { path: '${e.lowerName}s/:id/edit', name: '${e.name}Edit', component: () => import('@/views/${e.lowerName}/${e.name}Form.vue') },
];
`,
};