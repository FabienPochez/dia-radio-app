<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">🎙 Latest Podcasts</h2>
    <div
      v-for="(item, index) in visibleItems"
      :key="index"
      class="relative bg-gray-800 p-4 rounded mb-4 shadow"
    >
      <h3 class="text-lg font-bold mb-1">{{ item.title }}</h3>
      <img
        :src="item.image"
        alt="cover"
        class="w-full rounded mb-2"
        v-if="item.image"
      />
      <p class="text-sm text-gray-300 mb-2" v-html="item.description"></p>

      <PlayPauseButton
        class="absolute bottom-2 right-2"
        :isPlaying="isPlaying && current.title === item.title"
        :onToggle="() => togglePodcast(item)"
      />
    </div>
    <div ref="scrollAnchor" class="h-8"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { usePlayer } from '../composables/usePlayer'
import PlayPauseButton from './PlayPauseButton.vue'

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
