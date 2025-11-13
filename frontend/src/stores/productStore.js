// src/stores/productStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { productService } from '@/services/productService';
import { initialProductForm } from '@/schema/productSchema';

export const useProductStore = defineStore('product', () => {
  const items = ref([]);
  const current = ref({ ...initialProductForm });
  const loading = ref(false);

  const fetchAll = async () => {
    loading.value = true;
    try {
      const res = await productService.getAll();
      items.value = res.data;
    } finally {
      loading.value = false;
    }
  };

  const fetchOne = async (id) => {
    const res = await productService.getById(id);
    current.value = res.data;
  };

  const save = async (data) => {
    if (data.id) {
      await productService.update(data.id, data);
    } else {
      await productService.create(data);
    }
  };

  const remove = async (id) => {
    await productService.remove(id);
  };

  const reset = () => current.value = { ...initialProductForm };

  return { items, current, loading, fetchAll, fetchOne, save, remove, reset };
});
