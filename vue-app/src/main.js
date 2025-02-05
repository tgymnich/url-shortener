import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
createApp(App).mount('#app');

// const app = createApp({
//     data() {
//         return {
//             longUrl: null,
//             shortUrl: null,
//             error: false,
//             errorMessage: null,
//         };
//     },
//     methods: {
//         handleUrlSubmit() {
//             fetch('/shorten', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     url: this.longUrl,
//                 }),
//             })
//                 .then((response) => {
//                     if (response.status == 200) {
//                         this.error = false;
//                         return response.json();
//                     } else {
//                         throw new Error('Issue saving URL');
//                     }
//                 })
//                 .then((data) => {
//                     this.shortUrl = data.url;
//                 })
//                 .catch((error) => {
//                     this.error = true;
//                 });
//         },
//     },
// });
// app.mount('#app');
