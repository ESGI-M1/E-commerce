<script setup lang="ts">
import { defineProps, ref, watch } from 'vue';

const props = defineProps<{ message: string, type: string }>();

const visible = ref(false);

watch(() => props.message, (newMessage) => {
  if (newMessage) {
    visible.value = true;
    setTimeout(() => {
      visible.value = false;
    }, 3000);
  }
});
</script>

<template>
  <div v-if="visible" class="notification" :class="props.type">
    <div class="notification-content">
      <div v-if="props.type === 'success'" class="icon success">
        <i class="fas fa-check-circle"></i>
      </div>
      <div v-if="props.type === 'error'" class="icon error">
        <i class="fas fa-times-circle"></i>
      </div>
      <div class="message">
        {{ props.message }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.notification {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-content {
  display: flex;
  align-items: center;
}

.icon {
  margin-right: 10px;
}

.success {
  background-color: #dff0d8;
  color: #3c763d;
}

.error {
  background-color: #f2dede;
  color: #a94442;
}

.message {
  flex: 1;
}

.icon i {
  font-size: 20px;
}
</style>
