<template>
  <div>
    <Bar :data="data" :options="options"/>
  </div>
</template>
  
<script setup lang="ts">
  import { Chart as ChartJS, BarElement,  Tooltip, Legend, Colors, CategoryScale, LinearScale } from 'chart.js'
  import { Bar } from 'vue-chartjs'
  
  const props = defineProps<{
    title: string;
    labels: array;
    values: array
  }>()
  
  const options = {
    responsive: true,
  }

  const data = {
    labels: props.labels,
    datasets: [{
      label: props.title,
      data: props.values,
    }]
  };
  
  ChartJS.register(BarElement, Tooltip, Legend, Colors, CategoryScale, LinearScale)
  
</script>
  