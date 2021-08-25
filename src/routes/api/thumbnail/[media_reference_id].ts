import { forager } from  '../../../forager'
import type { Request } from '@sveltejs/kit'

export async function get({ params }: Request) {
  const { media_reference_id } = params
  const thumbnail = forager.media.get_thumbnail(media_reference_id)
  return {
    headers: {'content-type': 'application/octet-stream'},
    body: thumbnail
  }
}
