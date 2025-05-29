<template>
  <div class="max-w-4xl mx-auto">
    <h2 class="text-2xl uppercase font-bold mb-4">Latest Shows</h2>

    <div class="sticky top-0 z-10 pb-2">
      <n-input
        v-model:value="searchQuery"
        placeholder="Search episodes..."
        size="Large"
        round
        class="mb-4"
        :style="{
          backgroundColor: '#000000',
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
        }"
      >
        <template #suffix>
          <transition name="fade" mode="out-in">
            <div class="w-6 h-6 flex items-center justify-center" :key="searchQuery ? 'clear' : 'search'">
              <button
                v-if="searchQuery"
                @click.stop="searchQuery = ''"
                class="focus:outline-none"
              >
                <XCircle class="w-6 h-6 text-white opacity-80" />
              </button>
              <Search
                v-else
                class="w-6 h-6 text-white opacity-60"
              />
            </div>
          </transition>
        </template>
      </n-input>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <PodcastCard
        v-for="(item, index) in filteredItems"
        :key="index"
        :title="item.title"
        :image="item.image"
        :isPlaying="isPlaying && current.title === item.title"
        :toggle="() => togglePodcast(item)"
      />
    </div>

    <div v-if="filteredItems.length === 0" class="text-center text-sm text-gray-400 py-8">
      No matching episodes found.
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

const items = ref([])
const searchQuery = ref('')

const filteredItems = computed(() => {
  return items.value.filter(item =>
    item.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

async function fetchRSS() {
  const feedUrl =
    'https://api.codetabs.com/v1/proxy/?quest=https://feeds.soundcloud.com/users/soundcloud:users:683767394/sounds.rss'
  try {
    const res = await fetch(feedUrl)
    const text = await res.text()
    const parser = new DOMParser()
    const xml = parser.parseFromString(text, 'application/xml')
    const entries = Array.from(xml.querySelectorAll('item')).map((item) => ({
      title: item.querySelector('title')?.textContent || '',
      description: item.querySelector('description')?.textContent || '',
      audioUrl: `https://stream.diaradio.live/stream?url=${encodeURIComponent(item.querySelector('enclosure')?.getAttribute('url') || '')}`,
      image:
        item.getElementsByTagNameNS('http://www.itunes.com/dtds/podcast-1.0.dtd', 'image')[0]?.getAttribute('href') ||
        item.querySelector('image')?.getAttribute('href') ||
        ''
    }))
    // Shuffle once before displaying
    items.value = entries.sort(() => Math.random() - 0.5)
  } catch (err) {
    console.error('Failed to fetch RSS feed:', err)
  }
}

function togglePodcast(podcast) {
  if (isPlaying.value && current.title === podcast.title) {
    pause()
  } else {
    setAndPlay({
      src: podcast.audioUrl,
      title: podcast.title,
      mode: 'podcast',
      cover: podcast.image || '/img/fallback-live.jpg'
    })
  }
}

onMounted(async () => {
  await fetchRSS()
})
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