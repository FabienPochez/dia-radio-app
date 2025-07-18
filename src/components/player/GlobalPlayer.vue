<template>
  <div class="w-full h-[60px] bg-neutral-900 text-white rounded-t-xl overflow-hidden flex items-center gap-0 pr-5">
    <!-- Cover -->
    <CoverImage :src="current.mode === 'live' ? liveMeta.cover : current.cover || '/img/fallback-live.jpg'" />
    <!-- Play / Pause -->
    <PlayPauseButton
      class="h-full aspect-square bg-transparent!"
      :isPlaying="isPlaying"
      :onToggle="current.mode === 'live' ? toggleLivePlayback : togglePodcastPlayback"
    />
    <!-- Track Info -->
    <TrackInfo
      :title="current.mode === 'live' ? liveMeta.title : current.title || 'Podcast Episode'"
      :mode="current.mode"
      :currentTime="currentTime"
      :duration="duration"
      @seek="onSliderChange"
    />
    <!-- Drawer Toggle Button -->
    <!-- Drawer Toggle Button (must stay in layout for proper placement) -->
    <Drawer v-model:open="showDrawer" direction="bottom">
      <DrawerOverlay />
      <DrawerTrigger as-child>
        <button class="ml-auto p-2 focus:outline-hidden">
          <ChevronUp class="w-8 h-8 text-white" />
        </button>
      </DrawerTrigger>
      <!-- Now Playing Drawer (content imported separately) -->
      <NowPlayingDrawer v-model:open="showDrawer" />
    </Drawer>


    
  </div>


  <audio ref="audioRef" :src="current.src" preload="none" class="hidden" />
</template>


<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'

import { usePlayer, audioRef } from '@/composables/usePlayer'
import CoverImage from '@/components/shared/CoverImage.vue'
import TrackInfo from '@/components/player/TrackInfo.vue'
import PlayPauseButton from '@/components/player/PlayPauseButton.vue'
import { ChevronUp } from 'lucide-vue-next'
import NowPlayingDrawer from '@/components/layout/NowPlayingDrawer.vue'
import {
  Drawer,
  DrawerContent,
  DrawerTrigger
} from '@/components/ui/drawer'

const { current, isPlaying, pause, setAndPlay } = usePlayer()

const showDrawer = ref(false)
const drawerHeight = ref('auto')
const drawerContentRef = ref(null)

watch(showDrawer, (val) => {
  if (val && drawerContentRef.value) {
    nextTick(() => {
      const contentHeight = drawerContentRef.value.scrollHeight
      drawerHeight.value = `${Math.min(contentHeight, window.innerHeight * 0.9)}px`
    })
  }
})

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
  cover: current.cover,
  genres: current.genres  // must be passed here
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
  } catch {
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
