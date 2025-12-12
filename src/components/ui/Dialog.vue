<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
  }>(),
  {
    title: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function close() {
  emit('update:modelValue', false)
}

function onBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    close()
  }
}

function onEscapeKey(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.modelValue) {
    close()
  }
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', onEscapeKey)
    } else {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onEscapeKey)
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', onEscapeKey)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="modelValue"
        class="Dialog"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? 'dialog-title' : undefined"
        @click="onBackdropClick"
      >
        <div class="Dialog__Content">
          <header v-if="title" class="Dialog__Header">
            <h2 id="dialog-title" class="Dialog__Title">{{ title }}</h2>
            <button
              class="Dialog__CloseButton"
              type="button"
              aria-label="關閉"
              @click="close"
            >
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
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </header>
          <div class="Dialog__Body">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.Dialog {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
}

.Dialog__Content {
  position: relative;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  background: #1a1a1a;
  border: 1px solid #f97316;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(249, 115, 22, 0.3), 0 10px 10px -5px rgba(249, 115, 22, 0.2);
}

.Dialog__Header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 0 20px;
}

.Dialog__Title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
}

.Dialog__CloseButton {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 8px;
  color: #a3a3a3;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.Dialog__CloseButton:hover {
  background: #2a2a2a;
  color: #f97316;
}

.Dialog__CloseButton:focus {
  outline: 2px solid #f97316;
  outline-offset: 2px;
}

.Dialog__Body {
  padding: 20px;
}

/* Transition animations */
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-enter-active .Dialog__Content,
.dialog-leave-active .Dialog__Content {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from .Dialog__Content,
.dialog-leave-to .Dialog__Content {
  transform: scale(0.95);
  opacity: 0;
}
</style>

