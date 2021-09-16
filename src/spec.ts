import type { Forager } from 'forager'


type ForagerSpec = {
  media: {
    update: Forager['media']['update']
    search: Forager['media']['search']
    list: Forager['media']['list']
    update: Forager['media']['update']
    add_view: Forager['media']['add_view']
    get_file_info: Forager['media']['get_file_info']
  }
  tag: {
    list: Forager['tag']['list']
    search: Forager['tag']['search']
    get_tags: Forager['tag']['get_tags']
    add_tags: Forager['tag']['add_tags']
    remove_tags: Forager['tag']['remove_tags']
  }
}

export type { ForagerSpec }
