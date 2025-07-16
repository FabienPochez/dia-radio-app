<template>
  <div class="max-w-4xl mx-auto">
    <h2 class="text-2xl uppercase font-bold mb-4">Latest Shows</h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <PodcastCard
        v-for="(item, index) in filteredItems"
        :key="index"
        :title="item.title"
        :image="item.image"
        :isPlaying="isPlaying && current.title === item.title"
        :toggle="() => togglePodcast(item)"
        :genres="item.genres"
        :publishedAt="item.formattedDate"
      />
    </div>

    <div v-if="filteredItems.length === 0" class="text-center text-sm text-gray-400 py-8">
      No episodes found.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { usePlayer } from '@/composables/usePlayer'
import PodcastCard from '@/components/podcast/PodcastCard.vue'


const { current, isPlaying, setAndPlay } = usePlayer()

const items = ref([])
const searchQuery = ref('')

const filteredItems = computed(() => {
  return items.value.filter(item =>
    item.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

async function fetchLatestEpisodes() {
  try {
    const res = await fetch('https://content.diaradio.live/json/episodes.json')
    const json = await res.json()

    console.log(`📦 Total episodes in JSON: ${json.length}`)

    const sorted = json
      .filter(e => !!e.publishedAt)
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 50)

    console.log(`📅 Sorted episodes with publishedDate: ${sorted.length}`)

  const episodes = sorted.map(track => {
  const publishedAt = track.publishedAt
  const formattedDate = publishedAt
  ? new Date(publishedAt).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }).replace(/\//g, '.')
  : null

  return {
    title: track.title || 'Untitled',
    description: track.description || '',
    audioUrl: `https://stream.diaradio.live/stream/${track.track_id}`,
    image: track.cover?.url || track.show?.cover?.url || '/img/fallback-live.jpg',
    genres: (track.genres || []).map(g => typeof g === 'string' ? g : g.name),
    formattedDate,
  }
})


    items.value = episodes
    console.log(`✅ Loaded ${episodes.length} latest episodes`)
  } catch (err) {
    console.error('❌ Failed to fetch latest episodes:', err)
  }
}

function togglePodcast(podcast) {
  setAndPlay({
    src: podcast.audioUrl,
    title: podcast.title,
    mode: 'podcast',
    cover: podcast.image || '/img/fallback-live.jpg',
    genres: podcast.genres || []
  })
}

onMounted(fetchLatestEpisodes)
</script>
