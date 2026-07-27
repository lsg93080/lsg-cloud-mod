<template>
  <Toast />
  <AppNavbar />
  <main class="app-content">
    <router-view />
  </main>
</template>
<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue'
import { usePrimeVue } from 'primevue/config'
import { useI18n } from 'vue-i18n'
import AppNavbar from '@/components/navigation/AppNavbar.vue'
import Toast from 'primevue/toast'
import { useAppStore } from '@/composables/useAppStore'

const store = useAppStore()
const primevue = usePrimeVue()
const { locale } = useI18n()

const localeMap: Record<string, Record<string, unknown>> = {
  en: {
    firstDayOfWeek: 0,
    dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    today: 'Today',
    clear: 'Clear'
  },
  es: {
    firstDayOfWeek: 1,
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
    monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    today: 'Hoy',
    clear: 'Limpiar'
  }
}

watch(
  () => store.state.lang as string,
  (lang) => {
    const locale = localeMap[lang] ?? localeMap['en']
    Object.assign(primevue.config.locale ?? {}, locale)
  },
  { immediate: true }
)

const appHeight = () => {
  document.documentElement.style.setProperty('--main-mobile-height', `${window.innerHeight}px`)
}

// Sync language when another tab/iframe changes localStorage 'lang'
const onStorageLangChange = (e: StorageEvent) => {
  if (e.key !== 'lang' || !e.newValue) return
  const lang = e.newValue
  if (locale.value !== lang) locale.value = lang
  if (store.state.lang !== lang) store.commit('mutateLang', lang)
}

onMounted(() => {
  window.addEventListener('resize', appHeight)
  window.addEventListener('storage', onStorageLangChange)
  appHeight()
})

onUnmounted(() => {
  window.removeEventListener('resize', appHeight)
  window.removeEventListener('storage', onStorageLangChange)
})
</script>
<style>
#app {
  -webkit-font-smoothing: antialiased;
  text-align: center;
}

.app-content {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 56px);
}
</style>
