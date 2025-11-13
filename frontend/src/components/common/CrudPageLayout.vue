// src/components/common/CrudPageLayout.vue
<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4 border-b pb-2">
      <h1 class="text-2xl font-bold">{{ title }}</h1>
      <router-link v-if="addRouteName" :to="{ name: addRouteName }" 
                   class="bg-indigo-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-indigo-700 transition">
        新增
      </router-link>
    </div>
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  addRouteName: { type: String, default: null }
});
</script>