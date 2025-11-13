// src/components/common/GenericCrudForm.vue
<template>
  <form @submit.prevent="submitForm" class="space-y-6">
    <div v-for="field in fields.filter(f => f.type !== 'hidden')" :key="field.key">
      <label :for="field.key" class="block text-sm font-medium text-gray-700">
        {{ field.label }}<span v-if="field.validation?.required" class="text-red-500">*</span>
      </label>
      
      <input v-if="field.type === 'text' || field.type === 'number'"
             :type="field.type"
             :id="field.key"
             v-model="formData[field.key]"
             class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
      
      <textarea v-else-if="field.type === 'textarea'"
             :id="field.key"
             v-model="formData[field.key]"
             rows="3"
             class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>

      </div>

    <div class="pt-5">
      <div class="flex justify-end">
        <button type="button" @click="$emit('cancel')"
                class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
          取消
        </button>
        <button type="submit"
                class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
          儲存
        </button>
      </div>
    </div>
  </form>
</template>

<script setup>
import { reactive, watch } from 'vue'; 

const props = defineProps({
  fields: { type: Array, required: true }, // Schema 定義
  initialData: { type: Object, required: true },
});

const emit = defineEmits(['submit', 'cancel']);

// 使用 reactive 確保表單資料可被修改
const formData = reactive({...props.initialData});

// 確保 initialData 改變時 (如切換新增/編輯)，formData 也能更新
watch(() => props.initialData, (newVal) => {
    Object.assign(formData, newVal);
}, { deep: true });

function submitForm() {
    // 這裡應加入驗證邏輯
    // 假設驗證通過
    emit('submit', formData);
}
</script>