<template>
  <div class="flex-1 overflow-hidden">
    <transition name="fade" mode="out-in">
      <div :key="mode">
        <!-- LIVE Mode -->
        <template v-if="mode === 'live'">
          <div class="w-full max-w-full">
            <p
              class="font-semibold font-sans text-sm uppercase text-white truncate"
              title="title"
            >
              {{ title }}
            </p>
          </div>

          <p class="text-xs text-gray-400 flex items-center gap-1">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-red"></span>
            </span>
            Playing on Dia!
          </p>
        </template>

        <!-- PODCAST Mode -->
        <template v-else>
          <div class="flex justify-center flex-col gap-1">
            <!-- Title -->
            <div class="w-full flex justify-center">
              <p
                class="text-xs text-white font-semibold font-sans uppercase truncate text-center max-w-[80%]"
                :title="title"
              >
                {{ title }}
              </p>
            </div>

            <!-- Timeline slider -->
            <input
              type="range"
              :min="0"
              :max="duration"
              step="0.1"
              :value="currentTime"
              @input="$emit('seek', $event)"
              class="w-full appearance-none bg-light-blue h-[2px] rounded outline-hidden
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:bg-pink
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:bg-pink
                [&::-moz-range-thumb]:w-3
                [&::-moz-range-thumb]:h-3
                [&::-moz-range-thumb]:rounded-full"
            />

            <!-- Duration -->
            <div class="font-sans text-center text-xs text-gray-400">
              {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
            </div>
          </div>
        </template>
      </div>
    </transition>
  </div>
</template>



<script setup>
import { NMarquee } from 'naive-ui'
defineProps({
  title: String,
  mode: String,
  currentTime: Number,
  duration: Number
})

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>
