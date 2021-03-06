import type { Request } from '@sveltejs/kit'

export async function get(request: Request) {
  const { forager } = request.locals
  const { media_reference_id } = request.params
  const thumbnail = forager.media.get_thumbnail(media_reference_id)
  return {
    headers: {'content-type': 'image/jpeg'},
    body: thumbnail
  }
}
