<template>
  <div class="modal" v-if="showModal">
    <div class="modal-content">
      <h2>Confirmation</h2>
      <p>{{ confirmationMessage }}</p>
      <div class="modal-buttons">
        <Button color="primary" @click="confirm">Confirmer</Button>
        <Button color="warning" @click="cancelAction">Annuler</Button>
      </div>
    </div>
  </div>
  <button :class="buttonClass" @click="confirmAction">{{ buttonText }}</button>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, computed } from 'vue';
import Button from './button/Button.vue';

const props = defineProps<{
  buttonText: string;
  confirmationMessage: string;
  class: string;
}>();

const emit = defineEmits<{
  (e: 'confirmed'): void;
}>();

const showModal = ref(false);

const buttonClass = computed(() => `btn ${props.class}`);

const confirmAction = () => {
  showModal.value = true;
  document.body.style.overflow = 'hidden';
};

const cancelAction = () => {
  showModal.value = false;
  document.body.style.overflow = '';
};

const confirm = () => {
  emit('confirmed');
  showModal.value = false;
  document.body.style.overflow = '';
};
</script>
<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
}

.modal-content p {
  padding: 20px;
}

.modal-buttons {
  text-align: center;
}

.btn, .button {
  display: inline-block;
  padding: 12px;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

body.modal-open {
  overflow: hidden;
}

.danger {
  background-color: #dc3545;
  color: white;
}

.danger:hover {
  background-color: #c82333;
  transform: translateY(-2px);
}
</style>
