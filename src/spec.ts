import type { Forager } from 'forager'

type ForagerSpec = {
  media: {
    list: Forager['media']['list']
    search: Forager['media']['search']
    get_reference: Forager['media']['get_reference']
    get_media_info: Forager['media']['get_media_info']
    get_thumbnail: Forager['media']['get_thumbnail']
    get_thumbnails_info: Forager['media']['get_thumbnails_info']
    update: Forager['media']['update']
  }
  tag: {
    list: Forager['tag']['list']
    search: Forager['tag']['search']
    add_tags: Forager['tag']['add_tags']
    remove_tags: Forager['tag']['remove_tags']
  }
}

export type { ForagerSpec }
