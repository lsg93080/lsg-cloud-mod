<template>
  <div
    id="forgot-password-section"
    class="flex size-full flex-col items-center justify-center gap-2"
  >
    <p class="text-center">{{ t('auth.forgot-password.description') }}</p>
    <div class="prompt__container flex w-full flex-col">
      <p
        v-if="resetMessage.show"
        :class="{ 'is-error': resetMessage.isError, 'reset-message': true }"
      >
        {{ resetMessage.message }}
      </p>
      <label v-show="false" class="self-start" for="forgotten-password">Email</label>
      <InputText
        type="email"
        id="forgotten-password"
        name="forgotten-password"
        :placeholder="t('auth.forgot-password.email-placeholder')"
        v-model.lazy="resetEmail"
        required
      />
      <Button
        :label="t('auth.forgot-password.submit')"
        @click="handlePassReset"
        class="mt-10 !w-full"
      />
    </div>
    <Button
      :label="t('actions.back')"
      variant="link"
      @click="toggleShowForgottenPassPopup()"
      class="self-start !pl-0"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/composables/useAppStore'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'

const { t } = useI18n()

const props = defineProps({
  showForgottenPassPopup: {
    type: Boolean,
    required: true
  },
  toggleShowForgottenPassPopup: {
    type: Function,
    required: true
  }
})

const resetEmail = ref('')
const resetMessage = ref({ show: false, message: '', isError: false })
const store = useAppStore()

const handlePassReset = async () => {
  if (!resetEmail.value) {
    resetMessage.value = {
      show: true,
      message: t('auth.forgot-password.error'),
      isError: true
    }
    return
  }
  try {
    await store.dispatch('reset', { email: resetEmail.value })
    resetMessage.value = {
      show: true,
      message: t('auth.forgot-password.success'),
      isError: false
    }
    setTimeout(() => {
      props.toggleShowForgottenPassPopup()
    }, 2000)
  } catch {
    resetMessage.value = {
      show: true,
      message: t('auth.forgot-password.error'),
      isError: true
    }
  }
}
</script>
<style scoped>
.reset-message {
  font-weight: 900;
  color: green;
}

.is-error {
  color: red;
}
</style>
