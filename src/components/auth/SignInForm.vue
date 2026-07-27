<template>
  <form class="flex w-full flex-col items-center justify-center" @submit.prevent="handleSignIn">
    <section class="flex w-full flex-col items-start justify-center">
      <Message v-if="errorMessage" severity="error" class="mb-3 w-full">{{ errorMessage }}</Message>
      <label for="loginEmail">{{ t('auth.sign-in.email-label') }}</label>
      <InputText
        id="loginEmail"
        name="loginEmail"
        type="email"
        :placeholder="t('auth.sign-in.email-placeholder')"
        autocomplete="email"
        v-model.lazy.trim="loginCredentials.email"
        required
        class="mb-4 w-full"
      />
      <label for="loginPassword">{{ t('auth.sign-in.password-label') }}</label>
      <InputText
        id="loginPassword"
        name="loginPassword"
        type="password"
        :placeholder="t('auth.sign-in.password-placeholder')"
        autocomplete="current-password"
        v-model.lazy="loginCredentials.password"
        required
        minlength="8"
        class="w-full"
      />
      <Button
        size="small"
        :label="t('auth.sign-in.forgot-password')"
        class="mb-4 !w-fit self-start !px-0"
        variant="link"
        @click.prevent="toggleShowForgottenPassPopup()"
      />
      <Button class="w-full" :label="t('auth.sign-in.submit')" type="submit" :loading="isLoading" />
    </section>
    <Divider class="p-4">OR</Divider>
    <section class="flex !w-fit flex-col gap-2">
      <Button
        :label="t('auth.sign-in.register-link')"
        variant="outlined"
        @click.prevent="props.toggleShowLoginPopup()"
      >
        <template #icon><font-awesome-icon :icon="['fas', 'user-plus']" /></template>
      </Button>
      <Button
        :label="t('auth.sign-in.github')"
        variant="outlined"
        @click.prevent="handleSignInWithGitHub"
      >
        <template #icon><font-awesome-icon :icon="['fab', 'github']" /></template>
      </Button>
      <Button
        :label="t('auth.sign-in.google')"
        variant="outlined"
        @click.prevent="handleSignInWithGoogle"
      >
        <template #icon><font-awesome-icon :icon="['fab', 'google']" /></template>
      </Button>
    </section>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/composables/useAppStore'
import { useI18n } from 'vue-i18n'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Divider from 'primevue/divider'
import Message from 'primevue/message'

const props = defineProps({
  toggleShowLoginPopup: {
    type: Function,
    required: true
  },
  toggleShowForgottenPassPopup: {
    type: Function,
    required: true
  },
  onAuthComplete: {
    type: Function,
    required: true
  }
})

const { t } = useI18n()
const store = useAppStore()
const isLoading = ref(false)
const errorMessage = ref('')

const FIREBASE_ERRORS: Record<string, string> = {
  'auth/invalid-credentials': t('auth.sign-in.error-invalid-credentials'),
  'auth/account-exists-with-different-credential': t('auth.sign-in.error-account-conflict')
}
const loginCredentials = ref({ email: '', password: '' })

const handleAuth = async (provider?: string) => {
  errorMessage.value = ''

  // Validate required fields for email/password sign-in
  if (!provider) {
    if (!loginCredentials.value.email || !loginCredentials.value.password) {
      errorMessage.value = t('auth.sign-in.error-required')
      return
    }
  }

  isLoading.value = true
  try {
    await store.dispatch('login', provider ? { provider } : loginCredentials.value)
    if (store.state.isLogged) {
      await props.onAuthComplete()
    }
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code ?? ''
    errorMessage.value = FIREBASE_ERRORS[code] ?? t('auth.sign-in.error-default')
  } finally {
    isLoading.value = false
  }
}

const handleSignIn = () => handleAuth()
const handleSignInWithGitHub = () => handleAuth('github')
const handleSignInWithGoogle = () => handleAuth('google')
</script>
<style scoped></style>
