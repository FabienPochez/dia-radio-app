<template>
  <div class="max-w-4xl mx-auto">
    <h2 class="text-2xl uppercase font-bold mb-4">Search</h2>

    <div class="sticky top-0 z-10 pb-2">
      <n-input
        v-model:value="searchQuery"
        placeholder="Search tracks or shows..."
        size="Large"
        round
        class="mb-4"
        :style="inputStyles"
      >
        <template #suffix>
          <transition name="fade" mode="out-in">
            <div class="w-6 h-6 flex items-center justify-center" :key="searchQuery ? 'clear' : 'search'">
              <button v-if="searchQuery" @click.stop="searchQuery = ''" class="focus:outline-none">
                <XCircle class="w-6 h-6 text-white opacity-80" />
              </button>
              <Search v-else class="w-6 h-6 text-white opacity-60" />
            </div>
          </transition>
        </template>
      </n-input>
    </div>

    <p v-if="!searchQuery" class="text-sm text-gray-400 pb-8">
      You can search by show name, track title, or genre.
    </p>
    <p v-if="searchQuery || items.length > 0" class="text-sm text-gray-400 pb-4">
      {{ filteredItems.length }} of {{ items.length }} episodes match your search
    </p>

    <div v-if="searchQuery" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <PodcastCard
        v-for="(item, index) in filteredItems"
        :key="item.track_id"
        :title="item.title || 'Untitled'"
        :image="item.cover || '/img/fallback-live.jpg'"
        :isPlaying="isPlaying && current.src === proxyUrlFromTrackId(item.track_id)"
        :toggle="() => togglePodcast(item)"
        :genres="(item.genres || []).map(g => typeof g === 'string' ? g : g.name)"
      />
    </div>

    <div v-if="searchQuery && filteredItems.length === 0" class="text-center text-sm text-gray-400 py-8">
      No matching tracks found.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { usePlayer } from '@/composables/usePlayer'
import PodcastCard from '@/components/podcast/PodcastCard.vue'
import { NInput } from 'naive-ui'
import { Search, XCircle } from 'lucide-vue-next'

const { current, isPlaying, pause, setAndPlay } = usePlayer()

const searchQuery = ref('')
const items = ref([])

const filteredItems = computed(() => {
  if (!searchQuery.value) return []

  const q = searchQuery.value.toLowerCase()

  return items.value.filter(item =>
    item.title?.toLowerCase().includes(q) ||
    item.description?.toLowerCase().includes(q) ||
    (item.genres || []).some(g =>
      (typeof g === 'string' ? g : g.name).toLowerCase().includes(q)
    ) ||
    item.show?.title?.toLowerCase().includes(q)
  )
})

const inputStyles = {
  backgroundColor: '#171717',
  color: '#f3f4f6',
  '--n-color': 'transparent',
  '--n-color-focus': 'transparent',
  '--n-color-active': 'transparent',
  '--n-border': '1px solid #f3f4f6',
  '--n-border-hover': '1px solid #ffc8c8',
  '--n-border-focus': '1px solid #ffc8c8',
  '--n-border-active': '1px solid #ffc8c8',
  '--n-box-shadow-focus': 'none',
  '--n-text-color': '#fff',
  '--n-placeholder-color': 'rgba(255,255,255,0.4)',
  '--n-clear-size': '24px'
}

function proxyUrlFromTrackId(id) {
  return `https://stream.diaradio.live/stream/${id}`
}

function togglePodcast(podcast) {
  if (!podcast.track_id) {
    console.warn('⚠️ Missing track_id for', podcast.title)
    return
  }

  const streamUrl = proxyUrlFromTrackId(podcast.track_id)

  if (current.value?.src === streamUrl && isPlaying.value) {
    console.log('→ PAUSE triggered from Search')
    pause()
  } else {
    console.log('→ PLAY triggered from Search')
    setAndPlay({
      src: streamUrl,
      title: podcast.title,
      mode: 'podcast',
      cover: podcast.cover || '/img/fallback-live.jpg',
      genres: podcast.genres || []
    })
  }
}

async function fetchEpisodesFromAPI() {
  try {
    const res = await fetch('https://content.diaradio.live/json/episodes.json')
    const episodes = await res.json()

    const filtered = episodes.filter(track => {
      const validPermalink =
        track.scPermalink &&
        track.scPermalink.startsWith('/diaradio/') &&
        !track.scPermalink.includes('/sets/') &&
        !track.scPermalink.includes('/likes') &&
        !track.scPermalink.includes('/reposts')

      const hasTrackId = typeof track.track_id === 'number' && track.track_id > 0

      return validPermalink && hasTrackId
    })

    items.value = filtered.map(item => ({
  ...item,
  cover: typeof item.cover === 'object' ? item.cover.url : item.cover
}))

    console.log(`✅ Loaded ${filtered.length} valid episodes from Payload`)
  } catch (err) {
    console.error('❌ Failed to load episodes from Payload:', err)
  }
}


onMounted(fetchEpisodesFromAPI)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
