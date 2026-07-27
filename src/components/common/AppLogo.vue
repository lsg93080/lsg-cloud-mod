<template>
  <a :href="externalRoutes.home" class="logo">
    <picture>
      <source media="(max-width: 769px)" srcset="/Logo_137x119.webp" />
      <img src="/Logo.webp" alt="LifeSync-Games" width="78" height="68" />
    </picture>
  </a>
</template>

<script setup lang="ts">
import { externalRoutes } from '@/config/externalRoutes'
</script>

<style scoped>
.logo {
  display: flex;
  text-decoration: none;
  transition: cubic-bezier(0.4, 0, 0.2, 1) 0.5s;
}

img {
  height: 68px;
}
</style>
