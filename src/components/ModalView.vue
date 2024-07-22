<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal">
      <div class="modal-header">
        <h2>{{ title }}</h2>
        <button class="close" @click="close">&times;</button>
      </div>
      <div class="modal-body">
        <slot></slot>
      </div>
      <div class="modal-footer" v-if="!noShowFooter">
        <button @click="close">Annuler</button>
        <ConfirmComponent 
          :confirmationMessage="'Êtes-vous sûr de vouloir sauvegarder les modifications ?'"
          :class="'a-warning'"
          :elementType="'button'"
          @confirmed="save"
        >
          <template #buttonText>
            Enregistrer <i class="fa fa-save"></i>
          </template>
        </ConfirmComponent>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ConfirmComponent from './ConfirmComponent.vue';

const props = defineProps<{
  title: string;
  onSave: () => void;
  noShowFooter?: boolean;
}>();

const emit = defineEmits(['close']);

const close = () => {
  emit('close');
};

const save = () => {
  props.onSave();
};

</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  border-radius: 8px;
  padding: 20px;
  width: 80%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-body {
  margin-bottom: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
}

.modal-footer button {
  margin-left: 10px;
}
</style>
