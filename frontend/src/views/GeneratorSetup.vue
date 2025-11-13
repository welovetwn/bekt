<template>
  <div class="bg-white shadow-lg rounded-lg p-8 max-w-4xl mx-auto">
    <h2 class="text-3xl font-extrabold text-gray-900 mb-6">程式碼生成設定</h2>

    <form @submit.prevent="submitSetup" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700">Swagger API URL</label>
        <input v-model="config.apiUrl" required type="url" class="mt-1 block w-full border rounded-md p-3" placeholder="http://localhost:5000/swagger/v1/swagger.json">
      </div>

      <div class="flex justify-end space-x-3">
        <button type="button" @click="loadEntities" :disabled="loading" class="px-6 py-3 bg-indigo-100 text-indigo-700 rounded-md">
          {{ loading ? '解析中...' : '解析 API' }}
        </button>
        <button type="submit" :disabled="!entities.length" class="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          生成並下載 ZIP
        </button>
      </div>
    </form>

    <div v-if="entities.length" class="mt-8">
      <h3 class="text-xl font-medium text-gray-900 mb-4">實體清單 (請選擇要生成的項目)</h3>
      <div class="space-y-3">
        <div v-for="entity in entities" :key="entity.name" class="flex items-center p-3 bg-gray-50 rounded-lg">
          <input type="checkbox" v-model="entity.selected" class="form-checkbox h-5 w-5 text-indigo-600 rounded">
          <span class="ml-3 text-gray-700 font-medium">{{ entity.name }} ({{ entity.lowerName }})</span>
          <span class="ml-auto text-sm text-gray-500">{{ Object.keys(entity.properties).length }} 個屬性</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import JSZip from 'jszip'
import { parseSwagger } from '@/utils/swaggerParser' 
import { TEMPLATES } from '@/generator/templates'; 
// 🚨 移除所有額外的 import

const config = ref({
  // config.apiUrl 保持完整的 URL
  apiUrl: 'http://localhost:5000/swagger/v1/swagger.json' 
})

const entities = ref<any[]>([])
const loading = ref(false)

// **[核心修正區塊：loadEntities 函數]**
const loadEntities = async () => {
  // **[修正 1]**：使用 .value 存取 config 的值
  if (!config.value.apiUrl) return alert('請輸入 Swagger API URL') 

  loading.value = true
  entities.value = []
  
  // **[修正 2]**：提取路徑部分，滿足「解析 API」時只用路徑的需求
  let swaggerPath = '';
  try {
      const url = new URL(config.value.apiUrl);
      // pathName 會是 /swagger/v1/swagger.json
      swaggerPath = url.pathname + url.search; 
  } catch (e) {
      alert('Swagger API URL 格式錯誤，無法解析路徑。');
      loading.value = false;
      return;
  }

  try {
    // 解決 (1) 問題：使用提取的路徑部分發送請求
    const res = await fetch(swaggerPath);
    
    // 增加更詳細的錯誤提示
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`無法載入 Swagger：${res.status} ${res.statusText}. 詳細: ${errorText.substring(0, Math.min(errorText.length, 100))}...`);
    }

    const swagger = await res.json()
    entities.value = parseSwagger(swagger).map((e: any) => ({ ...e, selected: true }))

  } catch (err: any) {
    alert('解析失敗：' + (err.message || '未知錯誤'));
  } finally {
    loading.value = false
  }
}
// **[核心修正區塊結束]**

// **[核心修正區塊：submitSetup 函數]**
const submitSetup = async () => {
  const selected = entities.value.filter(e => e.selected)
  if (!selected.length) return alert('請選擇至少一個實體')

  const zip = new JSZip()
  
  // ?? 這裡我們遵循您的原始程式碼結構，不新增 zip.file('src/config.js', ...)

  selected.forEach(e => {
    // 正確路徑結構
    const schemaFolder = zip.folder('src/schema')
    const serviceFolder = zip.folder('src/services')
    const storeFolder = zip.folder('src/stores')
    const viewsFolder = zip.folder('src/views').folder(e.lowerName)
    const routerFolder = zip.folder('src/router') // 路由資料夾

    schemaFolder.file(`${e.lowerName}Schema.js`, TEMPLATES.schema(e))
    serviceFolder.file(`${e.lowerName}Service.js`, TEMPLATES.service(e))
    storeFolder.file(`${e.lowerName}Store.js`, TEMPLATES.store(e))
    viewsFolder.file(`${e.name}List.vue`, TEMPLATES.listVue(e))
    viewsFolder.file(`${e.name}Form.vue`, TEMPLATES.formVue(e))
    
    // **[修正 1 & 2]**：
    // 1. 修正 TEMPLATES 函數名稱：route(e) -> routes(e) (修復 TypeError)
    // 2. 修正檔案存放位置：viewsFolder -> routerFolder (修復邏輯錯誤)
    routerFolder.file(`${e.name}Routes.js`, TEMPLATES.routes(e))
  })

  const zipContent = await zip.generateAsync({ type: 'blob' })
  const downloadLink = document.createElement('a')
  downloadLink.href = URL.createObjectURL(zipContent)
  downloadLink.download = 'generated_code.zip'
  downloadLink.click()
  URL.revokeObjectURL(downloadLink.href)
}
// **[核心修正區?
</script>