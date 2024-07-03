<template>
    <div>
      <h3>{{ title }}</h3>
      <canvas ref="chartCanvas"></canvas>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { Chart, ChartConfiguration, LineController, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip } from 'chart.js';
  
  Chart.register(LineController, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip);
  
  const props = defineProps<{
    title: string;
  }>()
  
  const chart = ref<Chart | null>(null);
  
  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [{
      label: 'Sales',
      data: [65, 59, 80, 81, 56, 55, 40],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };
  
  const chartConfig: ChartConfiguration = {
    type: 'line',
    data: data,
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };
  
  onMounted(() => {
    if (chart.value) {
      chart.value.destroy();
    }
    chart.value = new Chart($refs.chartCanvas, chartConfig);
  });
  
  </script>
  
  <style scoped>
  canvas {
    width: 100%;
    height: 300px;
  }
  </style>
  