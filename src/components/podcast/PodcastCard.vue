<template>
  <div class="w-full">
    <div class="border-b border-pink  text-white overflow-hidden relative mb-3">
      <!-- Image wrapper with 4:3 ratio -->
      <div class="relative aspect-[3/2] w-full">
        <img
          :src="image"
          :alt="title"
          class="object-cover rounded-lg w-full h-full"
        />
        <!-- Play button -->
        <PlayPauseButton
          class="absolute bottom-0 left-0"
          :isPlaying="isPlaying"
          :onToggle="toggle"
        />
      </div>

      <!-- Title -->
      <div class="pt-5">
        <h3 class="uppercase font-semibold">
          {{ title }}
        </h3>
        <!-- Optional subtitle or date can be added here later -->
      </div>
      <!-- genres -->
       <div class="pt-7 pb-5">
        <span
          v-for="genre in genres"
          :key="genre"
          class="text-xs font-sans px-2 py-1 mr-2 border border-white  rounded-full mr-1 mb-1 inline-block"
          >
          {{ genre }}
        </span>
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
  toggle: Function,
  genres: {
    type: Array,
    default: () => [],
  },
})
</script>
