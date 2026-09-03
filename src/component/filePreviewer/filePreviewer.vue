<script setup lang="ts">
import { computed } from 'vue'
import VuePdfEmbed from 'vue-pdf-embed'
import { pdfData } from '../fileUploader/fileUploader'
import HeaderComponent from '../headerComponent/headerComponent.vue'
import {
  allowFieldDrop,
  createAndFillPdfs,
  fieldPlacements,
  page,
  processFieldDrop,
  removeField,
} from './filePreviewer.ts'
import { startFieldMove } from './filePreviewer.ts'

const totalPages = computed(() => pdfData.value?.pageCount ?? 0)
const previewSource = computed(() => pdfData.value?.buffer.slice(0))
</script>

<template>
  <div v-if="pdfData?.buffer">
    <!-- Controls -->
    <v-container class="toolbar d-flex ga-1 align-center">
      <v-btn :disabled="page <= 1" size="small" width="100" @click="page--">Previous</v-btn>
      <span>Page {{ page }} of {{ totalPages }}</span>
      <v-btn :disabled="page >= totalPages" size="small" width="100" @click="page++">Next</v-btn>
      <v-spacer />
      <v-btn :disabled="!fieldPlacements.length" color="primary" @click="createAndFillPdfs">
        Create fields &amp; fill PDFs
      </v-btn>
    </v-container>

    <v-container
      ><div class="pdf-wrapper" @dragover="allowFieldDrop" @drop="processFieldDrop">
        <VuePdfEmbed :source="previewSource" :page="page" />
        <div
          v-for="field in fieldPlacements.filter((item) => item.page === page)"
          :key="field.fieldName"
          class="field-overlay"
          :style="{
            left: `${(field.x / (pdfData?.dimensions.width ?? 1)) * 100}%`,
            top: `${(((pdfData?.dimensions.height ?? 0) - field.y - field.height) / (pdfData?.dimensions.height ?? 1)) * 100}%`,
            width: `${(field.width / (pdfData?.dimensions.width ?? 1)) * 100}%`,
            height: `${(field.height / (pdfData?.dimensions.height ?? 1)) * 100}%`,
          }"
          @pointerdown="startFieldMove(field, $event)"
        >
          <span>{{ field.fieldName }}</span>
          <button type="button" aria-label="Remove field" @click.stop="removeField(field.fieldName)">x</button>
        </div>
      </div>
    </v-container>
    <v-container class="field-count">
      {{ fieldPlacements.length }} field{{ fieldPlacements.length === 1 ? '' : 's' }} placed
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

.field-overlay {
  position: absolute;
  cursor: move;
  touch-action: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 0 4px;
  border: 2px solid #1976d2;
  background: rgba(25, 118, 210, 0.16);
  color: #0d47a1;
  font-size: 12px;
  pointer-events: auto;
}

.field-overlay button {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.toolbar,
.field-count {
  max-width: 800px;
}

.field-count {
  padding-top: 0;
}
</style>
