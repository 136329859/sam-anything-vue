import { createApp } from 'vue';
import App from 'sam/App.vue';
import { pinia } from 'sam/store';

createApp(App).use(pinia).mount('#root');
