import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store, { key } from './store'
import { authInstance } from './config/firebase-config'
import './assets/styles/main.css'
import { onAuthStateChanged } from '@firebase/auth'
import {
  FontAwesomeIcon,
  FontAwesomeLayers,
  FontAwesomeLayersText
} from '@fortawesome/vue-fontawesome'

import { createI18n } from 'vue-i18n'

import '@/utils/icons'

import en from './i18n/en.json'
import es from './i18n/es.json'
import configurePrimeVue from '@/config/primevue-config'
import Tooltip from 'primevue/tooltip'
import ToastService from 'primevue/toastservice'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('lang') || (navigator.language.startsWith('es') ? 'es' : 'en'),
  messages: {
    en: en,
    es: es
  },
  fallbackLocale: 'en'
})

// Defer app mount until Firebase resolves auth state (same pattern as Vitrina).
// This prevents views from firing API calls before the JWT is available.
let app

onAuthStateChanged(authInstance, async (user) => {
  if (user) {
    await store.dispatch('initLogin')
  } else {
    // Only clear platform state if there is no existing JWT.
    // Firebase auth state can briefly flicker to null during token refresh.
    if (!localStorage.getItem('vitrina_jwt')) {
      store.dispatch('clearPlatformSession')
    }
  }

  if (!app) {
    app = createApp(App)
      .directive('focus', {
        mounted(el) {
          el.focus()
        }
      })
      .use(i18n)
      .use(store, key)
      .use(router)
      .use(configurePrimeVue)
      .use(ToastService)
      .component('font-awesome-icon', FontAwesomeIcon)
      .component('font-awesome-layers', FontAwesomeLayers)
      .component('font-awesome-layers-text', FontAwesomeLayersText)
      .directive('tooltip', Tooltip)
      .mount('#app')
  }
})
