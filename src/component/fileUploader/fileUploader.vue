<script setup lang="ts">
import { excelFile, pdfFile, processFiles } from './fileUploader'
</script>

<template>
  <div class="file-upload">
    <h2>Excel File</h2>
    <v-file-upload
      v-model="excelFile"
      clearable
      density="compact"
      variant="compact"
      accept=".csv, .xlsx"
    >
    </v-file-upload>
    <h2>PDF File</h2>
    <v-file-upload v-model="pdfFile" clearable density="compact" variant="compact" accept=".pdf">
    </v-file-upload>
    <v-btn size="large" class="process-files" @click="processFiles()"> Process Files </v-btn>
  </div>
</template>

<style scoped>
.file-upload {
  width: min(100% - 2rem, 1200px);
  margin-inline: auto;
}
.process-files {
  display: block;
  margin-left: auto;
  margin-right: 0;
}
</style>
