import { ref, type Ref } from 'vue'

export function useInput(initialValue = ''): {
  value: Ref<string>
  onInput: (e: Event) => void
} {
  const value = ref(initialValue)
  const onInput = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
    value.value = target?.value ?? ''
  }
  return { value, onInput }
}
