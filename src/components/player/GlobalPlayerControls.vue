<template>
  <div class="w-full text-white">
    <!-- Live Mode -->
    <div v-if="current.mode === 'live'" class="flex items-center justify-center gap-4">
      <div class="flex-1 h-px bg-white/20"></div>
      <PlayPauseButton
        :isPlaying="isPlaying"
        :onToggle="toggleLivePlayback"
        class="bg-transparent!"
      />
      <div class="flex-1 h-px bg-white/20"></div>
    </div>

    <!-- Podcast Mode -->
    <div v-else class="flex flex-col items-center gap-2">
      <PlayPauseButton
        :isPlaying="isPlaying"
        :onToggle="togglePodcastPlayback"
        class="bg-transparent!"
      />
      <input
        type="range"
        :min="0"
        :max="duration"
        step="0.1"
        :value="currentTime"
        @input="onSliderChange"
        class="w-full appearance-none bg-white/30 h-[2px] rounded outline-hidden
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
      <div class="text-xs text-gray-400 font-mono">
        {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { usePlayer, audioRef } from '@/composables/usePlayer'
import PlayPauseButton from '@/components/player/PlayPauseButton.vue'

const { current, isPlaying, pause, setAndPlay } = usePlayer()

const liveMeta = ref({
  title: 'Live on Dia!',
  cover: '/img/fallback-live.jpg'
})

const currentTime = ref(0)
const duration = ref(0)
const isManuallySeeking = ref(false)

onMounted(() => {
  audioRef.value.addEventListener('timeupdate', () => {
    if (!isManuallySeeking.value) {
      currentTime.value = audioRef.value.currentTime
      duration.value = audioRef.value.duration || 0
    }
  })
})

onUnmounted(() => {
  audioRef.value?.removeEventListener('timeupdate', () => {})
})

function onSliderChange(event) {
  const newTime = parseFloat(event.target.value)
  currentTime.value = newTime
  audioRef.value.currentTime = newTime
}

function toggleLivePlayback() {
  if (current.mode === 'live' && isPlaying.value) {
    pause()
  } else {
    setAndPlay({
      src: 'https://play.radioking.io/dia-radio/446203',
      title: liveMeta.value.title,
      mode: 'live',
      cover: liveMeta.value.cover
    })
  }
}

function togglePodcastPlayback() {
  if (current.mode === 'podcast' && isPlaying.value) {
    pause()
  } else {
    setAndPlay({
      src: current.src,
      title: current.title,
      mode: 'podcast',
      cover: current.cover
    })
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>
