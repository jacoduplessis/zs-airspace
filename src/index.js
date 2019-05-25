import App from './app.js'

const app = new Vue({
  render: h => h(App)
})

app.$mount('#app')