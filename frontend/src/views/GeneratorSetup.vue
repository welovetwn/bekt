<template>
  <div class="bg-white shadow-lg rounded-lg p-8 max-w-5xl mx-auto">
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
        <button type="submit" :disabled="!hasSelectedEntities" class="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
          生成並下載 ZIP
        </button>
      </div>
    </form>

    <!-- 🆕 版型選擇區 -->
    <div v-if="entities.length" class="mt-8 bg-blue-50 rounded-lg p-6">
      <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"/>
        </svg>
        選擇版型類型
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="template in templateTypes" :key="template.value"
          @click="selectedTemplate = template.value"
          :class="[
            'p-4 rounded-lg border-2 cursor-pointer transition-all',
            selectedTemplate === template.value 
              ? 'border-blue-600 bg-white shadow-md' 
              : 'border-gray-200 bg-white hover:border-blue-400'
          ]">
          <div class="flex items-start gap-3">
            <div :class="[
              'w-12 h-12 rounded-lg flex items-center justify-center text-2xl',
              selectedTemplate === template.value ? 'bg-blue-100' : 'bg-gray-100'
            ]">
              {{ template.icon }}
            </div>
            <div class="flex-1">
              <h4 class="font-bold text-gray-800 mb-1">{{ template.label }}</h4>
              <p class="text-sm text-gray-600">{{ template.description }}</p>
              <div class="mt-2 flex items-center gap-1 text-xs text-gray-500">
                <span>難度:</span>
                <span v-for="i in template.difficulty" :key="i">⭐</span>
              </div>
            </div>
            <div v-if="selectedTemplate === template.value" class="text-blue-600">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 實體清單 -->
    <div v-if="entities.length" class="mt-8">
      <h3 class="text-xl font-medium text-gray-900 mb-4">實體清單 (請選擇要生成的項目)</h3>
      <div class="space-y-3">
        <div v-for="entity in entities" :key="entity.name" class="flex items-center p-3 bg-gray-50 rounded-lg">
          <input type="checkbox" v-model="entity.selected" class="form-checkbox h-5 w-5 text-indigo-600 rounded">
          <span class="ml-3 text-gray-700 font-medium">{{ entity.name }} ({{ entity.lowerName }})</span>
          <span class="ml-auto text-sm text-gray-500">{{ Object.keys(entity.properties).length }} 個屬性</span>
        </div>
      </div>
      
      <!-- 全選/全不選 -->
      <div class="mt-4 flex gap-3">
        <button type="button" @click="selectAll" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm">
          全選
        </button>
        <button type="button" @click="deselectAll" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm">
          全不選
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import JSZip from 'jszip'
import { parseSwagger } from '@/utils/swaggerParser' 
import { TEMPLATES, TEMPLATE_TYPES, getListTemplate } from '@/generator/templates'

const config = ref({
  apiUrl: 'http://localhost:5000/swagger/v1/swagger.json'
})

const entities = ref<any[]>([])
const loading = ref(false)

// 🆕 版型類型選擇
const selectedTemplate = ref(TEMPLATE_TYPES.SIMPLE_LIST)

const templateTypes = [
  {
    value: TEMPLATE_TYPES.SIMPLE_LIST,
    label: '📋 簡單列表',
    icon: '📋',
    description: '傳統表格式CRUD,適合資料維護',
    difficulty: 1
  },
  {
    value: TEMPLATE_TYPES.CARD_GRID,
    label: '🎴 卡片網格',
    icon: '🎴',
    description: '卡片式排版,適合商品展示',
    difficulty: 2
  },
  {
    value: TEMPLATE_TYPES.MASTER_DETAIL,
    label: '📝 主從表單',
    icon: '📝',
    description: '訂單式主從結構 (原版型)',
    difficulty: 3
  }
]

const hasSelectedEntities = computed(() => 
  entities.value.some(e => e.selected)
)

const loadEntities = async () => {
  if (!config.value.apiUrl) return alert('請輸入 Swagger API URL')

  loading.value = true
  entities.value = []
  
  let swaggerPath = ''
  try {
    const url = new URL(config.value.apiUrl)
    swaggerPath = url.pathname + url.search
  } catch (e) {
    alert('Swagger API URL 格式錯誤,無法解析路徑。')
    loading.value = false
    return
  }

  try {
    const res = await fetch(swaggerPath)
    
    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`無法載入 Swagger：${res.status} ${res.statusText}. 詳細: ${errorText.substring(0, Math.min(errorText.length, 100))}...`)
    }

    const swagger = await res.json()
    entities.value = parseSwagger(swagger).map((e: any) => ({ ...e, selected: true }))

  } catch (err: any) {
    alert('解析失敗：' + (err.message || '未知錯誤'))
  } finally {
    loading.value = false
  }
}

