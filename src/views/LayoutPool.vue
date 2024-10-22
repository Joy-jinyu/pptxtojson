<template>
  <div class="layout-pool">
    <div 
      class="layout-item"
      v-for="slide in slides" 
      :key="slide.id"
    >
      <ThumbnailSlide class="thumbnail" :slide="slide" :size="1024" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useSlidesStore } from '@/store'
import type { Slide } from '@/types/slides'

import ThumbnailSlide from '@/views/components/ThumbnailSlide/index.vue'
import Button from '@/components/Button.vue'

const emit = defineEmits<{
  (event: 'select', payload: Slide): void
}>()

const slidesStore = useSlidesStore()
const { slides } = storeToRefs(slidesStore)

const insertTemplate = (slide: Slide) => {
  emit('select', slide)
}
</script>

<style lang="scss" scoped>
</style>