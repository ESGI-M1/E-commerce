<template>
  <div class="admin-dashboard">
    <adminDashboard />
  </div>
</template>

<script setup lang="ts">
import adminDashboard from './adminDashboard.vue';

</script>

<style scoped>

.dashboard {
  margin-top: 40px;
}

.widget {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
}
</style>
