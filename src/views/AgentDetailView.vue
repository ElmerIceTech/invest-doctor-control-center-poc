<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Dialog from '../components/ui/Dialog.vue'
import Avatar from '../components/ui/Avatar.vue'
import SystemPromptForm from '../components/InvestDoctor/SystemPromptForm.vue'
import { getAgents } from '../services/agents'
import {
  getAgentSystemPrompts,
  createAgentSystemPrompts,
  partialUpdateAgentSystemPrompt,
  deleteAgentSystemPrompt,
} from '../services/agentSystemPrompts'
import { getAgentUserMessages, generateAgentUserMsg } from '../services/agentUserMessages'
import type { InvestDoctor } from '../types/investDoctor'
import type { CreateAgentSystemPrompts } from '../types/CreateAgentSystemPrompts'

const route = useRoute()
const router = useRouter()

const agentId = route.params.id as string
const agent = ref<InvestDoctor | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const isCreatePromptOpen = ref(false)
const isPreviewPromptOpen = ref(false)
const formKey = ref(0)
const isSubmitting = ref(false)
const systemPromptFormRef = ref<{
  setAgentId: (id: number) => void
  reset: () => void
} | null>(null)
const systemPrompts = ref<any[]>([])
const isLoadingPrompts = ref(false)
const previewingPrompt = ref<any | null>(null)
const isEditingInPreview = ref(false)
const editingContent = ref('')
const deletingIds = ref<Set<number>>(new Set())
const userMessages = ref<any[]>([])
const isLoadingUserMessages = ref(false)
const isPreviewMessageOpen = ref(false)
const previewingMessage = ref<any | null>(null)
const isGeneratingUserMsg = ref(false)
const isCreateStockIntelligenceOpen = ref(false)
const stockIdInput = ref('2330.TW')

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

function formatDate(dateString: string): string {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}

