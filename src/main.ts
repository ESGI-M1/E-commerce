import './assets/main.css'
import { createApp, ref } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import '@fortawesome/fontawesome-free/js/all'

const app = createApp(App)
const pinia = createPinia()
const notificationMessage = ref('');
const notificationType = ref('');

app.use(router)
const showNotification = (message: string, type: string = 'success') => {
    notificationMessage.value = message;
    notificationType.value = type;
};
app.config.globalProperties.$notificationMessage = notificationMessage;

app.provide('showNotification', showNotification);
app.provide('notificationMessage', notificationMessage);
app.provide('notificationType', notificationType);

app.use(pinia)
app.mount('#app')
