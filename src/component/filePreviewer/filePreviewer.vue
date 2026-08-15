<script setup lang="ts">
import { computed, ref } from 'vue'
import VuePdfEmbed from 'vue-pdf-embed'
import { pdfData } from '../fileUploader/fileUploader'
import HeaderComponent from '../headerComponent/headerComponent.vue'

const page = ref(1)
const totalPages = computed(() => pdfData.value?.pageCount ?? 0)
const sourceBuffer = computed(() => pdfData.value?.buffer)
const pdfDimensions = computed(() => pdfData.value?.dimensions)

function getCoordinates(event: MouseEvent) {
  const target = event.currentTarget as HTMLElement | null
  if (!target) return

  const rect = target.getBoundingClientRect()

  const clickX = event.clientX - rect.left
  const clickY = event.clientY - rect.top

  const viewPortRatioX = clickX / rect.width
  const viewPortRatioY = clickY / rect.height

  if (!pdfDimensions.value) return

  const positionXFromTop_LeftOrigin = Math.round(viewPortRatioX * pdfDimensions.value?.width)
  const positionYFromTop_LeftOrigin = Math.round(viewPortRatioY * pdfDimensions.value?.height)

  const pdfPositionX = positionXFromTop_LeftOrigin
  const pdfPositionY = Math.round(pdfDimensions.value.height - positionYFromTop_LeftOrigin)

  console.log(pdfPositionX, 'pdf x')
  console.log(pdfPositionY, 'pdf y')
  console.log(event.clientX, 'event x')
  console.log(event.clientY, 'event y')
}
</script>

<template>
  <div v-if="pdfData?.buffer">
    <!-- Controls -->
    <v-container class="d-flex ga-1 align-center">
      <v-btn :disabled="page <= 1" size="small" width="100" @click="page--">Previous</v-btn>
      <span>Page {{ page }} of {{ totalPages }}</span>
      <v-btn :disabled="page >= totalPages" size="small" width="100" @click="page++">Next</v-btn>
    </v-container>

    <v-container
      ><div class="pdf-wrapper" @click="getCoordinates">
        <VuePdfEmbed :source="sourceBuffer" :page="page" />
      </div>
    </v-container>
  </div>
  <HeaderComponent></HeaderComponent>
</template>

<style scoped>
.page-menu {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2px;
}
.pdf-wrapper {
  position: relative;
  width: 100%;
  max-width: 800px; /* Maximum width on desktop */
  margin: 0 auto;
  background-color: #ffffff;
}

.pdf-wrapper :deep(canvas) {
  width: 100% !important;
  height: auto !important;
  display: block;
}
</style>
