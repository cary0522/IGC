<script setup>
import Loading from '/images/loading.gif'
const props = defineProps({
  loadingValue: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
<div class="w-full h-full flex items-center justify-center bg-white/80 fixed z-100 top-0 left-0 text-2xl font-bold" v-if="loadingValue">
  <img :src="Loading" alt="Loading">
</div>
</template>