<template>
  <header ref="navRef">
    <nav>
      <div class="nav-left">
        <AppLogo />
        <ul class="nav-menu" :class="{ 'nav-menu--open': mobileMenuOpen }">
          <li class="nav-item">
            <a :href="externalRoutes.home" class="nav-link" @click="closeMobile">
              <font-awesome-icon icon="home" class="nav-icon" />
              {{ t('nav.home') }}
            </a>
          </li>

          <!-- Dashboard (auth only, links to Vitrina) -->
          <li
            v-if="isLoggedIn"
            class="nav-item nav-item--dropdown"
            @mouseenter="openDropdown('dashboard')"
            @mouseleave="closeDropdown('dashboard')"
          >
            <button class="nav-link" @click="toggleDropdown('dashboard')">
              <font-awesome-icon icon="tachometer-alt" class="nav-icon" />
              {{ t('nav.dashboard') }}
              <font-awesome-icon icon="chevron-down" class="chevron" :class="{ 'chevron--open': dropdowns.dashboard }" />
            </button>
            <ul v-show="dropdowns.dashboard" class="dropdown">
              <li>
                <a :href="vitrinaUrl + '/#/dashboard/apps'" class="dropdown-link" @click="closeMobile">
                  <font-awesome-icon icon="cube" class="dropdown-icon" />
                  {{ t('nav.contributions') }}
                </a>
              </li>
              <li>
                <a :href="vitrinaUrl + '/#/dashboard/reviews'" class="dropdown-link" @click="closeMobile">
                  <font-awesome-icon icon="comments" class="dropdown-icon" />
                  {{ t('nav.reviews') }}
                </a>
              </li>
              <li>
                <a :href="vitrinaUrl + '/#/dashboard/moderations'" class="dropdown-link" @click="closeMobile">
                  <font-awesome-icon icon="clipboard-check" class="dropdown-icon" />
                  {{ t('nav.moderations') }}
                </a>
              </li>
            </ul>
          </li>

          <!-- Cloud Profile (auth only): always active in this app -->
          <li
            v-if="isLoggedIn"
            class="nav-item nav-item--dropdown"
            @mouseenter="openDropdown('cloud')"
            @mouseleave="closeDropdown('cloud')"
          >
            <button
              class="nav-link nav-link--active"
              @click="toggleDropdown('cloud')"
            >
              <font-awesome-icon icon="user" class="nav-icon" />
              {{ t('nav.cloud') }}
              <font-awesome-icon icon="chevron-down" class="chevron" :class="{ 'chevron--open': dropdowns.cloud }" />
            </button>
            <ul v-show="dropdowns.cloud" class="dropdown">
              <li>
                <router-link :to="{ name: 'Statistics' }" class="dropdown-link" @click="closeMobile">
                  <font-awesome-icon icon="chart-bar" class="dropdown-icon" />
                  {{ t('nav.statistics') }}
                </router-link>
              </li>
              <li>
                <router-link :to="{ name: 'TimeSeries' }" class="dropdown-link" @click="closeMobile">
                  <font-awesome-icon icon="chart-line" class="dropdown-icon" />
                  {{ t('nav.time-series') }}
                </router-link>
              </li>
              <li>
                <router-link :to="{ name: 'SensorAssociation' }" class="dropdown-link" @click="closeMobile">
                  <font-awesome-icon icon="satellite-dish" class="dropdown-icon" />
                  {{ t('nav.sensor-association') }}
                </router-link>
              </li>
              <li>
                <router-link :to="{ name: 'DataEndpoints' }" class="dropdown-link" @click="closeMobile">
                  <font-awesome-icon icon="database" class="dropdown-icon" />
                  {{ t('nav.data-endpoints') }}
                </router-link>
              </li>
            </ul>
          </li>

          <!-- Store (links to Vitrina) -->
          <li
            class="nav-item nav-item--dropdown"
            @mouseenter="openDropdown('store')"
            @mouseleave="closeDropdown('store')"
          >
            <button class="nav-link" @click="toggleDropdown('store')">
              <font-awesome-icon icon="store" class="nav-icon" />
              {{ t('nav.catalog') }}
              <font-awesome-icon icon="chevron-down" class="chevron" :class="{ 'chevron--open': dropdowns.store }" />
            </button>
            <ul v-show="dropdowns.store" class="dropdown">
              <li>
                <a :href="vitrinaUrl + '/#/store/publications'" class="dropdown-link" @click="closeMobile">
                  <font-awesome-icon icon="gamepad" class="dropdown-icon" />
                  {{ t('nav.publications') }}
                </a>
              </li>
              <li>
                <a :href="vitrinaUrl + '/#/store/contributors'" class="dropdown-link" @click="closeMobile">
                  <font-awesome-icon icon="users" class="dropdown-icon" />
                  {{ t('nav.contributors') }}
                </a>
              </li>
              <li v-if="isLoggedIn">
                <a :href="vitrinaUrl + '/#/store/publish'" class="dropdown-link" @click="closeMobile">
                  <font-awesome-icon icon="upload" class="dropdown-icon" />
                  {{ t('nav.publish') }}
                </a>
              </li>
              <li>
                <a :href="vitrinaUrl + '/#/store/stats'" class="dropdown-link" @click="closeMobile">
                  <font-awesome-icon icon="chart-bar" class="dropdown-icon" />
                  {{ t('nav.stats') }}
                </a>
              </li>
            </ul>
          </li>

          <!-- Admin (admin only, links to Vitrina) -->
          <li
            v-if="isAdmin"
            class="nav-item nav-item--dropdown"
            @mouseenter="openDropdown('admin')"
            @mouseleave="closeDropdown('admin')"
          >
            <button class="nav-link" @click="toggleDropdown('admin')">
              <font-awesome-icon icon="shield-alt" class="nav-icon" />
              {{ t('nav.admin') }}
              <font-awesome-icon icon="chevron-down" class="chevron" :class="{ 'chevron--open': dropdowns.admin }" />
            </button>
            <ul v-show="dropdowns.admin" class="dropdown">
              <li>
                <a :href="vitrinaUrl + '/#/admin/reports'" class="dropdown-link" @click="closeMobile">
                  <font-awesome-icon icon="flag" class="dropdown-icon" />
                  {{ t('admin.reports-queue') }}
                </a>
              </li>
            </ul>
          </li>

          <!-- Mobile-only account section -->
          <li v-if="isLoggedIn" class="mobile-account-section">
            <div class="mobile-divider" />
            <div class="mobile-account-info">
              <img
                class="mobile-account-avatar"
                :src="avatar"
                referrerpolicy="no-referrer"
                alt=""
                @error="onAvatarError"
              />
              <span class="mobile-account-name">{{ userName }}</span>
            </div>
            <a :href="vitrinaUrl + '/#/settings'" class="dropdown-link" @click="closeMobile">
              <font-awesome-icon icon="gear" class="dropdown-icon" />
              {{ t('settings.title') }}
            </a>
            <button class="dropdown-link w-full" @click="handleLogout">
              <font-awesome-icon icon="sign-out-alt" class="dropdown-icon" />
              {{ t('login.logout') }}
            </button>
          </li>
        </ul>
      </div>

      <div class="nav-right">
        <a :href="vitrinaUrl + '/#/store/publications'" class="nav-action" title="Search">
          <font-awesome-icon icon="search" />
        </a>

        <button
          class="nav-action"
          :title="isDark ? t('header.switch-to-light') : t('header.switch-to-dark')"
          :aria-label="isDark ? t('header.switch-to-light') : t('header.switch-to-dark')"
          @click="toggleTheme"
        >
          <font-awesome-icon :icon="isDark ? 'sun' : 'moon'" />
        </button>

        <button
          class="nav-action lang-toggle"
          :title="t('header.change-language')"
          @click="toggleLanguage"
        >
          <font-awesome-icon icon="globe" />
          <span class="lang-label">{{ currentLang }}</span>
        </button>

        <Button
          v-if="!isLoggedIn"
          size="small"
          class="!h-9"
          :label="t('header.unlogged')"
          @click="showAuthPopup = !showAuthPopup"
        />

        <!-- Avatar dropdown: desktop only -->
        <div
          v-else
          class="nav-item nav-item--dropdown nav-account"
          @mouseenter="openDropdown('account')"
          @mouseleave="closeDropdown('account')"
        >
          <button class="nav-link !p-1" @click="toggleDropdown('account')">
            <img
              class="size-[36px] rounded-full"
              :src="avatar"
              referrerpolicy="no-referrer"
              alt=""
              @error="onAvatarError"
            />
            <font-awesome-icon
              icon="chevron-down"
              class="chevron"
              :class="{ 'chevron--open': dropdowns.account }"
            />
          </button>
          <ul v-show="dropdowns.account" class="dropdown !right-0 !left-auto">
            <li class="px-4 py-2 text-sm font-medium text-[var(--text-color)]">
              {{ userName }}
            </li>
            <li class="mx-2 h-px bg-white/10" />
            <li>
              <a :href="vitrinaUrl + '/#/settings'" class="dropdown-link" @click="closeMobile">
                <font-awesome-icon icon="gear" class="dropdown-icon" />
                {{ t('settings.title') }}
              </a>
            </li>
            <li>
              <button class="dropdown-link w-full" @click="handleLogout">
                <font-awesome-icon icon="sign-out-alt" class="dropdown-icon" />
                {{ t('login.logout') }}
              </button>
            </li>
          </ul>
        </div>

        <button class="hamburger" @click="toggleMobileMenu">
          <font-awesome-icon :icon="mobileMenuOpen ? 'times' : 'bars'" />
        </button>
      </div>

      <AuthPopup v-model="showAuthPopup" />
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import AuthPopup from '@/components/auth/AuthPopup.vue'
import AppLogo from '@/components/common/AppLogo.vue'
import Button from 'primevue/button'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/composables/useAppStore'
import { useTheme } from '@/composables/useTheme'
import { useToast } from 'primevue/usetoast'
import { externalRoutes } from '@/config/externalRoutes'

