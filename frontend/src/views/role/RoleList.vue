<!-- src/views/role/RoleList.vue -->
<template>
  <CrudPageLayout title="Role 管理" add-route-name="RoleCreate">
    <GenericDataTable
      :data="store.items"
      :columns="roleTableColumns"
      :loading="store.loading"
      @refresh="store.fetchAll"
    >
      <template #cell-actions="{ item }">
        <button @click="$router.push({ name: 'RoleEdit', params: { id: item.id } })" class="text-blue-600 hover:underline">編輯</button>
        <button @click="del(item.id)" class="text-red-600 hover:underline ml-2">刪除</button>
      </template>
    </GenericDataTable>
  </CrudPageLayout>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoleStore } from '@/stores/roleStore';
import { roleTableColumns } from '@/schema/roleSchema';
import { roleService } from '@/services/roleService';
import CrudPageLayout from '@/components/common/CrudPageLayout.vue';
import GenericDataTable from '@/components/common/GenericDataTable.vue';

const store = useRoleStore();
onMounted(() => store.fetchAll());

const del = async (id) => {
  if (confirm('確定刪除？')) {
    await roleService.remove(id);
    store.fetchAll();
  }
};
</script>
