<template>
  <div class="flex items-center justify-center min-h-screen bg-neutral text-white">
    <div
      class="relative w-full max-w-[430px] h-screen md:h-[90vh] md:rounded-[24px] md:border md:border-pink overflow-hidden flex flex-col bg-neutral-950 text-white shadow-xl"
    >
      <!-- Scrollable content area -->
      <main class="flex-1 overflow-y-auto safe-area-top safe-top-64 px-5 pb-[160px]">
        <div v-if="currentTab === 'live'" class="flex flex-col gap-4">
          <LiveCard />
          <NextUp />
        </div>
        <PodcastList v-if="currentTab === 'shows'" />
        <Search v-if="currentTab === 'search'" />
        <About v-if="currentTab === 'about'" />
        <DebugLog v-if="currentTab === 'bugs'" />
      </main>

      <!-- BottomNav (fixed at bottom) -->
      <div class="absolute fixed bottom-0 left-0 w-full h-[80px] z-40">
        <BottomNav :currentTab="currentTab" @update:tab="currentTab = $event" />
      </div>

      <!-- GlobalPlayer (above nav) -->
      <div class="absolute fixed bottom-[80px] left-0 w-full z-50">
        <GlobalPlayer />
      </div>
    </div>
  </div>
</template>



<script setup>
import { ref, onMounted } from 'vue'
import LiveCard from '@/components/live/LiveCard.vue'
import NextUp from '@/components/layout/NextUp.vue'
import PodcastList from '@/components/podcast/PodcastList.vue'
import About from '@/components/layout/About.vue'
import DebugLog from '@/components/debug/DebugLog.vue'
import GlobalPlayer from '@/components/player/GlobalPlayer.vue'
import BottomNav from '@/components/layout/BottomNav.vue'
import Search from '@/components/podcast/Search.vue'

const currentTab = ref('live')
import { usePlayer } from '@/composables/usePlayer'

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

