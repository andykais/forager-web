import type { Request } from '@sveltejs/kit'

export async function get(request: Request) {
  const { forager } = request.locals
  const { media_reference_id } = request.params
  const video_preview = forager.media.get_video_preview(media_reference_id)
  return {
    headers: {'content-type': 'image/jpeg'},
    body: video_preview
  }
}
