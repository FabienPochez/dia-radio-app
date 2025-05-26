<template>
  <nav class="flex justify-around items-center bg-neutral-900 text-white pt-2 pb-8 border-t border-pink">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      @click="$emit('update:tab', tab.id)"
      class="flex flex-col items-center text-xs px-2"
    >
      <div :class="['text-xl', currentTab === tab.id ? 'text-white' : 'text-gray-500']">
        <component :is="tab.icon" />
      </div>
      <span :class="currentTab === tab.id ? 'text-white' : 'text-gray-400'">
        {{ tab.label }}
      </span>
    </button>
  </nav>
</template>

<script setup>
import { shallowRef } from 'vue'
import { RadioIcon, CassetteTape, InfoIcon, Bug } from 'lucide-vue-next'

const props = defineProps({
  currentTab: String
})

const tabs = shallowRef([
  { id: 'live', label: 'Live', icon: RadioIcon },
  { id: 'shows', label: 'Shows', icon: CassetteTape },
  { id: 'about', label: 'About', icon: InfoIcon },
  { id: 'bugs', label: 'Bugs', icon: Bug }
])
</script>

<style scoped>
nav button {
  flex: 1;
}
</style>
