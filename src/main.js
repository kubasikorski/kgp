import './assets/main.css'
import './assets/peak-marker.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Restore the auth session and subscribe to auth changes before mounting.
useAuthStore().init()

app.mount('#app')
