<template>
  <form class="form">
    <div v-for="(field, index) in fields" :key="index" class="form-field">
      <label :for="field.id">{{ field.label }}:</label>
      <input :type="field.type" :id="field.id" :name="field.name" v-model="form[field.name]" />
    </div>
    <Button v-if="submit" color="primary" :type="submit.type" @click="submit.click">{{
      submit.label
    }}</Button>
    <Button v-else color="primary" type="submit">Sauvegarder</Button>
  </form>
  {{ submit }}
</template>

<script setup lang="ts">
import Button from '../../components/button/Button.vue'
import useForm from './useForm.js'

defineProps({
  fields: {
    type: Array,
    required: true
  },
  submit: {
    type: Object,
    required: false
  }
})

const { form } = useForm({})
</script>

<style scoped>
.form {
  max-width: 400px;
  margin: 0 auto;
}

.form-field {
  margin-bottom: 20px;
}

.form-field label {
  display: block;
  margin-bottom: 5px;
}

.form-field input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-field input:focus {
  outline: none;
  border-color: #007bff;
}

/* Styliser le bouton */
</style>
