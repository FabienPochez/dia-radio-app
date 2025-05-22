<template>
  <div class="px-4 py-4 max-w-4xl mx-auto">
    <h2 class="text-2xl uppercase font-bold mb-4">Latest Shows</h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <PodcastCard
        v-for="(item, index) in visibleItems"
        :key="index"
        :title="item.title"
        :image="item.image"
        :isPlaying="isPlaying && current.title === item.title"
        :toggle="() => togglePodcast(item)"
      />
    </div>

    <div ref="scrollAnchor" class="h-8"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePlayer } from '../composables/usePlayer'
import PodcastCard from './PodcastCard.vue'

const { play, pause, current, isPlaying } = usePlayer()

const items = ref([])
const visibleItems = ref([])
const batchSize = 5
const loadedCount = ref(0)
const scrollAnchor = ref(null)

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
      audioUrl: item.querySelector('enclosure')?.getAttribute('url') || '',
      image:
        item.getElementsByTagNameNS('http://www.itunes.com/dtds/podcast-1.0.dtd', 'image')[0]?.getAttribute('href') ||
        item.querySelector('image')?.getAttribute('href') ||
        ''
    }))
    items.value = entries
    loadMore()
  } catch (err) {
    console.error('Failed to fetch RSS feed:', err)
  }
}

function togglePodcast(podcast) {
  if (isPlaying.value && current.title === podcast.title) {
    pause()
  } else {
    play(podcast.audioUrl, podcast.title, 'podcast', podcast.image)
  }
}

function loadMore() {
  const next = items.value.slice(loadedCount.value, loadedCount.value + batchSize)
  visibleItems.value.push(...next)
  loadedCount.value += batchSize
}

function setupObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadMore()
      }
    },
    { threshold: 1.0 }
  )

  if (scrollAnchor.value) {
    observer.observe(scrollAnchor.value)
  }
}

onMounted(async () => {
  await fetchRSS()
  setupObserver()
})
</script>
