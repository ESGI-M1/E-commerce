<template>
  <form class="form">
    <div v-for="(field, index) in fields" :key="index" class="form-field">
      <label :for="field.id">{{ field.label }}:</label>
      <input :type="field.type" :id="field.id" :name="field.name" v-model="form[field.name]">
    </div>
    <Button color="primary" type="submit">Sauvegarder</Button>
  </form>
</template>

<script>
import Button from '../../components/button/Button.vue';
import useForm from './useForm.js';

export default {
  components: {
    Button
  },
  props: {
    fields: Array
  },
  setup(props) {
    const { form, handleChange, handleSubmit } = useForm({});

    function submitForm(formData) {
      console.log('Form submitted:', formData);
    }

    return {
      form,
      handleChange,
      handleSubmit,
      fields: props.fields
    };
  }
};
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
