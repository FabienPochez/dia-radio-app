<template>
  <div class="w-full">
    <div class="bg-neutral-900 rounded-l text-white overflow-hidden relative">
      <!-- Image wrapper with 4:3 ratio -->
      <div class="relative aspect-[3/2] w-full">
        <img
          :src="image"
          :alt="title"
          class="object-cover w-full h-full"
        />
        <!-- Play button -->
        <PlayPauseButton
          class="absolute bottom-0 right-0"
          :isPlaying="isPlaying"
          :onToggle="toggle"
        />
      </div>

      <!-- Title -->
      <div class="p-3">
        <h3 class=" text-lg leading-tight">
          {{ title }}
        </h3>
        <!-- Optional subtitle or date can be added here later -->
      </div>
    </div>
  </div>
</template>

<script setup>
import PlayPauseButton from '@/components/player/PlayPauseButton.vue'

defineProps({
  title: String,
  image: String,
  isPlaying: Boolean,
  toggle: Function
})
</script>