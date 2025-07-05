<template>
  <img
    :src="src"
    alt="Cover"
    class="h-full aspect-square object-cover rounded-sm"
  />
</template>

<script setup>
defineProps({
  src: String
})
</script>
