<script setup lang="ts">
import Avatar from '../ui/Avatar.vue'
import type { InvestDoctor } from '../../types/investDoctor'

const props = withDefaults(
  defineProps<{
    item: InvestDoctor
    deleting?: boolean
  }>(),
  {
    deleting: false,
  },
)

const emit = defineEmits<{
  delete: [id: string]
}>()

function handleDelete() {
  if (confirm('確定要刪除此投資大師嗎？')) {
    emit('delete', props.item.id)
  }
}
</script>

<template>
  <article class="Card">
    <div class="Card__Header">
      <div class="Card__HeaderContent">
        <Avatar :name="item.name" :size="48" />
        <div class="Card__TitleGroup">
          <h3 class="Card__Title">{{ item.name }}</h3>
          <p class="Card__Subtitle">{{ item.alias }}</p>
        </div>
      </div>
    </div>
    <div class="Card__Body">
      <div class="Card__Field">
        <span class="Card__Label">建立時間</span>
        <span class="Card__Value Card__Value--mono">{{ item.createdAtIso }}</span>
      </div>
    </div>
    <div class="Card__Actions">
      <button
        class="Card__DeleteButton"
        type="button"
        :disabled="props.deleting"
        @click="handleDelete"
        aria-label="刪除"
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
          <path d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
        {{ props.deleting ? '刪除中...' : '刪除' }}
      </button>
    </div>
  </article>
</template>

<style scoped>
.Card {
  border: 1px solid #404040;
  border-radius: 12px;
  background: #1a1a1a;
  padding: 16px;
  transition: box-shadow 0.2s, border-color 0.2s;
}

.Card:hover {
  border-color: #f97316;
  box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.3), 0 2px 4px -1px rgba(249, 115, 22, 0.2);
}

.Card__Header {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #404040;
}

.Card__HeaderContent {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.Card__TitleGroup {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  text-align: left;
}

.Card__Title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  text-align: left;
}

.Card__Subtitle {
  margin: 0;
  font-size: 13px;
  color: #a3a3a3;
  font-weight: 400;
  text-align: left;
}

.Card__Body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.Card__Field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.Card__Label {
  font-size: 12px;
  color: #a3a3a3;
  font-weight: 500;
}

.Card__Value {
  font-size: 14px;
  color: #ffffff;
}

.Card__Value--mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
  font-size: 12px;
  color: #a3a3a3;
}

.Card__Actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #404040;
}

.Card__DeleteButton {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #404040;
  background: transparent;
  color: #a3a3a3;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.Card__DeleteButton:hover:not(:disabled) {
  border-color: #dc2626;
  color: #dc2626;
  background: rgba(220, 38, 38, 0.1);
}

.Card__DeleteButton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

