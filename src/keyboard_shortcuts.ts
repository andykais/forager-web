import { onMount, onDestroy } from 'svelte'
import type { Config } from './config'

type Focus =
  | 'media_list'
  | 'media_view'
  | 'search:tag:input'
  | 'search:tag:suggestions'
  | 'modify:tag:input'
  | 'modify:tag:suggestions'

type Action =
  | 'Enter'
  | 'Close'
  | 'NextMedia'
  | 'PrevMedia'
  | 'NextTagSuggestion'
  | 'PrevTagSuggestion'
  | 'FocusSearchTag'
  | 'ShiftDown'
  | 'ShiftUp'

const actions: Record<Action, {focus: Focus[]; shortcuts: string[]}> = {
  Close: {
    focus: ['media_view', 'search:tag:input', 'search:tag:suggestions', 'modify:tag:input', 'modify:tag:suggestions'],
    shortcuts: ['Escape'],
  },
  NextMedia: {
    focus: ['media_list', 'media_view'],
    shortcuts: ['ArrowRight'],
  },
  PrevMedia: {
    focus: ['media_list', 'media_view'],
    shortcuts: ['ArrowLeft'],
  },
  NextTagSuggestion: {
    focus: ['search:tag:input', 'search:tag:suggestions', 'modify:tag:input', 'modify:tag:suggestions'],
    shortcuts: ['ArrowDown'],
  },
  PrevTagSuggestion: {
    focus: ['search:tag:input', 'search:tag:suggestions', 'modify:tag:input', 'modify:tag:suggestions'],
    shortcuts: ['ArrowUp'],
  },
  FocusSearchTag: {
    focus: ['media_list', 'media_view'],
    shortcuts: ['Slash']
  },
  Enter: {
    focus: ['search:tag:input'],
    shortcuts: ['Enter']
  },
  ShiftDown: {
    focus: ['media_list'],
    shortcuts: ['ShiftDown']
  },
  ShiftUp: {
    focus: ['media_list'],
    shortcuts: ['ShiftUp']
  },
}

class KeyDownSingleton {
  listeners: Partial<Record<Focus, KeyboardShortcuts[]>> = {}
  _focus: Focus[] = ['media_list']

  shortcuts: {[shortcut: string]: Action} = {}


  constructor(config: Config) {
    for (const action of Object.keys(actions) as Action[]) {
      for (const shortcut of actions[action].shortcuts) {
        this.shortcuts[shortcut] = action
      }
    }
    for (const def of config.keyboard_shortcuts ?? []) {
      this.shortcuts[def.shortcut] = def.action as Action
    }
    window.onkeydown = (e: KeyboardEvent) => {
      let keysdown = e.code
      if (e.shiftKey) this.trigger_shortcut('ShiftDown')
      if (e.ctrlKey) keysdown = 'Ctrl-' + keysdown
      if(this.trigger_shortcut(keysdown)) {
        e.preventDefault()
      }
    }
    window.onkeyup = (e: KeyboardEvent) => {
      if (e.key === 'Shift') this.trigger_shortcut('ShiftUp')
    }
  }
  trigger_shortcut(action_key: string) {
    let triggered = false
    const action = this.shortcuts[action_key]
    if (action) {
      const focus_id = this._focus.at(-1)
      const action_definition = actions[action]
      if (action_definition.focus.includes(focus_id)) {
        for (const listener of this.listeners[focus_id]) {
          triggered = true
          listener.keyboard_event(action)
        }
      }
    }
    return triggered
  }
  add_listener(listener: KeyboardShortcuts) {
    const focus_id = listener.focus_id
    this.listeners[focus_id] = this.listeners[focus_id] ?? []
    this.listeners[focus_id].push(listener)
  }
  remove_listener(listener: KeyboardShortcuts) {
    const focus_id = listener.focus_id
    const listener_list = this.listeners[focus_id]
    listener_list.splice(listener_list.indexOf(listener), 1)
  }

  static _instance: KeyDownSingleton
  static instance(config: Config) {
    if (this._instance === undefined) this._instance = new KeyDownSingleton(config)
    return this._instance
  }

  focus(focus: Focus) {
    const focus_index = this._focus.indexOf(focus)
    if (focus_index === -1) this._focus.push(focus)
    else this._focus.splice(focus_index + 1)
    console.log('focus', focus, focus_index, this._focus)
    // for (const listener of this.listeners) listener._trigger_focus(focus)
  }
  focus_pop(focus: Focus) {
    const focus_index = this._focus.indexOf(focus)
    if (focus_index !== -1) {
      this._focus.splice(focus_index)
      // for (const listener of this.listeners) listener._trigger_focus(focus)
    }
    console.log('removed focus', focus, this._focus)
  }
}

type ShortcutHandlers = Partial<Record<Action, () => void>>

class KeyboardShortcuts {
  private keydown: KeyDownSingleton

  public constructor(config: Config, public focus_id: Focus, private shortcut_handlers: ShortcutHandlers) {
    onMount(() => {
      this.keydown = KeyDownSingleton.instance(config)
      this.keydown.add_listener(this)
    })
    onDestroy(() => {
      this.keydown?.remove_listener(this)
    })
  }

  public focus() {
    this.keydown.focus(this.focus_id)
  }

  public remove_focus() {
    this.keydown.focus_pop(this.focus_id)
  }

  public keyboard_event(action: Action) {
    if (this.shortcut_handlers[action]) {
      this.shortcut_handlers[action]()
    }
  }
}

export { KeyboardShortcuts }
