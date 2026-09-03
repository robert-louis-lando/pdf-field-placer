<script setup lang="ts">
import { computed } from 'vue'
import { excelData } from '../fileUploader/fileUploader'
import { artificialHeaders, fieldPlacements } from '../filePreviewer/filePreviewer'

const availableHeaders = computed(() =>
  [...(excelData.value?.headers ?? []), ...artificialHeaders].filter(
    (header, index, headers) =>
      headers.indexOf(header) === index &&
      !fieldPlacements.value.some((field) => field.fieldName === header),
  ),
)

function startDrag(event: DragEvent, header: string) {
  event.dataTransfer?.setData('text/plain', header)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'copy'
}
</script>

<template>
  <div class="floating-bottom-bar flex align-center">
    <v-chip-group selected-class="text-secondary">
      <v-chip
        v-for="header in availableHeaders"
        :key="header"
        :value="header"
        :draggable="true"
        @dragstart="startDrag($event, header)"
        >{{ header }}</v-chip
      >
    </v-chip-group>
  </div>
</template>

<style scoped>
.floating-bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 9999;

  background-color: #1e293b;
  color: #ffffff;
  padding: 16px;
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.15);
}
</style>
