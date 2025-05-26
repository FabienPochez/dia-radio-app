// usePlayer.js
import { reactive, readonly, ref } from 'vue'
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

    audioRef.value.onplay = () => {
      state.isPlaying = true
      isPlayingRef.value = true
      logPlayerEvent('Audio playing')
      startPlaybackMonitor()
    }

    audioRef.value.onpause = () => {
      state.isPlaying = false
      isPlayingRef.value = false
      logPlayerEvent('Audio paused')
      stopPlaybackMonitor()
    }
    audioRef.value.onvolumechange = () => {
  logPlayerEvent('Volume changed', {
    volume: audioRef.value.volume
  })
}

    // 🧪 ADDITIONAL DEBUGGING HOOKS
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

    audioRef.value.onstalled = () => {
      logPlayerEvent('Playback stalled')
    }

    audioRef.value.onended = () => {
      logPlayerEvent('Playback ended')
    }
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
      await audioRef.value.play()
      state.isPlaying = true
      isPlayingRef.value = true
      logPlayerEvent('Audio play triggered')
      updateMediaSession()
    } catch (err) {
      console.warn('Play interrupted or blocked:', err)
      logPlayerEvent('Audio play failed', { error: err })
    }
  }

  function pause() {
    if (audioRef.value) {
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
        audioRef.value.play()
        logPlayerEvent('MediaSession play triggered')
      })

      navigator.mediaSession.setActionHandler('pause', () => {
        audioRef.value.pause()
        logPlayerEvent('MediaSession pause triggered')
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
