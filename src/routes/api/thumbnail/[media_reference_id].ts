import type { Request } from  '../../../hooks'

export async function get(request: Request) {
  const { forager } = request.locals
  const media_reference_id = parseInt(request.params.media_reference_id)
  const thumbnail = forager.media.get_thumbnail_by_media_reference(media_reference_id)
  return {
    headers: {'content-type': 'image/jpeg'},
    body: thumbnail
  }
}

