<template>
  <DrawerContent class="rounded-t-xl  mx-auto w-full max-w-none bg-neutral-900 text-white px-4 pt-3 pb-7 h-auto bottom-0">
    <!-- Header -->
    <div class="flex justify-between items-center mb-4 mt-4">
      <h2 class="text-xl font-semibold font-sans">Now Playing</h2>
    </div>

    <!-- Info Section -->
    <div class="flex flex-col">
      <img
        :src="current.cover || '/img/fallback-live.jpg'"
        alt="cover"
        class="object-cover w-full h-full rounded-md mb-4"
      />
      <h3 class="text-lg leading-tight uppercase w-full">
        {{ current.mode === 'live' ? liveMeta.title : current.title }}
      </h3>

      <div class="mt-2 text-xs text-gray-400 uppercase tracking-widest">
        {{ current.mode }}
      </div>

      <!-- Genre pills -->
      <div class="flex gap-2 mt-2 flex-wrap" v-if="genres.length > 0">
        <Badge
          v-for="genre in genres"
          :key="genre"
          variant="genre"
          class="mr-2"
        >
          {{ genre }}
        </Badge>
      </div>
    </div>

    <!-- Controls -->
    <DrawerFooter>
      <GlobalPlayerControls class="my-6" />
    </DrawerFooter>
  </DrawerContent>
</template>


<script setup>
import {
  Drawer,
  DrawerContent,
} from '@/components/ui/drawer'
import { Badge } from '@/components/ui/badge'
import { ChevronDown } from 'lucide-vue-next'
import { usePlayer } from '@/composables/usePlayer'
import GlobalPlayerControls from '@/components/player/GlobalPlayerControls.vue'
import { ref, onMounted, computed } from 'vue'

const { current } = usePlayer()

defineProps({ open: Boolean })
const emit = defineEmits(['update:open'])

const emitClose = () => emit('update:open', false)

const liveMeta = ref({
  title: 'Live on Dia!',
  cover: '/img/fallback-live.jpg',
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

const genres = computed(() =>
  current.mode === 'podcast' && Array.isArray(current.genres) ? current.genres : []
)
</script>
