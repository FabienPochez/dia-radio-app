<template>
  <div class="bg-zinc-900 rounded-xl p-4 shadow w-full">
    <h3 class="font-sans text-m  font-semibold mb-2">🔜 Up Next</h3>
    <div v-if="next.length === 0" class="font-mono text-sm">No data</div>
    <ul v-else class="space-y-1">
      <li v-for="(track, i) in next" :key="i" class="font-mono text-sm text-white truncate">
        {{ track.artist }} — {{ track.title }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const next = ref([])

onMounted(async () => {
  try {
    const res = await fetch('https://api.radioking.io/widget/radio/dia-radio/track/next?limit=1')
    const json = await res.json()
    next.value = json || []
  } catch (e) {
    console.warn('❌ Failed to fetch next tracks')
  }
})
</script>
