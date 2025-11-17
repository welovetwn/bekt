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

    <!-- 🆕 版型選擇區 (更新為 5 種版型) -->
    <div v-if="entities.length" class="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
      <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"/>
        </svg>
        選擇版型類型
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="template in templateTypes" :key="template.value"
          @click="selectedTemplate = template.value"
          :class="[
            'p-5 rounded-xl border-2 cursor-pointer transition-all transform hover:scale-105',
            selectedTemplate === template.value 
              ? 'border-blue-600 bg-white shadow-xl ring-2 ring-blue-300' 
              : 'border-gray-200 bg-white hover:border-blue-400 hover:shadow-lg'
          ]">
          <div class="flex flex-col h-full">
            <!-- 圖示與標題 -->
            <div class="flex items-center gap-3 mb-3">
              <div :class="[
                'w-14 h-14 rounded-xl flex items-center justify-center text-3xl transition-all',
                selectedTemplate === template.value ? 'bg-blue-100 scale-110' : 'bg-gray-100'
              ]">
                {{ template.icon }}
              </div>
              <div class="flex-1">
                <h4 class="font-bold text-gray-800">{{ template.label }}</h4>
                <div class="flex items-center gap-1 text-xs mt-1">
                  <span class="text-gray-500">難度:</span>
                  <span v-for="i in template.difficulty" :key="i" class="text-yellow-500">⭐</span>
                  <span v-for="i in (5 - template.difficulty)" :key="'e'+i" class="text-gray-300">⭐</span>
                </div>
              </div>
            </div>

            <!-- 描述 -->
            <p class="text-sm text-gray-600 mb-3 flex-grow">{{ template.description }}</p>

            <!-- 適用場景標籤 -->
            <div class="flex flex-wrap gap-1 mt-2">
              <span v-for="tag in template.tags" :key="tag"
                class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                {{ tag }}
              </span>
            </div>

            <!-- 選中指示器 -->
            <div v-if="selectedTemplate === template.value" 
              class="absolute top-3 right-3 text-blue-600 animate-bounce">
              <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 版型說明 -->
      <div class="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p class="text-sm text-blue-800">
          <strong>💡 提示:</strong> {{ selectedTemplateInfo?.hint || '請選擇一個版型' }}
        </p>
      </div>
    </div>

    <!-- 實體清單 -->
    <div v-if="entities.length" class="mt-8">
      <h3 class="text-xl font-medium text-gray-900 mb-4">實體清單 (請選擇要生成的項目)</h3>
      <div class="space-y-3">
        <div v-for="entity in entities" :key="entity.name" class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
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

// 🆕 版型類型選擇 (預設為簡單列表)
const selectedTemplate = ref(TEMPLATE_TYPES.SIMPLE_LIST)

// 🆕 更新為 5 種版型
const templateTypes = [
  {
    value: TEMPLATE_TYPES.SIMPLE_LIST,
    label: '📋 簡單列表',
    icon: '📋',
    description: '傳統表格式CRUD，資料清晰易讀',
    difficulty: 1,
    tags: ['基礎', '資料維護'],
    hint: '適合簡單的資料維護場景，例如：員工管理、產品目錄等'
  },
  {
    value: TEMPLATE_TYPES.CARD_GRID,
    label: '🎴 卡片網格',
    icon: '🎴',
    description: '美觀的卡片式排版，適合商品展示',
    difficulty: 2,
    tags: ['視覺化', '電商'],
    hint: '適合需要圖片展示的場景，例如：商品列表、作品集、房源展示'
  },
  {
    value: TEMPLATE_TYPES.MASTER_DETAIL,
    label: '📝 主從表單',
    icon: '📝',
    description: '左右分割的訂單式結構，支援主從關聯',
    difficulty: 3,
    tags: ['複雜結構', '訂單'],
    hint: '適合主從關聯的資料，例如：訂單管理、專案任務、客戶檔案'
  },
  {
    value: TEMPLATE_TYPES.KANBAN,
    label: '📊 看板',
    icon: '📊',
    description: '敏捷開發風格的看板，支援狀態分組',
    difficulty: 3,
    tags: ['專案管理', '狀態追蹤'],
    hint: '適合需要狀態管理的場景，例如：任務管理、工單追蹤、招聘流程'
  },
  {
    value: TEMPLATE_TYPES.TIMELINE,
    label: '⏰ 時間軸',
    icon: '⏰',
    description: '按時間排序的歷史記錄視圖',
    difficulty: 2,
    tags: ['歷史記錄', '審計'],
    hint: '適合需要時間序列展示的場景，例如：操作日誌、活動記錄、版本歷史'
  }
]

// 🆕 當前選中版型的詳細資訊
const selectedTemplateInfo = computed(() => 
  templateTypes.find(t => t.value === selectedTemplate.value)
)

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
    const viewsFolder = zip.folder('src/views')!.folder(e.lowerName)
    const routerFolder = zip.folder('src/router')

    schemaFolder!.file(`${e.lowerName}Schema.js`, TEMPLATES.schema(e))
    serviceFolder!.file(`${e.lowerName}Service.js`, TEMPLATES.service(e))
    storeFolder!.file(`${e.lowerName}Store.js`, TEMPLATES.store(e))
    
    // 🆕 使用選擇的版型生成 List 頁面
    viewsFolder!.file(`${e.name}List.vue`, listTemplateFunc(e))
    viewsFolder!.file(`${e.name}Form.vue`, TEMPLATES.formVue(e))
    
    routerFolder!.file(`${e.name}Routes.js`, TEMPLATES.routes(e))
  })

  // 🆕 新增版型資訊檔案
  const templateInfo = templateTypes.find(t => t.value === selectedTemplate.value)
  zip.file('README.md', `# 生成的程式碼

## 版型類型
${templateInfo?.label || '未知版型'} - ${templateInfo?.description || ''}

**適用場景:** ${templateInfo?.tags.join(', ')}

## 生成的實體
${selected.map(e => `- ${e.name} (${e.lowerName})`).join('\n')}

## 使用說明
1. 將檔案解壓縮到專案對應目錄
2. 確認所有相依套件已安裝
3. 註冊路由到 router/index.js
4. 開始使用!

## 版型特性
${templateInfo?.hint || ''}
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