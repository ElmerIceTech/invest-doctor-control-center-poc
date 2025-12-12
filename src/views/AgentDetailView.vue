<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Dialog from '../components/ui/Dialog.vue'
import Avatar from '../components/ui/Avatar.vue'
import SystemPromptForm from '../components/InvestDoctor/SystemPromptForm.vue'
import { getAgents } from '../services/agents'
import { getAgentSystemPrompts, createAgentSystemPrompts } from '../services/agentSystemPrompts'
import type { InvestDoctor } from '../types/investDoctor'
import type { CreateAgentSystemPrompts } from '../types/CreateAgentSystemPrompts'

const route = useRoute()
const router = useRouter()

const agentId = route.params.id as string
const agent = ref<InvestDoctor | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const isCreatePromptOpen = ref(false)
const formKey = ref(0)
const isSubmitting = ref(false)
const systemPromptFormRef = ref<{ setAgentId: (id: number) => void; reset: () => void } | null>(
  null,
)
const systemPrompts = ref<any[]>([])
const isLoadingPrompts = ref(false)

// 將 API 返回的數據轉換為 InvestDoctor 格式
function mapAgentToInvestDoctor(agentData: any): InvestDoctor {
  return {
    id: String(agentData.id ?? agentData.agent_id ?? ''),
    name: agentData.name ?? '',
    alias: agentData.alias ?? '',
    createdAtIso: agentData.created_at ?? agentData.createdAtIso ?? new Date().toISOString(),
  }
}

async function loadAgent() {
  isLoading.value = true
  error.value = null
  try {
    const data = await getAgents()
    const agents = Array.isArray(data) ? data : [data]
    const foundAgent = agents.find(
      (a: any) => String(a.id ?? a.agent_id ?? '') === agentId,
    )

    if (foundAgent) {
      agent.value = mapAgentToInvestDoctor(foundAgent)
    } else {
      error.value = '找不到此投資大師'
    }
  } catch (err) {
    console.error('Failed to load agent:', err)
    error.value = '載入投資大師資訊失敗'
  } finally {
    isLoading.value = false
  }
}

function goBack() {
  router.push('/')
}

function openCreatePrompt() {
  isCreatePromptOpen.value = true
  formKey.value += 1
  // 等待下一個 tick 確保組件已掛載
  setTimeout(() => {
    const numericId = Number(agentId)
    if (!isNaN(numericId) && systemPromptFormRef.value) {
      systemPromptFormRef.value.setAgentId(numericId)
    }
  }, 0)
}

function onCancelCreatePrompt() {
  isCreatePromptOpen.value = false
}

async function loadSystemPrompts() {
  const numericId = Number(agentId)
  if (isNaN(numericId)) return

  isLoadingPrompts.value = true
  try {
    const data = await getAgentSystemPrompts(numericId)

    systemPrompts.value = Array.isArray(data) ? data : [data]
  } catch (err) {
    console.error('Failed to load system prompts:', err)
    systemPrompts.value = []
  } finally {
    isLoadingPrompts.value = false
  }
}

async function onCreatePrompt(payload: CreateAgentSystemPrompts) {
  isSubmitting.value = true
  try {
    await createAgentSystemPrompts(payload)
    alert('Investment Master MD 建立成功')
    isCreatePromptOpen.value = false
    // 重新載入 system prompts 列表
    await loadSystemPrompts()
  } catch (err) {
    console.error('Failed to create system prompt:', err)
    alert('建立 Investment Master MD 失敗，請稍後再試')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  await loadAgent()
  await loadSystemPrompts()
})
</script>

