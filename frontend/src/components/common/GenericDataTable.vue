// src/components/common/GenericDataTable.vue
<template>
  <div class="bg-white shadow overflow-x-auto rounded-lg">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th v-for="col in columns" :key="col.key" scope="col" 
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {{ col.displayName || col.label }}
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="item in data" :key="item.id">
          <td v-for="col in columns" :key="col.key" class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            <slot :name="`cell-${col.key}`" :item="item">
              {{ item[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="!data.length" class="p-4 text-center text-gray-500">
        無資料
        <button @click="$emit('refresh')" class="ml-2 text-blue-500 hover:text-blue-700">刷新</button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  columns: { type: Array, required: true }, // 欄位定義
  data: { type: Array, required: true },
  title: { type: String, default: '資料列表' }
});

const emit = defineEmits(['refresh']);
</script>