const navRef = ref<HTMLElement | null>(null)

const { t, locale } = useI18n()
const route = useRoute()
const store = useAppStore()
const { isDark, toggleTheme } = useTheme()
const toast = useToast()

const vitrinaUrl = externalRoutes.vitrina

const showAuthPopup = ref(false)
const mobileMenuOpen = ref(false)

const isLoggedIn = computed(() => store.state.isLogged)
const isAdmin = computed(() => isLoggedIn.value && (store.state.roles as string[]).includes('admin'))

const DEFAULT_AVATAR = 'https://www.pngall.com/wp-content/uploads/5/User-Profile-PNG-Image.png'
const avatar = computed(
  () => store.state.appUserCredentials.photoUrl ?? DEFAULT_AVATAR
)
const userName = computed(() => store.state.appUserCredentials.displayName ?? 'User')
const onAvatarError = (e: Event) => {
  ;(e.target as HTMLImageElement).src = DEFAULT_AVATAR
}

const currentLang = computed(() => locale.value.toUpperCase())
const toggleLanguage = () => {
  const next = locale.value === 'es' ? 'en' : 'es'
  locale.value = next
  store.commit('mutateLang', next)
  localStorage.setItem('lang', next)
}

const handleLogout = async () => {
  try {
    await store.dispatch('logout')
    localStorage.clear()
    localStorage.setItem('lang', locale.value)
    window.location.reload()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: String(error), life: 4000 })
  }
}

