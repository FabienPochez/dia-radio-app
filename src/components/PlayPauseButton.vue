<!-- components/PlayPauseButton.vue -->
<template>
  <button
    @click.stop="onToggle"
    class="w-[60px] h-[60px] flex items-center justify-center bg-black/30 text-white"
  >
    <span class="text-3xl">{{ isPlaying ? '⏸' : '▶' }}</span>
  </button>
</template>

<script setup>
defineProps({
  isPlaying: Boolean,
  onToggle: Function
})
</script>
