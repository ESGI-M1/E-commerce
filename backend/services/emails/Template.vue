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
  link: {
    type: String,
    required: false
  },
  textLink: {
    type: String,
    required: false
  },
  informativeLine: {
    type: String,
    required: false
  }
});

</script>

<template>
  <div class="background" style="
    max-width: 800px;
    width: fit-content;
    background-color: whitesmoke;
    border-radius: 10px;
    padding: 25px;
    margin: 20px;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;">

    <div class="container">

      <div class="title" style="
        text-align: center;
        margin-bottom: 20px;">

        <h1 style="
          font-family: Avenir, Helvetica, Arial, sans-serif;
          color: #2c3e50;
          font-size: 36px;
          margin-top: 5px;
          margin-bottom: 5px;">
          {{ title }}
        </h1>

      </div>

      <div class="body">
        <p v-for="(line, index) in body" :key="index" style="
          padding-left: 10px;
          padding-right: 10px;
          font-size: 14px;
          word-wrap: break-word;
          font-family: Avenir, Helvetica, Arial, sans-serif;">
          {{ line }}
        </p>
        <div v-if="link" style="
          text-align: center;
          margin-top: 30px;
          margin-bottom: 20px;">

          <a :href="link" style="
            text-decoration: none;
            color: white;
            background-color: #2c3e50;
            padding: 10px;
            border-radius: 10px;
            font-size: 20px;">
            {{ textLink }}
          </a>

        </div>

        <p style="
          font-size: 12px;
          color: gray;
          font-style: italic;">
          {{ informativeLine }}
        </p>

      </div>

    </div>
  </div>
</template>
