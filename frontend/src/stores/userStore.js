// src/stores/userStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { userService } from '@/services/userService';
import { initialUserForm } from '@/schema/userSchema';

export const useUserStore = defineStore('user', () => {
  const items = ref([]);
  const current = ref({ ...initialUserForm });
  const loading = ref(false);

  const fetchAll = async () => {
    loading.value = true;
    try {
      const res = await userService.getAll();
      items.value = res.data;
    } finally {
      loading.value = false;
    }
  };

  const fetchOne = async (id) => {
    const res = await userService.getById(id);
    current.value = res.data;
  };

  const save = async (data) => {
    if (data.id) {
      await userService.update(data.id, data);
    } else {
      await userService.create(data);
    }
  };

  const remove = async (id) => {
    await userService.remove(id);
  };

  const reset = () => current.value = { ...initialUserForm };

  return { items, current, loading, fetchAll, fetchOne, save, remove, reset };
});
