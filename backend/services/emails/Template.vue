<script setup lang="ts">

defineProps({
  title: {
    type: String,
    required: true
  },
  body: {
    type: Array,
    required: false
  },
});

</script>

<template>
  <div class="background" style="
    width: fit-content;
    background-color: whitesmoke;
    border-radius: 10px;
    padding: 5px 10px 10px;
    margin-top: 20px;">

    <div class="container">

      <div class="title" style="
        text-align: center;
        margin-bottom: 20px;">

        <h1 style="
          font-family: Avenir, Helvetica, Arial, sans-serif;
          color: #2c3e50;
          font-size: 42px;">
          {{ title }}
        </h1>

      </div>

      <div class="body">
        <p v-for="(line, index) in body" :key="index" style="padding-left: 10px; padding-right: 10px;
          font-family: Avenir, Helvetica, Arial, sans-serif;">
          {{ line }}
        </p>
      </div>

    </div>
  </div>
</template>
