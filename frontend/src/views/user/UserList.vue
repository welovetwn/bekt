<!-- src/views/user/UserList.vue -->
<template>
  <CrudPageLayout title="User 管理" add-route-name="UserCreate">
    <GenericDataTable
      :data="store.items"
      :columns="userTableColumns"
      :loading="store.loading"
      @refresh="store.fetchAll"
    >
      <template #cell-actions="{ item }">
        <button @click="$router.push({ name: 'UserEdit', params: { id: item.id } })" class="text-blue-600 hover:underline">編輯</button>
        <button @click="del(item.id)" class="text-red-600 hover:underline ml-2">刪除</button>
      </template>
    </GenericDataTable>
  </CrudPageLayout>
</template>

<script setup>
import { onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { userTableColumns } from '@/schema/userSchema';
import { userService } from '@/services/userService';
import CrudPageLayout from '@/components/common/CrudPageLayout.vue';
import GenericDataTable from '@/components/common/GenericDataTable.vue';

const store = useUserStore();
onMounted(() => store.fetchAll());

const del = async (id) => {
  if (confirm('確定刪除？')) {
    await userService.remove(id);
    store.fetchAll();
  }
};
</script>
