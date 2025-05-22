<template>
  <div class="min-h-screen pb-[160px] bg-zinc-950 text-white">
    <div v-if="currentTab === 'live'" class="flex flex-col gap-4 p-4">
      <LiveCard />
      <NextUp />

    </div>
    <PodcastList v-if="currentTab === 'shows'" />
    <About v-if="currentTab === 'about'" />
  </div>

  <footer class="fixed bottom-0 left-0 w-full z-50">
    <GlobalPlayer />
    <BottomNav :currentTab="currentTab" @update:tab="currentTab = $event" />
  </footer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LiveCard from './components/LiveCard.vue'
import NextUp from './components/NextUp.vue'
import PodcastList from './components/PodcastList.vue'
import About from './components/About.vue'
import GlobalPlayer from './components/GlobalPlayer.vue'
import BottomNav from './components/BottomNav.vue'

const currentTab = ref('live')
import { usePlayer } from './composables/usePlayer'

const { setDefaultLive } = usePlayer()

onMounted(() => {
  setDefaultLive()
})

</script>

<style>
body {
  background-color: #09090b; /* Tailwind's zinc-950 */
  color: white;
}
</style>

