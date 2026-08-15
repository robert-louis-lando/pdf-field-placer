<script setup lang="ts">
import { excelData } from '../fileUploader/fileUploader'
</script>

<template>
  <div class="floating-bottom-bar flex align-center">
    <v-chip-group selected-class="text-secondary">
      <v-chip v-for="header in excelData?.headers">{{ header }}</v-chip>
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