const dropdowns = reactive({
  dashboard: false,
  cloud: false,
  store: false,
  admin: false,
  account: false,
})

type DropdownKey = keyof typeof dropdowns

const closeTimers: Partial<Record<DropdownKey, ReturnType<typeof setTimeout>>> = {}

const openDropdown = (key: DropdownKey) => {
  if (mobileMenuOpen.value) return
  if (closeTimers[key]) {
    clearTimeout(closeTimers[key])
    delete closeTimers[key]
  }
  dropdowns[key] = true
}

const closeDropdown = (key: DropdownKey) => {
  if (mobileMenuOpen.value) return
  closeTimers[key] = setTimeout(() => {
    dropdowns[key] = false
  }, 100)
}

const toggleDropdown = (key: DropdownKey) => { dropdowns[key] = !dropdowns[key] }

const closeAllDropdowns = () => {
  for (const key of Object.keys(dropdowns) as DropdownKey[]) {
    if (closeTimers[key]) clearTimeout(closeTimers[key])
    dropdowns[key] = false
  }
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
  if (mobileMenuOpen.value) {
    closeAllDropdowns()
    // Cloud is always the active section in this app
    if (isLoggedIn.value) dropdowns.cloud = true
  } else {
    closeAllDropdowns()
  }
}

const closeMobile = () => {
  mobileMenuOpen.value = false
  closeAllDropdowns()
}