const submitSetup = async () => {
  const selected = entities.value.filter(e => e.selected)
  if (!selected.length) return alert('請選擇至少一個實體')

  const zip = new JSZip()
  
  // 🆕 根據選擇的版型生成對應的程式碼
  const listTemplateFunc = getListTemplate(selectedTemplate.value)

  selected.forEach(e => {
    const schemaFolder = zip.folder('src/schema')
    const serviceFolder = zip.folder('src/services')
    const storeFolder = zip.folder('src/stores')
    const viewsFolder = zip.folder('src/views').folder(e.lowerName)
    const routerFolder = zip.folder('src/router')

    schemaFolder.file(`${e.lowerName}Schema.js`, TEMPLATES.schema(e))
    serviceFolder.file(`${e.lowerName}Service.js`, TEMPLATES.service(e))
    storeFolder.file(`${e.lowerName}Store.js`, TEMPLATES.store(e))
    
    // 🆕 使用選擇的版型生成 List 頁面
    viewsFolder.file(`${e.name}List.vue`, listTemplateFunc(e))
    viewsFolder.file(`${e.name}Form.vue`, TEMPLATES.formVue(e))
    
    routerFolder.file(`${e.name}Routes.js`, TEMPLATES.routes(e))
  })

  // 🆕 新增版型資訊檔案
  zip.file('README.md', `# 生成的程式碼

## 版型類型
${templateTypes.find(t => t.value === selectedTemplate.value)?.label}

## 生成的實體
${selected.map(e => `- ${e.name} (${e.lowerName})`).join('\n')}

## 使用說明
1. 將檔案解壓縮到專案對應目錄
2. 確認所有相依套件已安裝
3. 註冊路由到 router/index.js
4. 開始使用!
`)

  // 🆕 新增 purge.bat 批次檔：刪除所有生成的檔案與資料夾
  const purgeLines = [
    '@echo off',
    'chcp 65001 >nul',
    'echo.',
    'echo ========================================',
    'echo   ⚠  即將刪除本次生成的所有程式碼',
    'echo ========================================',
    'echo.',
    'echo 將刪除以下項目：',
    'echo   - src/schema/*.js',
    'echo   - src/services/*.js',
    'echo   - src/stores/*.js',
    'echo   - src/views/[entity]/ 資料夾',
    'echo   - src/router/*Routes.js',
    'echo.',
    'set /p "confirm=是否繼續？(Y/N): "',
    'if /i "%confirm%" neq "Y" if /i "%confirm%" neq "是" (',
    '    echo.',
    '    echo ❌ 操作已取消。',
    '    pause',
    '    exit /b',
    ')',
    'echo.',
    'echo 正在清除...'
  ]

  // 刪除 schema, service, store
  selected.forEach(e => {
    purgeLines.push(`if exist "src\\schema\\${e.lowerName}Schema.js" del /q "src\\schema\\${e.lowerName}Schema.js"`)
    purgeLines.push(`if exist "src\\services\\${e.lowerName}Service.js" del /q "src\\services\\${e.lowerName}Service.js"`)
    purgeLines.push(`if exist "src\\stores\\${e.lowerName}Store.js" del /q "src\\stores\\${e.lowerName}Store.js"`)
    purgeLines.push(`if exist "src\\views\\${e.lowerName}" rd /s /q "src\\views\\${e.lowerName}"`)
    purgeLines.push(`if exist "src\\router\\${e.name}Routes.js" del /q "src\\router\\${e.name}Routes.js"`)
  })

  // 嘗試刪除可能空的父資料夾（可選）
  purgeLines.push(
    'echo.',
    'echo 嘗試清理空資料夾...',
    'if exist "src\\schema" (rmdir "src\\schema" 2>nul || echo   - schema 資料夾非空，保留)',
    'if exist "src\\services" (rmdir "src\\services" 2>nul || echo   - services 資料夾非空，保留)',
    'if exist "src\\stores" (rmdir "src\\stores" 2>nul || echo   - stores 資料夾非空，保留)',
    'if exist "src\\views" (rmdir "src\\views" 2>nul || echo   - views 資料夾非空，保留)',
    'if exist "src\\router" (rmdir "src\\router" 2>nul || echo   - router 資料夾非空，保留)',
    '',
    'echo.',
    'echo ✅ 所有指定檔案已清除！',
    'echo.',
    'pause'
  )
  zip.file('purge.bat', purgeLines.join('\r\n'))
  
  const zipContent = await zip.generateAsync({ type: 'blob' })
  const downloadLink = document.createElement('a')
  downloadLink.href = URL.createObjectURL(zipContent)
  downloadLink.download = `generated_${selectedTemplate.value}_${Date.now()}.zip`
  downloadLink.click()
  URL.revokeObjectURL(downloadLink.href)
}

const selectAll = () => {
  entities.value.forEach(e => e.selected = true)
}

const deselectAll = () => {
  entities.value.forEach(e => e.selected = false)
}
</script>

<style scoped>
.form-checkbox {
  @apply rounded border-gray-300 text-indigo-600 focus:ring-indigo-500;
}
</style>