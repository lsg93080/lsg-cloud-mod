<template>
  <Dialog
    v-model:visible="showAuthPopup"
    modal
    :draggable="false"
    :header="dialogTitle"
    :dismissableMask="true"
    contentClass="flex flex-col justify-center items-center size-full px-20"
    :style="{ width: '500px', height: dialogHeight }"
  >
    <ForgotPassword
      v-if="showForgottenPassPopup"
      :showForgottenPassPopup="showForgottenPassPopup"
      :toggleShowForgottenPassPopup="toggleShowForgottenPassPopup"
    />

    <SignInForm
      v-if="!showForgottenPassPopup && showLoginPopup"
      :toggleShowForgottenPassPopup="toggleShowForgottenPassPopup"
      :toggleShowLoginPopup="toggleShowLoginPopup"
      :onAuthComplete="onAuthComplete"
    />

    <SignUpForm
      v-if="!showForgottenPassPopup && !showLoginPopup"
      :toggleShowLoginPopup="toggleShowLoginPopup"
      :onAuthComplete="onAuthComplete"
    />
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Dialog from 'primevue/dialog'
import ForgotPassword from '@/components/auth/ForgotPassword.vue'
import SignInForm from '@/components/auth/SignInForm.vue'
import SignUpForm from '@/components/auth/SignUpForm.vue'

const { t } = useI18n()
const showForgottenPassPopup = ref(false)
const showLoginPopup = ref(true)

const dialogTitle = computed(() =>
  showForgottenPassPopup.value
    ? t('auth.dialog.forgot-password')
    : showLoginPopup.value
      ? t('auth.dialog.sign-in')
      : t('auth.dialog.sign-up')
)

const dialogHeight = computed(() => (showForgottenPassPopup.value ? '400px' : '600px'))

const showAuthPopup = defineModel({
  type: Boolean
})

const toggleShowForgottenPassPopup = () => {
  showForgottenPassPopup.value = !showForgottenPassPopup.value
}

const toggleShowLoginPopup = () => {
  showLoginPopup.value = !showLoginPopup.value
}

const onAuthComplete = async () => {
  showAuthPopup.value = false
}

defineEmits(['forgottenPassPopup', 'isLogin', 'toggleForgottenPassPopup'])
</script>
<style scoped>
* {
  color: #fff;
}
</style>
