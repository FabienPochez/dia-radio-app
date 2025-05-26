// usePlayer.js
import { reactive, readonly, ref, onMounted, onUnmounted } from 'vue'
import { logPlayerEvent } from './playerLogs.js'

const state = reactive({
  current: {
    title: '',
    src: '',
    mode: '',
    cover: ''
  },
  isPlaying: false
})

export const audioRef = ref(null)
const isPlayingRef = ref(false)

export function usePlayer() {
  if (!audioRef.value) {
    audioRef.value = new Audio()
    audioRef.value.preload = 'none'

    // === AUDIO EVENT HOOKS ===

    audioRef.value.onplay = () => {
      state.isPlaying = true
      isPlayingRef.value = true
      logPlayerEvent('Audio playing')
      startPlaybackMonitor()
    }

    audioRef.value.onpause = () => {
      state.isPlaying = false
      isPlayingRef.value = false
      logPlayerEvent('Audio paused — could be UI, system, AirPlay, or background')
      stopPlaybackMonitor()
    }

    audioRef.value.onstalled = () => {
      logPlayerEvent('Playback stalled — likely due to AirPlay, buffer, or network drop')
    }

    audioRef.value.onvolumechange = () => {
      logPlayerEvent('Volume changed', {
        volume: audioRef.value.volume
      })
    }

    audioRef.value.ondurationchange = () => {
      logPlayerEvent('Duration changed', {
        duration: audioRef.value.duration
      })
    }

    audioRef.value.onerror = () => {
      logPlayerEvent('Audio error', {
        code: audioRef.value.error?.code,
        message: audioRef.value.error?.message
      })
    }

    audioRef.value.onended = () => {
      logPlayerEvent('Playback ended')
    }

    // === VISIBILITY CHANGE LOGGING ===

    document.addEventListener('visibilitychange', () => {
      logPlayerEvent(`Document visibility changed: ${document.visibilityState}`)
    })
  }

  async function setSource({ src, title, mode = 'podcast', cover = '' }) {
    const isNewStream = audioRef.value.src !== src || state.current.mode !== mode

    if (isNewStream) {
      audioRef.value.pause()
      audioRef.value.src = src
      try {
        await audioRef.value.load()
        logPlayerEvent('Audio loaded', { src })
      } catch (e) {
        console.warn('Load interrupted or blocked:', e)
        logPlayerEvent('Audio load failed', { error: e })
      }
    }

    state.current.title = title
    state.current.src = src
    state.current.mode = mode
    state.current.cover = cover

    state.isPlaying = false
    isPlayingRef.value = false
  }

  async function play() {
    try {
      logPlayerEvent('User tapped PLAY')
      await audioRef.value.play()
      state.isPlaying = true
      isPlayingRef.value = true
      logPlayerEvent('Audio play triggered (manual)')
      updateMediaSession()
    } catch (err) {
      console.warn('Play interrupted or blocked:', err)
      logPlayerEvent('Audio play failed', { error: err })
    }
  }

  function pause() {
    if (audioRef.value) {
      logPlayerEvent('User tapped PAUSE')
      audioRef.value.pause()
      state.isPlaying = false
      isPlayingRef.value = false

      if (state.current.mode === 'live') {
        audioRef.value.currentTime = 0
        logPlayerEvent('Live stream reset to start')
      }
    }
  }

  async function setAndPlay({ src, title, mode = 'podcast', cover = '' }) {
    await setSource({ src, title, mode, cover })
    await play()
  }

  function setDefaultLive() {
    setSource({
      title: 'Dia! Live Radio',
      src: 'https://play.radioking.io/dia-radio/446203',
      mode: 'live',
      cover: ''
    })
  }

  function updateMediaSession() {
    if ('mediaSession' in navigator) {
      const { title, cover, mode } = state.current
      navigator.mediaSession.metadata = new MediaMetadata({
        title,
        artist: mode === 'podcast' ? 'Podcast Episode' : 'Live on Dia!',
        album: 'DIA! Radio',
        artwork: [
          { src: cover || '/img/fallback-live.jpg', sizes: '512x512', type: 'image/jpeg' }
        ]
      })

      navigator.mediaSession.setActionHandler('play', () => {
        logPlayerEvent('MediaSession: system triggered PLAY')
        audioRef.value.play()
      })

      navigator.mediaSession.setActionHandler('pause', () => {
        logPlayerEvent('MediaSession: system triggered PAUSE')
        audioRef.value.pause()
      })
    }
  }

  return {
    setSource,
    setAndPlay,
    play,
    pause,
    current: readonly(state.current),
    isPlaying: readonly(isPlayingRef),
    audioRef: readonly(audioRef),
    setDefaultLive
  }
}

// === HEARTBEAT MONITOR ===

let playbackInterval = null

function startPlaybackMonitor() {
  clearInterval(playbackInterval)
  playbackInterval = setInterval(() => {
    if (audioRef.value && !audioRef.value.paused) {
      logPlayerEvent('Playback heartbeat', {
        currentTime: audioRef.value.currentTime,
        duration: audioRef.value.duration
      })
    }
  }, 15000) // every 15s
}

function stopPlaybackMonitor() {
  clearInterval(playbackInterval)
}
