<template>
  <div class="modal-overlay" v-if="showModal">
    <div class="modal">
      <div class="modal-content">
        <h2>Confirmation</h2>
        <p>{{ confirmationMessage }}</p>
        <div class="modal-buttons">
          <Button color="primary" @click="confirm">Confirmer</Button>
          <Button color="warning" @click="cancelAction">Annuler</Button>
        </div>
      </div>
    </div>
  </div>
  <button :class="buttonClass" @click="confirmAction">
    <slot name="buttonText">{{ buttonText }}</slot>
  </button>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from './button/ButtonComponent.vue'

const props = defineProps<{
  buttonText: string
  confirmationMessage: string
  class: string
}>()

const emit = defineEmits<{
  (e: 'confirmed'): void
}>()

const showModal = ref(false)

const buttonClass = computed(() => `btn ${props.class}`)

const confirmAction = () => {
  showModal.value = true
  document.body.style.overflow = 'hidden'
}

const cancelAction = () => {
  showModal.value = false
  document.body.style.overflow = ''
}

const confirm = () => {
  emit('confirmed')
  showModal.value = false
  document.body.style.overflow = ''
}
</script>

<style scoped>
.modal-buttons {
  text-align: center;
}

body.modal-open {
  overflow: hidden;
}
</style>
