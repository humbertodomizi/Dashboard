<script setup>
import Skeleton from 'primevue/skeleton';

defineProps({
  rows: {
    type: Number,
    default: 5
  },
  columns: {
    type: Number,
    default: 5
  }
});
</script>

<template>
  <div class="w-full border border-gray-100 rounded-lg overflow-hidden">
    <!-- Header simulation -->
    <div class="flex bg-gray-50 p-4 border-b border-gray-100 gap-4">
      <Skeleton v-for="i in columns" :key="`head-${i}`" height="1.5rem" class="w-full" />
    </div>
    <!-- Rows -->
    <div class="p-4 space-y-4 bg-white">
      <div v-for="r in rows" :key="`row-${r}`" class="flex gap-4">
        <Skeleton v-for="c in columns" :key="`col-${c}`" height="1.5rem" class="w-full" />
      </div>
    </div>
  </div>
</template>