<template>
  <main class="DetailView">
    <header class="DetailView__Header">
      <button class="DetailView__BackButton" type="button" @click="goBack" aria-label="返回">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        返回
      </button>
      <button
        v-if="agent"
        class="DetailView__CreateButton"
        type="button"
        @click="openCreatePrompt"
      >
        建立 Investment Master MD
      </button>
    </header>

    <div v-if="isLoading" class="DetailView__Loading">載入中...</div>
    <div v-else-if="error" class="DetailView__Error">{{ error }}</div>
    <div v-else-if="agent" class="DetailView__Content">
      <div class="DetailView__Card">
        <div class="DetailView__HeaderSection">
          <Avatar :name="agent.name" :size="64" />
          <div class="DetailView__TitleGroup">
            <h1 class="DetailView__Title">{{ agent.name }}</h1>
            <p class="DetailView__Subtitle">{{ agent.alias }}</p>
          </div>
        </div>

        <div class="DetailView__Body">
          <div class="DetailView__Field">
            <span class="DetailView__Label">ID</span>
            <span class="DetailView__Value DetailView__Value--mono">{{ agent.id }}</span>
          </div>
          <div class="DetailView__Field">
            <span class="DetailView__Label">名稱</span>
            <span class="DetailView__Value">{{ agent.name }}</span>
          </div>
          <div class="DetailView__Field">
            <span class="DetailView__Label">別名</span>
            <span class="DetailView__Value">{{ agent.alias }}</span>
          </div>
          <div class="DetailView__Field">
            <span class="DetailView__Label">建立時間</span>
            <span class="DetailView__Value DetailView__Value--mono">{{ agent.createdAtIso }}</span>
          </div>
        </div>
      </div>

      <div class="DetailView__Card">
        <h2 class="DetailView__SectionTitle">Investment Master MD</h2>
        <div v-if="isLoadingPrompts" class="DetailView__LoadingPrompts">載入中...</div>
        <div v-else-if="systemPrompts.length === 0" class="DetailView__EmptyPrompts">
          尚未建立 Investment Master MD，請點右上角「建立 Investment Master MD」開始。
        </div>
        <div v-else class="DetailView__PromptsList">
          <div
            v-for="prompt in systemPrompts"
            :key="prompt.id ?? prompt.system_prompt_id"
            class="DetailView__PromptItem"
          >
            <div class="DetailView__PromptHeader">
              <span class="DetailView__PromptVersion">{{ prompt.version ?? 'N/A' }}</span>
              <span
                v-if="prompt.created_at || prompt.createdAtIso"
                class="DetailView__PromptDate"
              >
                {{ prompt.created_at ?? prompt.createdAtIso }}
              </span>
            </div>
            <div class="DetailView__PromptContent">
              <pre class="DetailView__PromptPreview">{{ prompt.content ?? '' }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Dialog v-model="isCreatePromptOpen" title="建立 Investment Master MD">
      <SystemPromptForm
        ref="systemPromptFormRef"
        :key="formKey"
        :submitting="isSubmitting"
        @submit="onCreatePrompt"
        @cancel="onCancelCreatePrompt"
      />
    </Dialog>
  </main>
</template>

<style scoped>
.DetailView {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  background-color: #000000;
  min-height: 100vh;
}

.DetailView__Header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.DetailView__BackButton {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #404040;
  background: #1a1a1a;
  color: #ffffff;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.DetailView__BackButton:hover {
  border-color: #f97316;
  color: #f97316;
}

.DetailView__CreateButton {
  border: 1px solid #f97316;
  background: #f97316;
  color: #000000;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s, border-color 0.2s;
  white-space: nowrap;
}

.DetailView__CreateButton:hover {
  background: #ea580c;
  border-color: #ea580c;
}

.DetailView__Loading,
.DetailView__Error {
  text-align: center;
  padding: 40px;
  color: #a3a3a3;
  font-size: 16px;
}

.DetailView__Error {
  color: #dc2626;
}

.DetailView__Content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.DetailView__Card {
  border: 1px solid #404040;
  border-radius: 12px;
  background: #1a1a1a;
  padding: 24px;
}

.DetailView__HeaderSection {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #404040;
}

.DetailView__TitleGroup {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.DetailView__Title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
}

.DetailView__Subtitle {
  margin: 0;
  font-size: 16px;
  color: #a3a3a3;
}

.DetailView__Body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.DetailView__Field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.DetailView__Label {
  font-size: 12px;
  color: #a3a3a3;
  font-weight: 500;
}

.DetailView__Value {
  font-size: 16px;
  color: #ffffff;
}

.DetailView__Value--mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
  font-size: 14px;
  color: #a3a3a3;
}

.DetailView__SectionTitle {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
}

.DetailView__LoadingPrompts,
.DetailView__EmptyPrompts {
  text-align: center;
  padding: 40px 20px;
  color: #a3a3a3;
  font-size: 14px;
}

.DetailView__PromptsList {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.DetailView__PromptItem {
  border: 1px solid #404040;
  border-radius: 10px;
  padding: 16px;
  background: #000000;
  transition: border-color 0.2s;
}

.DetailView__PromptItem:hover {
  border-color: #f97316;
}

.DetailView__PromptHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #404040;
}

.DetailView__PromptVersion {
  font-size: 16px;
  font-weight: 600;
  color: #f97316;
}

.DetailView__PromptDate {
  font-size: 12px;
  color: #a3a3a3;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
}

.DetailView__PromptContent {
  max-height: 200px;
  overflow-y: auto;
}

.DetailView__PromptPreview {
  margin: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #ffffff;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>

