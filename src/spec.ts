import type { Forager } from 'forager'


type ForagerSpec = {
  media: {
    update: Forager['media']['update']
    search: Forager['media']['search']
    get_file_info: Forager['media']['get_file_info']
  }
  tag: {
    list: Forager['tag']['list']
  }
}

export type { ForagerSpec }
