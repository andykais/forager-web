const actions = {
  OpenMedia: 'Enter',
  CloseMedia: 'Escape',
  NextMedia: 'ArrowRight',
  PrevMedia: 'ArrowLeft',
  DownMedia: 'ArrowDown',
  UpMedia: 'ArrowUp',
  FocusSearch: 'Slash',
  FocusNewTag: 'Ctrl-KeyM',
  ToggleFitMedia: null,
  ToggleFullScreen: 'KeyF',
  PlayPauseMedia: 'Space',
  ToggleVideoPreviewVsThumbails: 'KeyT',

  Star0: 'Digit0',
  Star1: 'Digit1',
  Star2: 'Digit2',
  Star3: 'Digit3',
  Star4: 'Digit4',
  Star5: 'Digit5',
  ToggleViewTags: null,
} as const

type KeyboardAction = keyof typeof actions

const keycode_actions: Record<null | string, KeyboardAction> = Object.keys(actions).reduce(
  (acc, action: KeyboardAction) => {
    const keycode = actions[action]
    acc[keycode] = action
    return acc
  },
  {}
)

class KeyboardShortcuts {
  private disabled = false
  public constructor(defined_actions: Record<KeyboardAction, () => void>) {
    this.defined_actions = defined_actions
  }
  public handler = (e) => {
    if (this.disabled) return
    const keys_down = []
    if (e.ctrlKey) keys_down.push('Ctrl')
    keys_down.push(e.code)
    const code = keys_down.join('-')
    const action = keycode_actions[code]
    if (action) {
      if (this.defined_actions[action]) {
        this.defined_actions[action](e)
      }
    }
  }

  public disable() {
    this.disabled = true
  }
  public enable() {
    this.disabled = false
  }
}

export { KeyboardShortcuts }
