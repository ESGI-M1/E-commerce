<template>
  <div class="modal" v-if="showModal">
    <div class="modal-content">
      <h2>Confirmation</h2>
      <p>{{ confirmationMessage }}</p>
      <div class="modal-buttons">
        <button @click="confirm">Confirmer</button>
        <button @click="cancelAction">Annuler</button>
      </div>
    </div>
  </div>
  <button @click="confirmAction">{{ buttonText }}</button>
</template>

<script>
export default {
  props: {
    buttonText: {
      type: String,
      default: 'Default'
    },
    confirmationMessage: {
      type: String,
      default: 'Default?'
    }
  },
  data() {
    return {
      showModal: false
    };
  },
  methods: {
    confirmAction() {
      this.showModal = true;
      document.body.style.overflow = 'hidden';
    },
    cancelAction() {
      this.showModal = false;
      document.body.style.overflow = '';
    },
    confirm() {
      this.$emit('confirmed');
      this.showModal = false;
      document.body.style.overflow = '';
    }
  }
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

.modal-buttons {
  text-align: right;
}

button {
  margin-left: 10px;
}

body.modal-open {
  overflow: hidden;
}
</style>
