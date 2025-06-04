import './assets/style.css';

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
const vuetify = createVuetify({ components, directives })
import '@mdi/font/css/materialdesignicons.css'
export default createVuetify({
    icons: {
        defaultSet: 'mdi',
    },
})

// import VueCropper from 'vue-cropper';
// import '/vue-cropper/dist/index.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)
// app.use(VueCropper)/

app.mount('#app')
