import type { Forager } from 'forager'


type ForagerSpec = {
  media: {
    search: Forager['media']['search']
  }
  tag: {
    list: Forager['tag']['list']
  }
}

export type { ForagerSpec }
