import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { triggerErrorSnackbar } from './component/snackBar/snackBar.ts'
const vuetify = createVuetify({
  components,
  directives,
})
const app = createApp(App)

app.use(vuetify)

app.use(router)

app.mount('#app')

app.config.errorHandler = (err) => {
  console.error('Global Vue Error:', err)

  const message =
    err instanceof Error
      ? err.message
      : typeof err === 'string'
        ? err
        : 'An unexpected error occurred.'

  triggerErrorSnackbar(message)
}
