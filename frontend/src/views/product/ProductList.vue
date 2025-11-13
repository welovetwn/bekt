<!-- src/views/product/ProductList.vue -->
<template>
  <CrudPageLayout title="Product 管理" add-route-name="ProductCreate">
    <GenericDataTable
      :data="store.items"
      :columns="productTableColumns"
      :loading="store.loading"
      @refresh="store.fetchAll"
    >
      <template #cell-actions="{ item }">
        <button @click="$router.push({ name: 'ProductEdit', params: { id: item.id } })" class="text-blue-600 hover:underline">編輯</button>
        <button @click="del(item.id)" class="text-red-600 hover:underline ml-2">刪除</button>
      </template>
    </GenericDataTable>
  </CrudPageLayout>
</template>

<script setup>
import { onMounted } from 'vue';
import { useProductStore } from '@/stores/productStore';
import { productTableColumns } from '@/schema/productSchema';
import { productService } from '@/services/productService';
import CrudPageLayout from '@/components/common/CrudPageLayout.vue';
import GenericDataTable from '@/components/common/GenericDataTable.vue';

const store = useProductStore();
onMounted(() => store.fetchAll());

const del = async (id) => {
  if (confirm('確定刪除？')) {
    await productService.remove(id);
    store.fetchAll();
  }
};
</script>
