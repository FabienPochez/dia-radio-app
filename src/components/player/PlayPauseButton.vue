<template>
  <button
    @click.stop="handleToggle"
    class="w-12 h-12 flex items-center justify-center bg-black/30 text-white"
  >
    <transition name="fade" mode="out-in">
      <component
        v-if="!isLoading"
        :is="isPlaying ? Pause : Play"
        :key="isPlaying"
        class="w-6 h-6"
        stroke="none"
        fill="currentColor"
      />
      <n-spin
          v-else
          size="small"
          stroke="#ffffff"
          class="!transition-all !duration-700"
      />
    </transition>
  </button>
</template>

<script setup>
import { ref } from 'vue'
import { Play, Pause } from 'lucide-vue-next'
import { NSpin } from 'naive-ui'

const props = defineProps({
  isPlaying: Boolean,
  onToggle: Function
})
const emit = defineEmits(['playback-ready'])

const isLoading = ref(false)

const handleToggle = async () => {
  isLoading.value = true
  await props.onToggle()
  // Wait for a signal that playback is ready (could be setTimeout, event, etc.)
  setTimeout(() => {
    isLoading.value = false
    emit('playback-ready')
  }, 500) // you can adjust this delay or trigger it from outside
}
</script>
