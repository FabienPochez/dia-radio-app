<template>
  <Card class="w-full text-white rounded-none bg-transparent border-b border-t-0 border-r-0 border-l-0 border-pink py-0 gap-0">
    <CardContent class="p-0">
      <!-- Image with play button -->
      <div class="relative aspect-3/2 w-full overflow-hidden rounded-lg">
        <img
          :src="image"
          :alt="title"
          class="object-cover w-full h-full"
        />
        <PlayPauseButton
          class="absolute bottom-0 left-0"
          :isPlaying="isPlaying"
          :onToggle="toggle"
        />
      </div>
     <CardDescription v-if="publishedAt" class="pt-3">
        {{ publishedAt }}
      </CardDescription>
      <!-- Title -->
        
      <div class=" pt-3">
        
        <h3 class="uppercase font-semibold">{{ title }}</h3>
      </div>

      <!-- Genres -->
      <div class="pt-5 pb-2">
        <Badge
          v-for="genre in genres"
          :key="genre"
          variant="genre"
          class="mr-2"
        >
          {{ genre }}
        </Badge>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>

import PlayPauseButton from '@/components/player/PlayPauseButton.vue'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription } from '@/components/ui/card'


defineProps({
  title: String,
  image: String,
  isPlaying: Boolean,
  toggle: Function,
  genres: {
    type: Array,
    default: () => [],
  },
  publishedAt: {
    type: String,
    default: null,
  },
})

</script>
