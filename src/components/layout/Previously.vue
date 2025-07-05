<template>
  <div class="bg-zinc-900 rounded-xl p-4 shadow-sm w-full">
    <h3 class="text-sm text-zinc-400 font-semibold mb-2">⏪ Recently Played</h3>
    <div v-if="prev.length === 0" class="text-sm text-zinc-500">No data</div>
    <ul v-else class="space-y-1">
      <li v-for="(track, i) in prev" :key="i" class="text-sm text-white truncate">
        {{ track.artist }} — {{ track.title }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const prev = ref([])

onMounted(async () => {
  try {
    const res = await fetch('https://api.radioking.io/widget/radio/dia-radio/track/ckoi?limit=3')
    const json = await res.json()
    prev.value = json || []
  } catch (e) {
    console.warn('❌ Failed to fetch previous tracks')
  }
})
</script>
