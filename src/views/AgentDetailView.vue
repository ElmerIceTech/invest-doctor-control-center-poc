<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Avatar from '../components/ui/Avatar.vue'
import { getAgents } from '../services/agents'
import type { InvestDoctor } from '../types/investDoctor'

const route = useRoute()
const router = useRouter()

const agentId = route.params.id as string
const agent = ref<InvestDoctor | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

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

onMounted(() => {
  loadAgent()
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
    </div>
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
</style>

