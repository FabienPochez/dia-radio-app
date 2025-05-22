<template>
  <div class="mb-8">
    <h2 class="text-xl font-semibold mb-2">Live Stream</h2>
    <button
      @click="play(streamUrl, 'Dia! Live Radio', 'live')"
      class="text-sm text-white bg-green-600 px-3 py-1 rounded hover:bg-green-500"
    >
      ▶️ Play Live Radio
    </button>
  </div>
</template>

<script setup>
import { usePlayer } from '../composables/usePlayer'

const { play, pause, current, isPlaying } = usePlayer()
const streamUrl = 'https://www.radioking.com/play/dia-radio/446203'
</script>
