<script setup lang="ts">
import Avatar from '../ui/Avatar.vue'
import type { InvestDoctor } from '../../types/investDoctor'

defineProps<{
  item: InvestDoctor
}>()
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
</style>

