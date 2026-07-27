import PrimeVue from 'primevue/config'
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import type { App } from 'vue'

import { palette } from '@primeuix/themes'
const MyPreset = definePreset(Aura, {
  semantic: {
    primary: palette('#FA5E15')
  }
})

const configurePrimeVue = (app: App) => {
  app.use(PrimeVue, {
    theme: {
      preset: MyPreset,
      options: {
        darkModeSelector: '[data-theme="dark"]',
        cssLayer: false
      }
    }
  })
}

export default configurePrimeVue
