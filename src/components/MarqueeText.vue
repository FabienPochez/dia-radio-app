<template>
  <div class="w-full flex justify-center">
    <div class="relative h-5 overflow-hidden" :style="{ width: width }">
      <div class="absolute left-0 top-0 flex animate-marquee whitespace-nowrap" :style="{ animationDelay }">
        <span class="pr-8">{{ text }}</span>
        <span class="pr-8" aria-hidden="true">{{ text }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    required: true
  },
  width: {
    type: String,
    default: '70%' // Use '100%' if full width is needed
  },
  animationDelay: {
    type: String,
    default: '1.5s'
  }
})
</script>

<style scoped>
@keyframes marquee {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-50%); }
}

.animate-marquee {
  animation: marquee 16s linear infinite;
}
</style>
