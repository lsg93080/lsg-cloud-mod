<template>
  <form class="flex w-full flex-col items-center justify-center" @submit.prevent="handleSignUp">
    <section class="flex w-full flex-col items-start justify-center">
      <label for="username">{{ t('auth.sign-up.username-label') }}</label>
      <InputText
        id="username"
        name="username"
        type="text"
        :placeholder="t('auth.sign-up.username-placeholder')"
        autocomplete="username"
        v-model.lazy="registerCredentials.username"
        required="true"
        class="mb-4 w-full"
      />
      <Message v-if="errorMessage" severity="error" class="mb-3 w-full">{{ errorMessage }}</Message>
      <label for="email">{{ t('auth.sign-up.email-label') }}</label>
      <InputText
        id="email"
        name="email"
        type="email"
        :placeholder="t('auth.sign-up.email-placeholder')"
        autocomplete="email"
        v-model.lazy="registerCredentials.email"
        required="true"
        class="mb-4 w-full"
      />
      <label for="password">{{ t('auth.sign-up.password-label') }}</label>
      <InputText
        id="password"
        name="password"
        type="password"
        :placeholder="t('auth.sign-up.password-placeholder')"
        autocomplete="new-password"
        v-model.lazy="registerCredentials.password"
        required="true"
        minLength="8"
        class="mb-4 w-full"
      />
      <label for="confirmPassword">{{ t('auth.sign-up.confirm-password-label') }}</label>
      <InputText
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        :placeholder="t('auth.sign-up.confirm-password-placeholder')"
        autocomplete="new-password"
        v-model.lazy="registerCredentials.confirmPassword"
        required="true"
        minLength="8"
        class="mb-4 w-full"
      />
      <Button class="w-full" :label="t('auth.sign-up.submit')" type="submit" :loading="isLoading" />
    </section>
  </form>
  <Button
    :label="t('actions.back')"
    variant="link"
    @click="props.toggleShowLoginPopup()"
    class="self-start !pl-0"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/composables/useAppStore'
import { useI18n } from 'vue-i18n'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'

const props = defineProps({
  toggleShowLoginPopup: {
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
const registerCredentials = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const FIREBASE_ERRORS: Record<string, string> = {
  'auth/email-already-in-use': t('auth.sign-up.error-email-in-use'),
  'auth/weak-password': t('auth.sign-up.error-weak-password'),
  'auth/invalid-email': t('auth.sign-up.error-invalid-email')
}

const handleSignUp = async () => {
  errorMessage.value = ''
  if (registerCredentials.value.password !== registerCredentials.value.confirmPassword) {
    errorMessage.value = t('auth.sign-up.error-passwords-mismatch')
    return
  }
  isLoading.value = true
  try {
    await store.dispatch('signup', registerCredentials.value)
    if (store.state.isLogged) {
      await props.onAuthComplete()
    }
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code ?? ''
    errorMessage.value = FIREBASE_ERRORS[code] ?? t('auth.sign-up.error-default')
    console.warn('[SignUpForm] Sign up failed:', error)
  } finally {
    isLoading.value = false
  }
}
</script>
<style scoped></style>
