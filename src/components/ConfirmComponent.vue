<template>
  <div>
    <component
      :is="elementTag"
      :class="buttonClass"
      @click="confirmAction"
    >
      <slot name="buttonText">{{ buttonText }}</slot>
    </component>
    <div class="modal-overlay" v-if="showModal">
      <div class="modal">
        <div class="modal-content">
          <p class="modal-message">{{ confirmationMessage }}</p>
          <div class="modal-buttons">
            <Button color="primary" @click="confirm">Confirmer</Button>
            <Button color="danger" @click="cancelAction">Annuler</Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref, computed } from 'vue'
import Button from './button/ButtonComponent.vue'

const props = defineProps<{
  buttonText: string
  confirmationMessage: string
  class: string
  elementType: string // Nouvelle prop pour déterminer le type d'élément
}>()

const emit = defineEmits<{
  (e: 'confirmed'): void
}>()

const showModal = ref(false)

const buttonClass = computed(() => `${props.class}`)
const elementTag = computed(() => (props.elementType === 'a' ? 'a' : 'button'))

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

.modal-message {
  font-size: 20px;
  margin-bottom: 10px;
}

.modal-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-align: center;
}

body.modal-open {
  overflow: hidden;
}

</style>
