import { describe, it, expect } from 'vitest'
import { useInput } from './useInput'

describe('useInput', () => {
  it('initializes with default value and provided value', () => {
    const { value: val1 } = useInput()
    expect(val1.value).toBe('')

    const { value: val2 } = useInput('initial')
    expect(val2.value).toBe('initial')
  })

  it('updates value on input event', () => {
    const { value, onInput } = useInput()
    const input = document.createElement('input')
    input.value = 'hello'

    onInput({ target: input } as unknown as Event)
    expect(value.value).toBe('hello')

    onInput({ target: null } as unknown as Event)
    expect(value.value).toBe('')
  })
})
