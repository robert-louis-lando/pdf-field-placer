<script setup lang="ts">
import { ref } from 'vue'
import VuePdfEmbed from 'vue-pdf-embed'
import { pdfData } from '../fileUploader/fileUploader'
import HeaderComponent from '../headerComponent/headerComponent.vue'

const page = ref(1)
const totalPages = ref(0)

function handleLoaded() {
  if (pdfData.value) {
    totalPages.value = pdfData.value.pageCount
  }
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

    <v-container>
      <VuePdfEmbed :source="pdfData.buffer" :page="page" @loaded="handleLoaded" />
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

/* 🎯 THIS IS THE MAGIC FIX FOR MOBILE */
.pdf-wrapper :deep(canvas) {
  width: 100% !important;
  height: auto !important;
  display: block;
}
</style>
