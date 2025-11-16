// src/components/common/GenericCrudForm.vue
<template>
  <form @submit.prevent="submitForm" class="space-y-6">
    <div v-for="field in fields.filter(f => f.type !== 'hidden')" :key="field.key">
      <label :for="field.key" class="block text-sm font-medium text-gray-700">
	  	{{ field.displayName || field.label }}<span v-if="field.validation?.required" class="text-red-500">*</span> 
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

// 使用 reactive 來創建可響應的表單資料
const formData = reactive({});

// 初始化 formData
const initializeFormData = () => {
  // 將 initialData 的屬性複製到 formData
  // 這樣即使 initialData 改變 (例如從列表切換到編輯)，formData 也會更新
  // 同時處理新增時 initialData 可能是空物件的情況
  props.fields.forEach(field => {
    formData[field.key] = props.initialData[field.key] ?? null;
  });
};

// 初次載入時初始化
initializeFormData();

// 監聽 initialData 變化，以重新初始化表單 (例如從新增頁面切換到編輯頁面)
watch(() => props.initialData, initializeFormData, { deep: true });


const submitForm = () => {
  // 移除所有為 null 或 undefined 的值，確保只傳送有設定的值
  const dataToSend = Object.entries(formData)
    .filter(([, value]) => value !== null && value !== undefined)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

  emit('submit', dataToSend);
};
</script>