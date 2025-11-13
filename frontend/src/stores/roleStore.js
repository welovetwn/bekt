// src/stores/roleStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { roleService } from '@/services/roleService';
import { initialRoleForm } from '@/schema/roleSchema';

export const useRoleStore = defineStore('role', () => {
  const items = ref([]);
  const current = ref({ ...initialRoleForm });
  const loading = ref(false);

  const fetchAll = async () => {
    loading.value = true;
    try {
      const res = await roleService.getAll();
      items.value = res.data;
    } finally {
      loading.value = false;
    }
  };

  const fetchOne = async (id) => {
    const res = await roleService.getById(id);
    current.value = res.data;
  };

  const save = async (data) => {
    if (data.id) {
      await roleService.update(data.id, data);
    } else {
      await roleService.create(data);
    }
  };

  const remove = async (id) => {
    await roleService.remove(id);
  };

  const reset = () => current.value = { ...initialRoleForm };

  return { items, current, loading, fetchAll, fetchOne, save, remove, reset };
});
