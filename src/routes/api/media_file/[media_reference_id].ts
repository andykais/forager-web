import type { Request } from '@sveltejs/kit'

export async function get(request: Request) {
  const { forager } = request.locals
  const { media_reference_id } = request.params
  const content_type = forager.media.get_content_type(media_reference_id)
  const media_file_chunks = forager.media.get_file(media_reference_id)
  return {
    headers: {
      'content-type': content_type,
    },
    body: media_file_chunks
  }
}
