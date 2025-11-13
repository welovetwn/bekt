// src/generator/templates.js
export const TEMPLATES = {
  schema: (e) => `// src/schema/${e.lowerName}Schema.js
export const ${e.lowerName}TableColumns = [
  ${Object.entries(e.properties)
    .filter(([k]) => !['createdAt', 'updatedAt'].includes(k))
    .map(([k]) => `{ key: '${k}', label: '${toLabel(k)}', isSortable: true }`)
    .join(',\n  ')}
];

export const ${e.lowerName}FormFields = [
  { key: 'id', type: 'hidden' },
  ${Object.entries(e.properties)
    .filter(([k]) => k !== 'id' && !['createdAt', 'updatedAt'].includes(k))
    .map(([k, p]) => {
      const type = p.type === 'number' ? 'number' : p.type === 'date' ? 'date' : 'text';
      return `{ key: '${k}', label: '${toLabel(k)}', type: '${type}', validation: { required: ${p.required} } }`;
    })
    .join(',\n  ')}
];

export const initial${e.name}Form = {
  ${Object.keys(e.properties)
    .filter(k => k !== 'id')
    .map(k => `${k}: ${defaultValue(e.properties[k].type)},`)
    .join('\n  ')}
};
`,

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

  listVue: (e) => `<!-- src/views/${e.lowerName}/${e.name}List.vue -->
<template>
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

  formVue: (e) => `<!-- src/views/${e.lowerName}/${e.name}Form.vue -->
<template>
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

// ✅ 定義 isEdit，解決 ReferenceError 問題
const isEdit = computed(() => !!route.params.id);

// 當路由參數改變時，自動載入或重置表單
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

// 儲存資料後返回列表頁
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

function toLabel(str) {
  return str.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
}

function defaultValue(type) {
  return type === 'number' ? '0' : "''";
}