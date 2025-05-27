<template>
    <div class="flex">
  <div class="px-5 pt-4 pb-10 text-white">
    <!-- Header -->
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold font-sans">Now Playing</h2>
      <button @click="emitClose" class="p-1">
        <ChevronDown class="w-8 h-8 text-white" />
      </button>
    </div>

    <!-- Info Section -->
    <div class="flex flex-col">
      <img
        :src="current.cover || '/img/fallback-live.jpg'"
        alt="cover"
        class="object-cover w-full h-full rounded-md mb-4"
      />
      <h3 class="text-lg leading-tight w-full">{{ current.mode === 'live' ? liveMeta.title : current.title }}</h3>

    <!-- Mode -->
      <div class="mt-2 text-xs text-gray-400 uppercase tracking-widest">
        {{ current.mode }}
      </div>
        
      <!-- Genre pills (placeholder) -->
      <div class="flex gap-2 mt-2 flex-wrap">
        <n-tag
          v-for="(tag, i) in currentTags"
          :key="i"
          type="default"
          size="small"
          round
          bordered
          class="border-white text-white bg-transparent"
        >
          {{ tag }}
        </n-tag>
      </div>

      
    </div>

 <!-- Controls -->
<GlobalPlayerControls class="mt-6" />
    
  </div>
  </div>
</template>

<script setup>
import { ChevronDown } from 'lucide-vue-next'
import { usePlayer } from '@/composables/usePlayer'
import GlobalPlayerControls from '@/components/player/GlobalPlayerControls.vue'
import { ref, onMounted } from 'vue'

const liveMeta = ref({
  title: 'Live on Dia!',
  cover: '/img/fallback-live.jpg'
})

async function fetchLiveTrack() {
  try {
    const res = await fetch('https://api.radioking.io/widget/radio/dia-radio/track/current')
    const data = await res.json()
    liveMeta.value.title = data.title || 'Live on Dia!'
    liveMeta.value.cover = data.cover || '/img/fallback-live.jpg'
  } catch {
    liveMeta.value.title = 'Live on Dia!'
    liveMeta.value.cover = '/img/fallback-live.jpg'
  }
}

onMounted(() => {
  if (current.mode === 'live') {
    fetchLiveTrack()
  }
})


const { current } = usePlayer()
const emit = defineEmits(['close'])

const emitClose = () => emit('close')

// Placeholder genre tags
const currentTags = ['Placeholder']
</script>
