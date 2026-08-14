import { ref } from 'vue'

export interface SnackbarOptions {
  text: string
  color: string
}

export const messages = ref<SnackbarOptions[]>([])

export function triggerSuccessSnackbar(message: string) {
  messages.value.push({
    text: message,
    color: 'success',
  })
}

export function triggerErrorSnackbar(message: string) {
  messages.value.push({
    text: message,
    color: 'error',
  })
}
