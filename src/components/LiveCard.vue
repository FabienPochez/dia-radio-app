

<template>
  <div class="px-8 py-4 max-w-4xl mx-auto">
    <!-- LIVE NOW label -->
    <div class="flex items-center space-x-2 mb-4">
      <span class="h-4 w-4 text-2xl rounded-full bg-red animate-pulse"></span>
      <span class="h2 text-white font-sans text-2xl uppercase font-bold">Playing Now</span>
    </div>
  <div
    class="relative w-full aspect-square overflow-hidden group cursor-pointer"
    @click="toggleLive"
  >
    <!-- Background image -->
    <img :src="coverImage" alt="Live Cover" class="w-full h-full object-cover" />

    <!-- Overlay -->
    <div class="absolute inset-0 bg-black/40"></div>

 
  
    <!-- Show title & time -->
    <div class="absolute bottom-3 left-3 text-white">
      <h3 class="font-bold text-lg leading-tight">{{ title }}</h3>
      <p class="text-sm text-white/80">{{ timeRange }}</p>
    </div>

    <!-- Play/Pause button -->

  <PlayPauseButton
    class="absolute bottom-2 right-2"
    :isPlaying="isLivePlaying"
    :onToggle="toggleLive"
  />

  </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePlayer } from '../composables/usePlayer'
import PlayPauseButton from './PlayPauseButton.vue'

const liveTrack = ref(null)

async function fetchLiveTrack() {
  try {
    const res = await fetch('https://api.radioking.io/widget/radio/dia-radio/track/current')
    if (!res.ok) throw new Error(`Radio API error: ${res.status}`)
    liveTrack.value = await res.json()
  } catch (e) {
    console.warn('⚠️ Failed to fetch live track info:', e.message)
    liveTrack.value = null
  }
}


onMounted(() => {
  fetchLiveTrack()
  setInterval(fetchLiveTrack, 30000)
})

const coverImage = computed(() =>
  liveTrack.value?.cover || '/img/fallback-live.jpg'
)

const title = computed(() =>
  liveTrack.value?.title || 'Dia Radio Live Feed'
)

const timeRange = '10:00 – 12:00'

const streamUrl = 'https://www.radioking.com/play/dia-radio/446203'
const { play, pause, current, isPlaying } = usePlayer()

const isLivePlaying = computed(() =>
  isPlaying.value && current.mode === 'live'
)

function toggleLive() {
  const isCurrentLive = current.mode === 'live' && current.src === streamUrl

  if (isCurrentLive && isPlaying.value) {
    pause()
  } else {
    play(streamUrl, title.value, 'live', coverImage.value)
  }
}

</script>
