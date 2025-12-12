<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { InvestDoctorCreateInput } from '../../types/investDoctor'

const props = withDefaults(
  defineProps<{
    submitting?: boolean
  }>(),
  {
    submitting: false,
  },
)

const emit = defineEmits<{
  submit: [payload: InvestDoctorCreateInput]
  cancel: []
}>()

const form = reactive<InvestDoctorCreateInput>({
  name: '',
  alias: '',
})

const isTouched = ref(false)

const errors = computed(() => {
  const next: Partial<Record<keyof InvestDoctorCreateInput, string>> = {}

  if (!form.name.trim()) next.name = '請輸入名稱'
  if (!form.alias.trim()) next.alias = '請輸入別名'

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
    name: form.name.trim(),
    alias: form.alias.trim(),
  })
}
</script>

<template>
  <form class="CreateForm" @submit.prevent="onSubmit">
    <div class="CreateForm__Grid">
      <div class="CreateForm__Field">
        <label class="CreateForm__Label" for="name">名稱</label>
        <input
          id="name"
          v-model="form.name"
          class="CreateForm__Input"
          type="text"
          autocomplete="off"
          :aria-invalid="isTouched && !!errors.name"
          :aria-describedby="errors.name ? 'nameError' : undefined"
          placeholder="請輸入名稱"
        />
        <p v-if="isTouched && errors.name" id="nameError" class="CreateForm__Error">
          {{ errors.name }}
        </p>
      </div>

      <div class="CreateForm__Field">
        <label class="CreateForm__Label" for="alias">別名</label>
        <input
          id="alias"
          v-model="form.alias"
          class="CreateForm__Input"
          type="text"
          autocomplete="off"
          :aria-invalid="isTouched && !!errors.alias"
          :aria-describedby="errors.alias ? 'aliasError' : undefined"
          placeholder="請輸入別名"
        />
        <p v-if="isTouched && errors.alias" id="aliasError" class="CreateForm__Error">
          {{ errors.alias }}
        </p>
      </div>
    </div>

    <div class="CreateForm__Actions">
      <button class="CreateForm__Button CreateForm__Button--secondary" type="button" @click="onCancel">
        取消
      </button>
      <button class="CreateForm__Button" type="submit" :disabled="props.submitting">
        新增
      </button>
    </div>
  </form>
</template>

<style scoped>

.CreateForm__Grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.CreateForm__Field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.CreateForm__Field--span2 {
  grid-column: 1 / -1;
}

.CreateForm__Label {
  font-size: 12px;
  color: #a3a3a3;
}

.CreateForm__Input {
  border: 1px solid #404040;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
  background: #000000;
  color: #ffffff;
}

.CreateForm__Input:focus {
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.2);
}

.CreateForm__Input::placeholder {
  color: #525252;
}

.CreateForm__Error {
  margin: 0;
  font-size: 12px;
  color: #f97316;
}

.CreateForm__Actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
}

.CreateForm__Button {
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

.CreateForm__Button:hover:not(:disabled) {
  background: #ea580c;
  border-color: #ea580c;
}

.CreateForm__Button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.CreateForm__Button--secondary {
  background: #000000;
  color: #ffffff;
  border-color: #404040;
}

.CreateForm__Button--secondary:hover {
  background: #1a1a1a;
  border-color: #f97316;
  color: #f97316;
}
</style>


