import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import naive from 'naive-ui'
import '@fontsource/inter/index.css'
import '@fontsource/azeret-mono/index.css'

//createApp(App).mount('#app')
createApp(App).use(naive).mount('#app')