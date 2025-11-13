<!-- src/views/product/ProductForm.vue -->
<template>
  <CrudPageLayout :title="`${isEdit ? '編輯' : '新增'} Product`">
    <div class="max-w-2xl mx-auto">
      <GenericCrudForm
        :fields="productFormFields"
        :initial-data="store.current"
        @submit="save"
        @cancel="$router.push({ name: 'ProductList' })"
      />
    </div>
  </CrudPageLayout>
</template>

<script setup>
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductStore } from '@/stores/productStore';
import { productFormFields } from '@/schema/productSchema';
import GenericCrudForm from '@/components/common/GenericCrudForm.vue';
import CrudPageLayout from '@/components/common/CrudPageLayout.vue';

const store = useProductStore();
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
  router.push({ name: 'ProductList' });
};
</script>
