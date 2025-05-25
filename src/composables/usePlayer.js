// usePlayer.js
import { reactive, readonly, ref } from 'vue'

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
    }

    audioRef.value.onpause = () => {
      state.isPlaying = false
      isPlayingRef.value = false
    }
  }

  async function setSource({ src, title, mode = 'podcast', cover = '' }) {
    const isNewStream = audioRef.value.src !== src || state.current.mode !== mode

    if (isNewStream) {
      audioRef.value.pause()
      audioRef.value.src = src
      try {
        await audioRef.value.load()
      } catch (e) {
        console.warn('Load interrupted or blocked:', e)
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
    } catch (err) {
      console.warn('Play interrupted or blocked:', err)
    }
  }

  function pause() {
    if (audioRef.value) {
      audioRef.value.pause()
      state.isPlaying = false
      isPlayingRef.value = false

      if (state.current.mode === 'live') {
        audioRef.value.currentTime = 0
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
