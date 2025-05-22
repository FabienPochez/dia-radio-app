import { reactive, readonly, ref } from 'vue'

// 1. State
const state = reactive({
  current: {
    title: '',
    src: '',
    mode: '',
    cover: ''
  },
  isPlaying: false
})

// 2. Audio ref
export const audioRef = ref(null)
const isPlayingRef = ref(false)

// 3. Core function
export function usePlayer() {
  if (!audioRef.value) {
    audioRef.value = new Audio()
    audioRef.value.onplay = () => {
      state.isPlaying = true
      isPlayingRef.value = true
    }
    audioRef.value.onpause = () => {
      state.isPlaying = false
      isPlayingRef.value = false
    }
  }

  function play(src, title, mode = 'podcast', cover = '') {
    console.log('🔥 PLAY called:', { src, title, mode, cover })

    const isNewStream = audioRef.value.src !== src

    if (mode === 'podcast') {
     if (isNewStream) {
      audioRef.value.src = src
      }
      state.current.title = title
      state.current.src = src
      state.current.mode = mode
      state.current.cover = cover
      audioRef.value.play()
      console.log('🎯 Now playing (podcast):', state.current)
    }

    if (mode === 'live') {
      audioRef.value.pause()
      audioRef.value.src = src
      audioRef.value.load()
      audioRef.value.play()
      state.current.title = title
      state.current.src = src
      state.current.mode = mode
      state.current.cover = cover
      console.log('🎯 Now playing (live):', state.current)
    }

    state.isPlaying = true
    isPlayingRef.value = true
  }

  function pause() {
    if (audioRef.value) {
      audioRef.value.pause()
      if (state.current.mode === 'live') {
        audioRef.value.currentTime = 0
      }
      state.isPlaying = false
      isPlayingRef.value = false
    }
  }

function setDefaultLive() {
  state.current.title = 'Dia! Live Radio'
  state.current.src = 'https://play.radioking.io/dia-radio/446203'
  state.current.mode = 'live'
  state.current.cover = ''
  console.log('⚡ Default live set:', state.current)
}


  return {
    play,
    pause,
    current: readonly(state.current),
    isPlaying: readonly(isPlayingRef),
    audioRef: readonly(audioRef),
    setDefaultLive
  }
}
