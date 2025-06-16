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
        :key="index"
        :title="item.title"
        :image="item.cover"
        :isPlaying="isPlaying && current.title === item.title"
        :toggle="() => togglePodcast(item)"
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
  return items.value.filter(item =>
    item.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    item.genre.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.value.toLowerCase())
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

async function isMp3UrlValid(url) {
  try {
    const res = await fetch(`/stream?url=${encodeURIComponent(url)}`, { method: 'HEAD' })
    return res.ok
  } catch {
    return false
  }
}

async function fetchLocalTracks() {
  try {
    const res = await fetch('/output/episodes-with-id.json')
    const json = await res.json()

    const filtered = Object.values(json).filter(track => {
      const isValidPermalink =
        track.permalink &&
        track.permalink.startsWith('/diaradio/') &&
        !track.permalink.includes('/sets/') &&
        !track.permalink.includes('/likes') &&
        !track.permalink.includes('/reposts')

      const hasTrackId = typeof track.track_id === 'number' && track.track_id > 0;


      // ⬇️ TEMPORARY PATCH UNTIL SCRAPER IS FIXED
      // This will skip tracks with known broken mp3 URLs
      const knownBroken = track.mp3?.includes('1989571215-diaradio-gros-volume-sur-la-molle-chach-251224')

      return isValidPermalink && hasTrackId && !knownBroken;

    })

    items.value = filtered
    console.log(`✅ Loaded ${filtered.length} valid episodes`)
  } catch (err) {
    console.error('Failed to load or filter tracks:', err)
  }
}





function proxyUrlFromTrackId(id) {
  return `https://stream.diaradio.live/stream/${id}`;
}

function togglePodcast(podcast) {
  if (!podcast.track_id) {
    console.warn('⚠️ Missing track_id for', podcast.title);
    return;
  }

  const streamUrl = proxyUrlFromTrackId(podcast.track_id);

  if (isPlaying.value && current.title === podcast.title) {
    pause();
  } else {
    setAndPlay({
      src: streamUrl,
      title: podcast.title,
      mode: 'podcast',
      cover: podcast.cover || '/img/fallback-live.jpg'
    });
  }
}
onMounted(fetchLocalTracks);
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
