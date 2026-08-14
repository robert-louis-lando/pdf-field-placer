<template>
  <v-snackbar-queue
    location="top end"
    ref="snackbarQueue"
    v-model="messages"
    :total-visible="5"
    closable
  ></v-snackbar-queue>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { messages } from './snackBar'

const snackbarQueue = ref()
</script>

<style scoped></style>
