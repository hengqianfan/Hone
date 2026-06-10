import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
// 全局样式
import './styles/index.scss'

// 主题样式
import './styles/theme/index.scss'
import 'highlight.js/styles/github-dark.css'

// import CodeBlock from './components/CodeBlock/index.vue'

const app = createApp(App)


app.use(createPinia())
app.use(router)
// app.component('CodeBlock', CodeBlock)

app.mount('#app')
