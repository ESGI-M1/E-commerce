import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { VueGridLayoutPlugin } from 'vue-grid-layout'; // Assurez-vous d'importer le plugin VueGridLayout

import '@fortawesome/fontawesome-free/js/all'

const app = createApp(App)
const pinia = createPinia()
app.use(router)
app.use(pinia)
app.use(VueGridLayoutPlugin) 
app.mount('#app')
