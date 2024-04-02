<template>
  <div class="home">
    <Form :fields="fields" class="form">
    </Form>
  </div>
</template>

<script>
import Form from "../layout/form/Form.vue";

export default {
  components: {
    Form
  },
  data() {
    return {
      fields: [
        { label: 'Email', type: 'email', id: 'email', name: 'email' },
        { label: 'Password', type: 'password', id: 'password', name: 'password' },
      ]
    };
  }
};
</script>