const onClickOutside = (e: MouseEvent) => {
  if (mobileMenuOpen.value && navRef.value && !navRef.value.contains(e.target as Node)) {
    closeMobile()
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))

watch(() => route.path, closeMobile)
</script>

<style scoped>
header {
  width: 100%;
  background: var(--navbar-gradient);
  background-color: var(--navbar-bg-color);
  z-index: 100;
  box-shadow: 0px 6px 10px -12px var(--primary-color);
  position: sticky;
  top: 0;
}

header a {
  color: inherit;
  text-decoration: none;
}

header:hover {
  box-shadow: 0px 0px 10px -3px var(--primary-color);
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: auto;
  padding-inline: 1rem;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 0.25rem;
  margin: 0;
  padding: 0;
}

.nav-item {
  position: relative;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
  color: white;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s, color 0.2s;
  line-height: 56px;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--primary-color);
}

.nav-link--active {
  color: var(--primary-color);
}

.nav-icon {
  font-size: 0.85rem;
  opacity: 0.8;
}

.chevron {
  font-size: 0.6rem;
  opacity: 0.6;
  transition: transform 0.2s;
}

.chevron--open {
  transform: rotate(180deg);
}

.dropdown {
  position: absolute;
  top: calc(100% - 4px);
  left: 0;
  padding-top: 4px;
  min-width: 200px;
  background: var(--dropdown-bg-color);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 0.4rem 0;
  list-style: none;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: 200;
  animation: dropdown-in 0.15s ease-out;
}

@keyframes dropdown-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-link {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 1rem;
  color: var(--text-color);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 400;
  transition: background 0.15s, color 0.15s;
}

.dropdown-link:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--primary-color);
}

.dropdown-icon {
  width: 1rem;
  text-align: center;
  opacity: 0.7;
  font-size: 0.8rem;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  transition: background 0.2s, color 0.2s;
}

.nav-action:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--primary-color);
}

.lang-toggle {
  gap: 0.25rem;
  width: auto;
  padding-inline: 0.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-family: inherit;
}

.lang-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.hamburger {
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.3rem;
  cursor: pointer;
  padding: 0.5rem;
}

.nav-menu :deep(.router-link-exact-active) {
  color: var(--primary-color);
}

.dropdown :deep(.router-link-exact-active) {
  color: var(--primary-color);
  background: var(--primary-color-10);
}

.mobile-account-section {
  display: none;
}

@media screen and (max-width: 769px) {
  .hamburger {
    display: flex;
  }

  .nav-account {
    display: none;
  }

  .nav-menu {
    display: none;
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    max-height: calc(100dvh - 56px);
    overflow-y: auto;
    background: var(--navbar-bg-color);
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    padding: 0.75rem 0;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    z-index: 150;
  }

  .nav-menu--open {
    display: flex;
  }

  .nav-link {
    line-height: normal;
    padding: 0.875rem 1.25rem;
    font-size: 1rem;
    width: 100%;
  }

  .nav-item--dropdown {
    flex-direction: column;
  }

  .dropdown {
    position: static;
    background: transparent;
    border: none;
    box-shadow: none;
    padding: 0 0 0 1rem;
    animation: none;
  }

  .dropdown-link {
    padding: 0.875rem 1.25rem;
    font-size: 0.95rem;
    width: 100%;
    color: white;
  }

  .mobile-account-section {
    display: flex;
    flex-direction: column;
  }

  .mobile-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
    margin: 0.5rem 1rem;
  }

  .mobile-account-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.25rem;
  }

  .mobile-account-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .mobile-account-name {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-color);
  }
}
</style>
