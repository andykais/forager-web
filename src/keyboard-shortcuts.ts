const actions = {
  PrevTagSuggestion: 'ArrowUp',
  NextTagSuggestion: 'ArrowDown',

  OpenMedia: 'Enter',
  Escape: 'Escape',
  NextMedia: 'ArrowRight',
  PrevMedia: 'ArrowLeft',
  DownMedia: 'ArrowDown',
  UpMedia: 'ArrowUp',
  FocusSearch: 'Slash',
  FocusNewTag: 'Ctrl-KeyM',
  ToggleFitMedia: 'Ctrl-Space',
  ToggleFullScreen: 'KeyF',
  PlayPauseMedia: 'Space',
  ToggleVideoPreviewVsThumbails: 'KeyT',
  ToggleVideoMute: 'KeyM',

  Star0: 'Digit0',
  Star1: 'Digit1',
  Star2: 'Digit2',
  Star3: 'Digit3',
  Star4: 'Digit4',
  Star5: 'Digit5',
  ToggleViewTags: null,
} as const

const custom_user_actions: Record<keyof typeof actions, string> = {
 NextMedia: 'KeyX', // TODO create config file w/ custom key bindings (like "X")
 PrevMedia: 'Ctrl-KeyX',
}

type KeyboardAction = keyof typeof actions

const keycode_actions: Record<null | string, KeyboardAction> = Object.keys(actions).reduce(
  (acc, action: KeyboardAction) => {
    const keycode = actions[action]
    if(acc[keycode]) acc[keycode].push(action)
    else acc[keycode] = [action]
    return acc
  },
  {}
)
for (const [action, custom_keycode] of Object.entries(custom_user_actions)) {
  if (keycode_actions[custom_keycode]) keycode_actions[custom_keycode].push(action)
  else keycode_actions[custom_keycode] = [action]
}

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
    if(keycode_actions[code] === undefined) return
    for (const action of keycode_actions[code]) {
      if (action) {
        if (this.defined_actions[action]) {
          this.defined_actions[action](e)
        }
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
