import { createApp } from 'vue'
import App from './App.vue'

import './style.css'
import 'ant-design-vue/dist/reset.css'
import '@/styles/index.scss'
import 'virtual:uno.css'
import VueUEditorWrap from 'vue-ueditor-wrap'

import router from '@/router/index.ts'

const app = createApp(App)
app.use(router)
app.use(VueUEditorWrap)
app.mount('#app')
