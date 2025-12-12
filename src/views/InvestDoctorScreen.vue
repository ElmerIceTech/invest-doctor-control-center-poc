<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Dialog from '../components/ui/Dialog.vue'
import InvestDoctorCreateForm from '../components/InvestDoctor/InvestDoctorCreateForm.vue'
import InvestDoctorCard from '../components/InvestDoctor/InvestDoctorCard.vue'
import { getAgents, createAgent, deleteAgent } from '../services/agents'
import type { InvestDoctor, InvestDoctorCreateInput } from '../types/investDoctor'

const isCreateOpen = ref(false)
const formKey = ref(0)
const items = ref<InvestDoctor[]>([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const deletingIds = ref<Set<string>>(new Set())

const sortedItems = computed(() =>
  [...items.value].sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso)),
)

// 將 API 返回的數據轉換為 InvestDoctor 格式
function mapAgentToInvestDoctor(agent: any): InvestDoctor {
  return {
    id: String(agent.id ?? agent.agent_id ?? ''),
    name: agent.name ?? '',
    alias: agent.alias ?? '',
    createdAtIso: agent.created_at ?? agent.createdAtIso ?? new Date().toISOString(),
  }
}

async function loadAgents() {
  isLoading.value = true
  try {
    const data = await getAgents()
    // 處理數組或單個對象
    const agents = Array.isArray(data) ? data : [data]
    items.value = agents.map(mapAgentToInvestDoctor)
  } catch (error) {
    console.error('Failed to load agents:', error)
    // 保持空數組，讓 UI 顯示空狀態
    items.value = []
  } finally {
    isLoading.value = false
  }
}

function openCreate() {
  isCreateOpen.value = true
  formKey.value += 1
}

function onCancelCreate() {
  isCreateOpen.value = false
}

async function onCreate(payload: InvestDoctorCreateInput) {
  isSubmitting.value = true
  try {
    await createAgent(payload)
    // 創建成功後重新載入列表，確保數據一致性
    await loadAgents()
    isCreateOpen.value = false
  } catch (error) {
    console.error('Failed to create agent:', error)
    alert('建立投資大師失敗，請稍後再試')
  } finally {
    isSubmitting.value = false
  }
}

async function onDelete(id: string) {
  const numericId = Number(id)
  if (isNaN(numericId)) {
    console.error('Invalid agent ID:', id)
    alert('無法刪除：無效的 ID')
    return
  }

  deletingIds.value.add(id)
  try {
    await deleteAgent(numericId)
    // 刪除成功後重新載入列表，確保數據一致性
    await loadAgents()
  } catch (error) {
    console.error('Failed to delete agent:', error)
    alert('刪除投資大師失敗，請稍後再試')
  } finally {
    deletingIds.value.delete(id)
  }
}

onMounted(() => {
  loadAgents()
})
</script>

<template>
  <main class="Screen">
    <header class="Screen__Header">
      <div>
        <h1 class="Screen__Title">投資大師</h1>
        <p class="Screen__Subtitle">建立你的投資大師檔案</p>
      </div>

      <button class="Screen__PrimaryButton" type="button" @click="openCreate">
        新增投資大師
      </button>
    </header>

    <Dialog v-model="isCreateOpen" title="新增投資大師">
      <InvestDoctorCreateForm
        :key="formKey"
        :submitting="isSubmitting"
        @submit="onCreate"
        @cancel="onCancelCreate"
      />
    </Dialog>

    <section class="Screen__Section" aria-label="投資大師列表">
      <div v-if="isLoading" class="EmptyState">載入中...</div>
      <div v-else-if="sortedItems.length === 0" class="EmptyState">
        尚未建立投資大師，請點右上角「新增投資大師」開始。
      </div>

      <div v-else class="CardGrid">
        <InvestDoctorCard
          v-for="item in sortedItems"
          :key="item.id"
          :item="item"
          :deleting="deletingIds.has(item.id)"
          @delete="onDelete"
        />
      </div>
    </section>
  </main>
</template>

<style scoped>
.Screen {
  padding: 20px;
  max-width: 1100px;
  margin: 0 auto;
  background-color: #000000;
  min-height: 100vh;
}

.Screen__Header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.Screen__Title {
  margin: 0;
  font-size: 22px;
  color: #ffffff;
}

.Screen__Subtitle {
  margin: 6px 0 0 0;
  font-size: 13px;
  color: #a3a3a3;
}

.Screen__PrimaryButton {
  border: 1px solid #f97316;
  background: #f97316;
  color: #000000;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  font-weight: 600;
  transition: background-color 0.2s, border-color 0.2s;
}

.Screen__PrimaryButton:hover {
  background: #ea580c;
  border-color: #ea580c;
}

.Screen__Section {
  margin-top: 14px;
}

.EmptyState {
  border: 1px dashed #f97316;
  border-radius: 12px;
  padding: 18px;
  color: #a3a3a3;
  background: #1a1a1a;
}

.CardGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .CardGrid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .CardGrid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
