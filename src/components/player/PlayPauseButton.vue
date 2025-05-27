<template>
  <button
    @click.stop="onToggle"
    class="w-12 h-12 flex items-center justify-center bg-black/30 text-white"
  >
    <transition name="fade" mode="out-in">
      <component
        :is="isPlaying ? Pause : Play"
        :key="isPlaying"
        class="w-6 h-6"
        stroke="none"
        fill="currentColor"
      />
    </transition>
  </button>
</template>

<script setup>
import { Play, Pause } from 'lucide-vue-next'

defineProps({
  isPlaying: Boolean,
  onToggle: Function
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease-in-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
