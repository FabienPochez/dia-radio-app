<template>
  <div class="p-4 max-w-3xl mx-auto">
    <h1 class="text-xl font-bold mb-4">🎧 Playback Debug Logs</h1>
    <div v-if="logs.length === 0" class="text-gray-400">No logs yet.</div>
    <div v-for="(log, index) in logs" :key="index" class="mb-4 border-b pb-2">
      <p class="text-xs text-gray-500">{{ log.timestamp }}</p>
      <p class="text-sm font-semibold">{{ log.message }}</p>
      <pre v-if="Object.keys(log.data || {}).length" class="truncate bg-neutral-800 text-xs p-2 rounded mt-1">
{{ JSON.stringify(log.data, null, 2) }}
      </pre>
    </div>
    <button
      @click="clearLogs"
      class="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
    >
      Clear Logs
    </button>
  </div>
</template>

<script setup>
import { usePlayerLogs } from '../composables/playerLogs.js'

const { logs } = usePlayerLogs()

function clearLogs() {
  logs.value.length = 0
}
</script>
