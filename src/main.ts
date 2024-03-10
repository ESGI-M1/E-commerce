import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import '@fortawesome/fontawesome-free/js/all'

// createApp(App).mount('#app')
createApp(App).use(router).mount('#app')
