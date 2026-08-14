<script setup lang="ts">
import SnackBar from './component/snackBar/snackBar.vue'
</script>

<template>
  <v-app>
    <v-app-bar>
      <template v-slot:prepend>
        <v-app-bar-nav-icon></v-app-bar-nav-icon>
      </template>

      <v-app-bar-title>PDF Field Placer </v-app-bar-title>
    </v-app-bar>
    <v-main>
      <router-view></router-view>
    </v-main>
    <SnackBar></SnackBar>
  </v-app>
</template>

<style scoped></style>
