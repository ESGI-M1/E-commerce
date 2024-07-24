<template>
  <button :class="buttonClass" @click="handleClick">
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  color: string
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()

const buttonClass = computed(() => `btn ${props.color}`)

const handleClick = () => {
  emit('click')
}
</script>

<style scoped>
.default {
  background-color: #007bff;
  color: white;
}

.primary {
  background-color: #007bff;
  color: white;
}

.primary:hover {
  background-color: #005dc2;
}

.secondary {
  background-color: #6c757d;
  color: white;
}

.danger {
  background-color: #dc3545;
  color: white;
}

.danger:hover {
  background-color: #c62e3c
}

.warning {
  background-color: #ffc107;
  color: white;
}
</style>
