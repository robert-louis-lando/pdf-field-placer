<script setup lang="ts">
import { computed, ref } from 'vue'
import VuePdfEmbed from 'vue-pdf-embed'
import { pdfData } from '../fileUploader/fileUploader'
import HeaderComponent from '../headerComponent/headerComponent.vue'

const page = ref(1)
const totalPages = computed(() => pdfData.value?.pageCount ?? 0)
const sourceBuffer = computed(() => pdfData.value?.buffer)
</script>

<template>
  <div v-if="pdfData?.buffer">
    <!-- Controls -->
    <v-container class="d-flex ga-1 align-center">
      <v-btn :disabled="page <= 1" size="small" width="100" @click="page--">Previous</v-btn>
      <span>Page {{ page }} of {{ totalPages }}</span>
      <v-btn :disabled="page >= totalPages" size="small" width="100" @click="page++">Next</v-btn>
    </v-container>

    <v-container>
      <VuePdfEmbed :source="sourceBuffer" :page="page" />
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
