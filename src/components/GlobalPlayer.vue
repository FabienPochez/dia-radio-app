<template>
  <div class="w-full h-[60px] bg-neutral-800 text-white rounded-tl-xl rounded-tr-xl overflow-hidden flex items-center gap-3">
    <!-- Cover Image -->
    <img
      :src="current.mode === 'live' ? liveMeta.cover : current.cover || '/img/fallback-live.jpg'"
      class="w-[58px] h-[58px] object-cover"
      alt="Cover"
    />
    
    <!-- Track Info -->
    <div class="flex-1 overflow-hidden">
      <p class="font-semibold text-sm truncate">
        {{ current.mode === 'live' ? liveMeta.title : current.title || 'Podcast Episode' }}
      </p>
      <p class="text-xs text-gray-400 flex items-center gap-1">
        <template v-if="current.mode === 'live'">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-red"></span>
          </span>
          Playing on Dia!
        </template>

      </p>
      <!-- Timeline -->
      <div v-if="current.mode === 'podcast'" class="">
        <input
          type="range"
          min="0"
          :max="duration"
          step="0.1"
          :value="currentTime"
          @input="onSliderChange"
          class="w-full appearance-none bg-light-blue h-[2px] rounded outline-none
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
        <div class="text-xs text-gray-400 ">
          {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
        </div>
      </div>
    </div>
    <!-- Play/Pause Button -->
    <PlayPauseButton class="w-[58px] h-[58px]"
      :isPlaying="isPlaying"
      :onToggle="current.mode === 'live' ? toggleLivePlayback : togglePodcastPlayback"
    />

    
  </div>
  <audio ref="audioRef" :src="current.src" preload="none" class="hidden" />

</template>

<script setup>
import { ref, watch, onUnmounted, onMounted, watchEffect } from 'vue'
import { usePlayer, audioRef } from '../composables/usePlayer'
import PlayPauseButton from './PlayPauseButton.vue'

const { current, isPlaying, play, pause, setSource } = usePlayer()

const liveMeta = ref({
  title: 'Live on Dia!',
  cover: '/img/fallback-live.jpg'
})

let intervalId = null
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

  if (current.mode === 'live') {
    fetchLiveTrack()
    intervalId = setInterval(fetchLiveTrack, 30000)
  }
})

function onSliderChange(event) {
  const newTime = parseFloat(event.target.value)
  currentTime.value = newTime
  audioRef.value.currentTime = newTime
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
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
    updateMediaSession(liveMeta.value.title, 'Live on Dia!', liveMeta.value.cover)
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
    updateMediaSession(current.title, 'Podcast Episode', current.cover)
  }
}



watch(current, (newVal) => {
  if (newVal?.mode === 'live') {
    fetchLiveTrack()
    intervalId = setInterval(fetchLiveTrack, 30000)
  } else {
    clearInterval(intervalId)
    liveMeta.value = {
      title: 'Live on Dia!',
      cover: '/img/fallback-live.jpg'
    }
    if (newVal?.mode === 'podcast' && isPlaying.value) {
    updateMediaSession(newVal.title, 'Podcast Episode', newVal.cover)
  }
  }
})

onUnmounted(() => {
  clearInterval(intervalId)
})

async function fetchLiveTrack() {
  try {
    const res = await fetch('https://api.radioking.io/widget/radio/dia-radio/track/current')
    const data = await res.json()
    liveMeta.value.title = data.title || 'Live on Dia!'
    liveMeta.value.cover = data.cover || '/img/fallback-live.jpg'

    if (current.mode === 'live' && isPlaying.value) {
      updateMediaSession(liveMeta.value.title, 'Live on Dia!', liveMeta.value.cover)
    }
  } catch (e) {
    liveMeta.value.title = 'Live on Dia!'
    liveMeta.value.cover = '/img/fallback-live.jpg'
  }
}

function updateMediaSession(title, artist, artworkUrl) {
  if ('mediaSession' in navigator && audioRef.value) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      album: 'Dia Radio',
      artwork: [
        { src: artworkUrl, sizes: '512x512', type: 'image/jpeg' }
      ]
    })

    navigator.mediaSession.setActionHandler('play', () => {
      audioRef.value.play()
    })
    navigator.mediaSession.setActionHandler('pause', () => {
      audioRef.value.pause()
    })
  }
}
</script>
