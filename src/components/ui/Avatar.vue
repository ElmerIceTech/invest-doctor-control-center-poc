<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    name: string
    size?: number
  }>(),
  {
    size: 40,
  },
)

// 根據 name 生成 hash 值
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

// 預定義的顏色列表（橘黑主題的各種色調）
const colorPalette = [
  '#f97316', // 主橘色
  '#ea580c', // 深橘色
  '#c2410c', // 更深橘色
  '#ff8c42', // 淺橘色
  '#ff6b1a', // 亮橘色
  '#d97706', // 金橘色
  '#f59e0b', // 琥珀色
  '#e67e22', // 橙橘色
]

// 根據 hash 選擇顏色
const backgroundColor = computed(() => {
  const hash = hashString(props.name)
  const index = hash % colorPalette.length
  return colorPalette[index]
})

// 取得第一個字符（支援中文和英文）
const initial = computed(() => {
  if (!props.name) return '?'
  const firstChar = props.name.charAt(0).toUpperCase()
  // 如果是中文字符，直接返回；如果是英文字母，返回大寫字母
  return /[\u4e00-\u9fa5]/.test(firstChar) ? firstChar : firstChar
})
</script>

<template>
  <div
    class="Avatar"
    :style="{
      width: `${props.size}px`,
      height: `${props.size}px`,
      backgroundColor: backgroundColor,
    }"
  >
    <span
      class="Avatar__Initial"
      :style="{
        fontSize: `${props.size * 0.5}px`,
      }"
    >
      {{ initial }}
    </span>
  </div>
</template>

<style scoped>
.Avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
  font-weight: 600;
  color: #000000;
}

.Avatar__Initial {
  line-height: 1;
  user-select: none;
}
</style>

