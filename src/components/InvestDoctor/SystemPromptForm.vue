<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { CreateAgentSystemPrompts } from '../../types/CreateAgentSystemPrompts'

const props = withDefaults(
  defineProps<{
    submitting?: boolean
  }>(),
  {
    submitting: false,
  },
)

const emit = defineEmits<{
  submit: [payload: CreateAgentSystemPrompts]
  cancel: []
}>()

const form = reactive<CreateAgentSystemPrompts>({
  agentId: 0,
  version: '',
  content: '',
})

const isTouched = ref(false)

const errors = computed(() => {
  const next: Partial<Record<keyof CreateAgentSystemPrompts, string>> = {}

  if (!form.version.trim()) next.version = '請輸入版本號'
  if (!form.content.trim()) next.content = '請輸入內容'

  return next
})

const isValid = computed(() => Object.keys(errors.value).length === 0)

function onCancel() {
  emit('cancel')
}

function onSubmit() {
  isTouched.value = true
  if (!isValid.value) return

  emit('submit', {
    agentId: form.agentId,
    version: form.version.trim(),
    content: form.content.trim(),
  })
}

// 暴露方法供父組件設置 agentId
defineExpose({
  setAgentId: (id: number) => {
    form.agentId = id
  },
  reset: () => {
    form.version = ''
    form.content = ''
    isTouched.value = false
  },
})
</script>

<template>
  <form class="SystemPromptForm" @submit.prevent="onSubmit">
    <div class="SystemPromptForm__Fields">
      <div class="SystemPromptForm__Field">
        <label class="SystemPromptForm__Label" for="version">版本號</label>
        <input
          id="version"
          v-model="form.version"
          class="SystemPromptForm__Input"
          type="text"
          autocomplete="off"
          :aria-invalid="isTouched && !!errors.version"
          :aria-describedby="errors.version ? 'versionError' : undefined"
          placeholder="例如：v1.0.0"
        />
        <p v-if="isTouched && errors.version" id="versionError" class="SystemPromptForm__Error">
          {{ errors.version }}
        </p>
      </div>

      <div class="SystemPromptForm__Field">
        <label class="SystemPromptForm__Label" for="content">內容 (Markdown)</label>
        <textarea
          id="content"
          v-model="form.content"
          class="SystemPromptForm__Textarea"
          rows="10"
          :aria-invalid="isTouched && !!errors.content"
          :aria-describedby="errors.content ? 'contentError' : undefined"
          placeholder="請輸入 Investment Master MD 內容..."
        />
        <p v-if="isTouched && errors.content" id="contentError" class="SystemPromptForm__Error">
          {{ errors.content }}
        </p>
      </div>
    </div>

    <div class="SystemPromptForm__Actions">
      <button
        class="SystemPromptForm__Button SystemPromptForm__Button--secondary"
        type="button"
        @click="onCancel"
      >
        取消
      </button>
      <button class="SystemPromptForm__Button" type="submit" :disabled="props.submitting">
        建立
      </button>
    </div>
  </form>
</template>

<style scoped>
.SystemPromptForm__Fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.SystemPromptForm__Field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.SystemPromptForm__Label {
  font-size: 12px;
  color: #a3a3a3;
}

.SystemPromptForm__Input,
.SystemPromptForm__Textarea {
  border: 1px solid #404040;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
  background: #000000;
  color: #ffffff;
  font-family: inherit;
}

.SystemPromptForm__Textarea {
  resize: vertical;
  min-height: 200px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
}

.SystemPromptForm__Input:focus,
.SystemPromptForm__Textarea:focus {
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.2);
}

.SystemPromptForm__Input::placeholder,
.SystemPromptForm__Textarea::placeholder {
  color: #525252;
}

.SystemPromptForm__Error {
  margin: 0;
  font-size: 12px;
  color: #f97316;
}

.SystemPromptForm__Actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.SystemPromptForm__Button {
  border: 1px solid #f97316;
  background: #f97316;
  color: #000000;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s, border-color 0.2s;
}

.SystemPromptForm__Button:hover:not(:disabled) {
  background: #ea580c;
  border-color: #ea580c;
}

.SystemPromptForm__Button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.SystemPromptForm__Button--secondary {
  background: #000000;
  color: #ffffff;
  border-color: #404040;
}

.SystemPromptForm__Button--secondary:hover {
  background: #1a1a1a;
  border-color: #f97316;
  color: #f97316;
}
</style>