function truncateContent(content: string, maxLength: number = 200): string {
  if (!content) return ''
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '...'
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
    // 處理 null、undefined 或空值的情況
    if (data === null || data === undefined) {
      systemPrompts.value = []
    } else if (Array.isArray(data)) {
      systemPrompts.value = data
    } else {
      systemPrompts.value = [data]
    }
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

function openPreviewPrompt(prompt: any) {
  previewingPrompt.value = { ...prompt }
  editingContent.value = prompt.content ?? ''
  isEditingInPreview.value = false
  isPreviewPromptOpen.value = true
}

// 監聽 dialog 關閉，重置編輯狀態
watch(isPreviewPromptOpen, (isOpen) => {
  if (!isOpen) {
    isEditingInPreview.value = false
    editingContent.value = ''
    previewingPrompt.value = null
  }
})

function startEditInPreview() {
  if (!previewingPrompt.value) return
  editingContent.value = previewingPrompt.value.content ?? ''
  isEditingInPreview.value = true
}

function cancelEditInPreview() {
  if (!previewingPrompt.value) return
  editingContent.value = previewingPrompt.value.content ?? ''
  isEditingInPreview.value = false
}

async function saveEditInPreview() {
  if (!previewingPrompt.value) return

  const content = editingContent.value.trim()
  if (!content) {
    alert('內容不能為空')
    return
  }

  isSubmitting.value = true
  try {
    const numericId = Number(agentId)
    const promptId = Number(
      previewingPrompt.value.id ?? previewingPrompt.value.system_prompt_id ?? 0,
    )

    if (isNaN(numericId) || isNaN(promptId)) {
      throw new Error('Invalid agent ID or prompt ID')
    }

    await partialUpdateAgentSystemPrompt({
      agentId: numericId,
      agentSystemPromptId: promptId,
      content: content,
    })

    // 更新本地數據
    previewingPrompt.value.content = content
    isEditingInPreview.value = false
    // 重新載入 system prompts 列表
    await loadSystemPrompts()
  } catch (err) {
    console.error('Failed to update system prompt:', err)
    alert('更新 Investment Master MD 失敗，請稍後再試')
  } finally {
    isSubmitting.value = false
  }
}

async function onDeletePrompt(prompt: any) {
  const promptId = prompt.id ?? prompt.system_prompt_id
  if (!promptId) {
    console.error('Invalid prompt ID')
    return
  }

  if (!confirm('確定要刪除此 Investment Master MD 嗎？')) {
    return
  }

  deletingIds.value.add(promptId)
  try {
    await deleteAgentSystemPrompt(promptId)
    // 如果正在預覽的是被刪除的 prompt，關閉預覽
    if (previewingPrompt.value && (previewingPrompt.value.id ?? previewingPrompt.value.system_prompt_id) === promptId) {
      isPreviewPromptOpen.value = false
      previewingPrompt.value = null
    }
    // 重新載入 system prompts 列表
    await loadSystemPrompts()
  } catch (err) {
    console.error('Failed to delete system prompt:', err)
    alert('刪除 Investment Master MD 失敗，請稍後再試')
  } finally {
    deletingIds.value.delete(promptId)
  }
}

async function loadUserMessages() {
  if (!agent.value) return

  const numericId = Number.parseInt(agent.value.id, 10)
  if (Number.isNaN(numericId)) {
    console.error('Invalid agent ID')
    return
  }

  isLoadingUserMessages.value = true
  try {
    const data = await getAgentUserMessages(numericId)
    console.log(data)
    if (data === null || data === undefined) {
      userMessages.value = []
    } else if (Array.isArray(data)) {
      userMessages.value = data
    } else {
      userMessages.value = [data]
    }
  } catch (err) {
    console.error('Failed to load user messages:', err)
    userMessages.value = []
  } finally {
    isLoadingUserMessages.value = false
  }
}

function openPreviewMessage(message: any) {
  previewingMessage.value = { ...message }
  isPreviewMessageOpen.value = true
}

function openCreateStockIntelligence() {
  stockIdInput.value = '2330.TW'
  isCreateStockIntelligenceOpen.value = true
}

function onCancelCreateStockIntelligence() {
  isCreateStockIntelligenceOpen.value = false
  stockIdInput.value = '2330.TW'
}

async function onCreateStockIntelligence() {
  if (!agent.value) return

  const numericId = Number.parseInt(agent.value.id, 10)
  if (Number.isNaN(numericId)) {
    console.error('Invalid agent ID')
    return
  }

  if (!stockIdInput.value.trim()) {
    alert('請輸入 Stock ID')
    return
  }

  isGeneratingUserMsg.value = true
  try {
    await generateAgentUserMsg(numericId, stockIdInput.value.trim())
    // 關閉 dialog
    isCreateStockIntelligenceOpen.value = false
    // 重新載入 user messages 列表
    await loadUserMessages()
  } catch (err) {
    console.error('Failed to generate user message:', err)
    alert('建立 Stock Intelligence 失敗，請稍後再試')
  } finally {
    isGeneratingUserMsg.value = false
  }
}

onMounted(async () => {
  await loadAgent()
  await loadSystemPrompts()
  await loadUserMessages()
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
    </header>

    <div v-if="isLoading" class="DetailView__Loading">載入中...</div>
    <div v-else-if="error" class="DetailView__Error">{{ error }}</div>
    <div v-else-if="agent" class="DetailView__Content">
      <!-- Agent Profile Section -->
      <div class="DetailView__ProfileCard">
        <div class="DetailView__ProfileHeader">
          <Avatar :name="agent.name" :size="80" />
          <div class="DetailView__ProfileInfo">
            <h1 class="DetailView__ProfileTitle">{{ agent.name }}</h1>
            <p class="DetailView__ProfileSubtitle">{{ agent.alias }}</p>
            <div class="DetailView__ProfileMeta">
              <span class="DetailView__MetaItem">
                <span class="DetailView__MetaLabel">ID</span>
                <span class="DetailView__MetaValue">{{ agent.id }}</span>
              </span>
              <span class="DetailView__MetaDivider">•</span>
              <span class="DetailView__MetaItem">
                <span class="DetailView__MetaLabel">建立於</span>
                <span class="DetailView__MetaValue">{{ formatDate(agent.createdAtIso) }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Investment Master MD Section -->
      <div class="DetailView__Section">
        <div class="DetailView__SectionHeader">
          <h2 class="DetailView__SectionTitle">
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
              class="DetailView__SectionIcon"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Investment Master MD
          </h2>
          <button
            v-if="systemPrompts.length > 0"
            class="DetailView__AddButton"
            type="button"
            @click="openCreatePrompt"
            aria-label="新增"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            新增
          </button>
        </div>
        <div v-if="isLoadingPrompts" class="DetailView__LoadingState">
          <div class="DetailView__Spinner"></div>
          <span>載入中...</span>
        </div>
        <div v-else-if="systemPrompts.length === 0" class="DetailView__EmptyState">
          <div class="DetailView__EmptyIcon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </div>
          <p class="DetailView__EmptyTitle">尚未建立 Investment Master MD</p>
          <p class="DetailView__EmptyDescription">開始建立您的第一個 Investment Master MD 文件</p>
          <button class="DetailView__EmptyButton" type="button" @click="openCreatePrompt">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            建立 Investment Master MD
          </button>
        </div>
        <div v-else class="DetailView__PromptsGrid">
          <div
            v-for="prompt in systemPrompts"
            :key="prompt.id ?? prompt.system_prompt_id"
            class="DetailView__PromptCard"
            @click="openPreviewPrompt(prompt)"
          >
            <div class="DetailView__PromptCardHeader">
              <div class="DetailView__PromptBadge">{{ prompt.version ?? 'N/A' }}</div>
              <span
                v-if="prompt.created_at || prompt.createdAtIso"
                class="DetailView__PromptTime"
              >
                {{ formatDate(prompt.created_at ?? prompt.createdAtIso) }}
              </span>
            </div>
            <div class="DetailView__PromptCardContent">
              <pre class="DetailView__PromptText">{{ truncateContent(prompt.content ?? '') }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- Stock Intelligence Section -->
      <div class="DetailView__Section">
        <div class="DetailView__SectionHeader">
          <h2 class="DetailView__SectionTitle">
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
              class="DetailView__SectionIcon"
            >
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            Stock Intelligence
          </h2>
          <button
            v-if="userMessages.length > 0"
            class="DetailView__AddButton"
            type="button"
            @click="openCreateStockIntelligence"
            :disabled="isGeneratingUserMsg"
            aria-label="建立 Stock Intelligence"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            {{ isGeneratingUserMsg ? '建立中...' : '建立 Stock Intelligence' }}
          </button>
        </div>
        <div v-if="isLoadingUserMessages" class="DetailView__LoadingState">
          <div class="DetailView__Spinner"></div>
          <span>載入中...</span>
        </div>
        <div v-else-if="userMessages.length === 0" class="DetailView__EmptyState">
          <div class="DetailView__EmptyIcon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <p class="DetailView__EmptyTitle">尚未建立 Stock Intelligence</p>
          <button
            class="DetailView__EmptyButton"
            type="button"
            @click="openCreateStockIntelligence"
            :disabled="isGeneratingUserMsg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            {{ isGeneratingUserMsg ? '建立中...' : '建立 Stock Intelligence' }}
          </button>
        </div>
        <div v-else class="DetailView__MessagesList">
          <div
            v-for="(message, index) in userMessages"
            :key="message.id ?? message.user_message_id ?? index"
            class="DetailView__MessageCard"
            @click="openPreviewMessage(message)"
          >
            <div class="DetailView__MessageHeader">
              <div class="DetailView__MessageStockId">
                <span class="DetailView__MessageStockIdLabel">Stock ID:</span>
                <span class="DetailView__MessageStockIdValue">{{ message.stock_id ?? 'N/A' }}</span>
              </div>
              <span
                v-if="message.created_at || message.createdAtIso"
                class="DetailView__MessageTime"
              >
                {{ formatDate(message.created_at ?? message.createdAtIso) }}
              </span>
            </div>
            <div class="DetailView__MessageContent">
              <pre class="DetailView__MessageText">{{
                truncateContent(message.content ?? message.message ?? '')
              }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Stock Intelligence Dialog -->
    <Dialog
      v-model="isCreateStockIntelligenceOpen"
      title="建立 Stock Intelligence"
      size="md"
    >
      <div class="DetailView__CreateStockIntelligenceForm">
        <div class="DetailView__FormField">
          <label class="DetailView__FormLabel" for="stock-id-input">
            Stock ID
          </label>
          <input
            id="stock-id-input"
            v-model="stockIdInput"
            type="text"
            class="DetailView__FormInput"
            placeholder="例如: 2330.TW"
            :disabled="isGeneratingUserMsg"
          />
          <p class="DetailView__FormHint">請輸入股票代碼，例如：2330.TW</p>
        </div>
        <div class="DetailView__FormActions">
          <button
            class="DetailView__FormCancelButton"
            type="button"
            @click="onCancelCreateStockIntelligence"
            :disabled="isGeneratingUserMsg"
          >
            取消
          </button>
          <button
            class="DetailView__FormSubmitButton"
            type="button"
            @click="onCreateStockIntelligence"
            :disabled="isGeneratingUserMsg || !stockIdInput.trim()"
          >
            {{ isGeneratingUserMsg ? '建立中...' : '建立' }}
          </button>
        </div>
      </div>
    </Dialog>

    <Dialog v-model="isCreatePromptOpen" title="建立 Investment Master MD" size="md">
      <SystemPromptForm
        ref="systemPromptFormRef"
        :key="formKey"
        :submitting="isSubmitting"
        :is-edit-mode="false"
        @submit="onCreatePrompt"
        @cancel="onCancelCreatePrompt"
      />
    </Dialog>

    <!-- Preview Dialog -->
    <Dialog
      v-model="isPreviewPromptOpen"
      :title="isEditingInPreview ? '編輯 Investment Master MD' : 'Investment Master MD 預覽'"
      size="xl"
    >
      <div v-if="previewingPrompt" class="DetailView__PreviewContent">
        <div class="DetailView__PreviewHeader">
          <div class="DetailView__PreviewMeta">
            <div class="DetailView__PreviewField">
              <span class="DetailView__PreviewLabel">版本號</span>
              <span class="DetailView__PreviewValue DetailView__PreviewValue--version">
                {{ previewingPrompt.version ?? 'N/A' }}
              </span>
            </div>
            <div class="DetailView__PreviewField">
              <span class="DetailView__PreviewLabel">建立時間</span>
              <span class="DetailView__PreviewValue DetailView__PreviewValue--mono">
                {{
                  formatDate(
                    previewingPrompt.created_at ?? previewingPrompt.createdAtIso ?? '',
                  )
                }}
              </span>
            </div>
          </div>
          <div v-if="!isEditingInPreview" class="DetailView__PreviewActions">
            <button
              class="DetailView__PreviewDeleteButton"
              type="button"
              :disabled="deletingIds.has(previewingPrompt.id ?? previewingPrompt.system_prompt_id)"
              @click="onDeletePrompt(previewingPrompt)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path
                  d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                ></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
              {{ deletingIds.has(previewingPrompt.id ?? previewingPrompt.system_prompt_id) ? '刪除中...' : '刪除' }}
            </button>
            <button
              class="DetailView__PreviewEditButton"
              type="button"
              @click="startEditInPreview"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              編輯
            </button>
          </div>
        </div>
        <div class="DetailView__PreviewBody">
          <div class="DetailView__PreviewContentField">
            <span class="DetailView__PreviewLabel">內容</span>
            <pre v-if="!isEditingInPreview" class="DetailView__PreviewContentText">{{
              previewingPrompt.content ?? ''
            }}</pre>
            <textarea
              v-else
              v-model="editingContent"
              class="DetailView__PreviewTextarea"
              placeholder="請輸入 Investment Master MD 內容..."
            />
          </div>
        </div>
        <div v-if="isEditingInPreview" class="DetailView__PreviewEditActions">
          <button
            class="DetailView__PreviewCancelButton"
            type="button"
            @click="cancelEditInPreview"
            :disabled="isSubmitting"
          >
            取消
          </button>
          <button
            class="DetailView__PreviewSaveButton"
            type="button"
            @click="saveEditInPreview"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? '儲存中...' : '儲存' }}
          </button>
        </div>
      </div>
    </Dialog>

    <!-- Stock Intelligence Preview Dialog -->
    <Dialog
      v-model="isPreviewMessageOpen"
      title="Stock Intelligence 預覽"
      size="xl"
    >
      <div v-if="previewingMessage" class="DetailView__PreviewContent">
        <div class="DetailView__PreviewHeader">
          <div class="DetailView__PreviewMeta">
            <div class="DetailView__PreviewField">
              <span class="DetailView__PreviewLabel">Stock ID</span>
              <span class="DetailView__PreviewValue DetailView__PreviewValue--version">
                {{ previewingMessage.stock_id ?? 'N/A' }}
              </span>
            </div>
            <div class="DetailView__PreviewField">
              <span class="DetailView__PreviewLabel">建立時間</span>
              <span class="DetailView__PreviewValue DetailView__PreviewValue--mono">
                {{
                  formatDate(
                    previewingMessage.created_at ?? previewingMessage.createdAtIso ?? '',
                  )
                }}
              </span>
            </div>
          </div>
        </div>
        <div class="DetailView__PreviewBody">
          <div class="DetailView__PreviewContentField">
            <span class="DetailView__PreviewLabel">內容</span>
            <pre class="DetailView__PreviewContentText">{{
              previewingMessage.content ?? previewingMessage.message ?? ''
            }}</pre>
          </div>
        </div>
      </div>
    </Dialog>
  </main>
</template>

<style scoped>
.DetailView {
  padding: 24px;
  max-width: 1200px;
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
  gap: 24px;
}

/* Profile Card */
.DetailView__ProfileCard {
  border: 1px solid #404040;
  border-radius: 16px;
  background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
  padding: 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
}

.DetailView__ProfileHeader {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

.DetailView__ProfileInfo {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.DetailView__ProfileTitle {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.5px;
}

.DetailView__ProfileSubtitle {
  margin: 0;
  font-size: 18px;
  color: #a3a3a3;
  font-weight: 400;
}

.DetailView__ProfileMeta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.DetailView__MetaItem {
  display: flex;
  align-items: center;
  gap: 6px;
}

.DetailView__MetaLabel {
  font-size: 13px;
  color: #6b7280;
}

.DetailView__MetaValue {
  font-size: 13px;
  color: #ffffff;
  font-weight: 500;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
}

.DetailView__MetaDivider {
  color: #404040;
  font-size: 14px;
}

/* Section */
.DetailView__Section {
  border: 1px solid #404040;
  border-radius: 16px;
  background: #1a1a1a;
  padding: 24px;
}

.DetailView__SectionHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #404040;
}

.DetailView__SectionTitle {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 10px;
}

.DetailView__SectionIcon {
  color: #f97316;
}

.DetailView__AddButton {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #f97316;
  background: transparent;
  color: #f97316;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.DetailView__AddButton:hover {
  background: #f97316;
  color: #000000;
}

/* Loading State */
.DetailView__LoadingState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  color: #a3a3a3;
  font-size: 14px;
}

.DetailView__Spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #404040;
  border-top-color: #f97316;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Empty State */
.DetailView__EmptyState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 20px;
  text-align: center;
}

.DetailView__EmptyIcon {
  color: #404040;
  margin-bottom: 8px;
}

.DetailView__EmptyTitle {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
}

.DetailView__EmptyDescription {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.DetailView__EmptyButton {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #f97316;
  background: #f97316;
  color: #000000;
  border-radius: 10px;
  padding: 12px 24px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  margin-top: 8px;
}

.DetailView__EmptyButton:hover {
  background: #ea580c;
  border-color: #ea580c;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

/* Prompts Grid */
.DetailView__PromptsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.DetailView__PromptCard {
  border: 1px solid #404040;
  border-radius: 12px;
  padding: 20px;
  background: #000000;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
}

.DetailView__PromptCard:hover {
  border-color: #f97316;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2);
}

.DetailView__PromptCardHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.DetailView__PromptBadge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background: rgba(249, 115, 22, 0.15);
  color: #f97316;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid rgba(249, 115, 22, 0.3);
}

.DetailView__PromptTime {
  font-size: 11px;
  color: #6b7280;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
  white-space: nowrap;
}

.DetailView__PromptCardContent {
  flex: 1;
  min-height: 120px;
}

.DetailView__PromptText {
  margin: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
  font-size: 12px;
  line-height: 1.7;
  color: #d1d5db;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow: hidden;
}

/* Stock Intelligence Styles */
.DetailView__MessagesList {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.DetailView__MessageCard {
  border: 1px solid #404040;
  border-radius: 12px;
  padding: 20px;
  background: #000000;
  transition: all 0.2s;
  cursor: pointer;
}

.DetailView__MessageCard:hover {
  border-color: #f97316;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.1);
  transform: translateY(-2px);
}

.DetailView__MessageHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 16px;
}

.DetailView__MessageStockId {
  display: flex;
  align-items: center;
  gap: 8px;
}

.DetailView__MessageStockIdLabel {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.DetailView__MessageStockIdValue {
  font-size: 13px;
  color: #f97316;
  font-weight: 600;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
}

.DetailView__MessageTime {
  font-size: 11px;
  color: #6b7280;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
  white-space: nowrap;
}

.DetailView__MessageContent {
  flex: 1;
}

.DetailView__MessageText {
  margin: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
  font-size: 13px;
  line-height: 1.7;
  color: #d1d5db;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Preview Dialog Styles */
.DetailView__PreviewContent {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  min-height: 0;
}

.DetailView__PreviewHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #404040;
  flex-shrink: 0;
}

.DetailView__PreviewMeta {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.DetailView__PreviewField {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.DetailView__PreviewLabel {
  font-size: 12px;
  color: #a3a3a3;
  font-weight: 500;
}

.DetailView__PreviewValue {
  font-size: 16px;
  color: #ffffff;
}

.DetailView__PreviewValue--version {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background: rgba(249, 115, 22, 0.15);
  color: #f97316;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid rgba(249, 115, 22, 0.3);
  width: fit-content;
}

.DetailView__PreviewValue--mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
  font-size: 13px;
  color: #a3a3a3;
}

.DetailView__PreviewDeleteButton {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #ef4444;
  background: transparent;
  color: #ef4444;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  white-space: nowrap;
}

.DetailView__PreviewDeleteButton:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #ef4444;
}

.DetailView__PreviewDeleteButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.DetailView__PreviewEditButton {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #f97316;
  background: #f97316;
  color: #000000;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  white-space: nowrap;
}

.DetailView__PreviewEditButton:hover {
  background: #ea580c;
  border-color: #ea580c;
}

.DetailView__PreviewBody {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-height: 0;
}

.DetailView__PreviewContentField {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-height: 0;
}

.DetailView__PreviewContentText {
  margin: 0;
  padding: 16px;
  border: 1px solid #404040;
  border-radius: 10px;
  background: #000000;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
  font-size: 13px;
  line-height: 1.7;
  color: #ffffff;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: calc(95vh - 300px);
  overflow-y: auto;
  flex: 1;
  min-height: 200px;
}

.DetailView__PreviewTextarea {
  width: 100%;
  padding: 16px;
  border: 1px solid #404040;
  border-radius: 10px;
  background: #000000;
  color: #ffffff;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
  font-size: 13px;
  line-height: 1.7;
  resize: vertical;
  outline: none;
  height: calc(95vh - 380px);
  min-height: 300px;
  max-height: calc(95vh - 380px);
  box-sizing: border-box;
}

.DetailView__PreviewTextarea:focus {
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.2);
}

.DetailView__PreviewTextarea::placeholder {
  color: #525252;
}

.DetailView__PreviewActions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.DetailView__PreviewEditActions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid #404040;
  flex-shrink: 0;
}

.DetailView__PreviewCancelButton {
  border: 1px solid #404040;
  background: #000000;
  color: #ffffff;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.DetailView__PreviewCancelButton:hover:not(:disabled) {
  background: #1a1a1a;
  border-color: #f97316;
  color: #f97316;
}

.DetailView__PreviewCancelButton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.DetailView__PreviewSaveButton {
  border: 1px solid #f97316;
  background: #f97316;
  color: #000000;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.DetailView__PreviewSaveButton:hover:not(:disabled) {
  background: #ea580c;
  border-color: #ea580c;
}

.DetailView__PreviewSaveButton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Create Stock Intelligence Form Styles */
.DetailView__CreateStockIntelligenceForm {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.DetailView__FormField {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.DetailView__FormLabel {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
}

.DetailView__FormInput {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #404040;
  border-radius: 8px;
  background: #000000;
  color: #ffffff;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
}

.DetailView__FormInput:focus {
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.DetailView__FormInput:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.DetailView__FormInput::placeholder {
  color: #525252;
}

.DetailView__FormHint {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.DetailView__FormActions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 8px;
}

.DetailView__FormCancelButton {
  border: 1px solid #404040;
  background: #000000;
  color: #ffffff;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.DetailView__FormCancelButton:hover:not(:disabled) {
  background: #1a1a1a;
  border-color: #f97316;
  color: #f97316;
}

.DetailView__FormCancelButton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.DetailView__FormSubmitButton {
  border: 1px solid #f97316;
  background: #f97316;
  color: #000000;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.DetailView__FormSubmitButton:hover:not(:disabled) {
  background: #ea580c;
  border-color: #ea580c;
}

.DetailView__FormSubmitButton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

