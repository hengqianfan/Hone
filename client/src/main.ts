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

// 注册指令
app.directive('typewriter', {
    mounted(el) {
        const originalText = el.textContent?.trim() || '';
        if (!originalText) return;

        let index = 0;
        const speed = 120;
        const loopDelay = 5000;
        let typingTimer: any = null;
        let loopTimer: any = null;

        // ----- 创建唯一的光标元素 -----
        const cursor = document.createElement('span');
        cursor.className = 'typewriter-cursor';
        cursor.textContent = '|';   // 光标字符

        // ----- 核心打字函数 -----
        function startTyping() {
            // ★ 清除所有可能残留的光标（防止重复）
            const oldCursors = el.querySelectorAll('.typewriter-cursor');
            oldCursors.forEach((c: any) => c.remove());

            // 清空容器
            el.innerHTML = '';
            // 添加全新的光标
            el.appendChild(cursor);

            index = 0;
            if (typingTimer) clearInterval(typingTimer);

            typingTimer = setInterval(() => {
                if (index < originalText.length) {
                    const textNode = document.createTextNode(originalText[index]);
                    el.insertBefore(textNode, cursor);  // 在光标前插入文字
                    index++;
                } else {
                    clearInterval(typingTimer);
                    typingTimer = null;
                    el.dispatchEvent(new Event('typewriter-done'));

                    // 循环
                    loopTimer = setTimeout(() => {
                        startTyping();
                    }, loopDelay);
                }
            }, speed);
        }

        // 开始打字
        startTyping();

        // 清理函数
        el._typewriterCleanup = () => {
            if (typingTimer) clearInterval(typingTimer);
            if (loopTimer) clearTimeout(loopTimer);
            // 移除光标
            const cursors = el.querySelectorAll('.typewriter-cursor');
            cursors.forEach((c: any) => c.remove());
        };
    },
    unmounted(el) {
        if (el._typewriterCleanup) {
            el._typewriterCleanup();
            delete el._typewriterCleanup;
        }
    }
});




app.mount('#app')
