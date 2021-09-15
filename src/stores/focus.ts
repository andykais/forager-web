import { writable, derived } from 'svelte/store'

type Focus =
  | 'thumbnail_grid'
  | 'media_file'
  | 'media_file:fullscreen'
  | 'search:stars'
  | 'search:tag:input'
  | 'search:tag:suggestion'

const focus_stack = writable(['thumbnail_grid'])
const focus_derived = derived(focus_stack, $focus_stack => $focus_stack.at(-1))

const focus = {
  subscribe: focus_derived.subscribe,
  stack: (focus: Focus) => {
    focus_stack.update(old_stack => {
      console.log({ old_stack })
      const focus_in_stack = old_stack.indexOf(focus)
      // ensure we dont double stack the same focus
      if(focus_in_stack !== -1) return old_stack.slice(0, focus_in_stack + 1)
      old_stack.push(focus)
      return old_stack
    })
  },
  pop: (focus: Focus) => {
    focus_stack.update(old_stack => {
      const new_stack = []
      for (const item of old_stack) {
        if (item === focus) break
        new_stack.push(item)
      }
      if (new_stack.length === 0) new_stack.push('thumbnail_grid')
      return new_stack
    })
  },
  reset: (focus: Focus) => {
    focus_stack.set([focus])
  }
}

export type { Focus }
export { focus }
