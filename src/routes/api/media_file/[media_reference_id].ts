import type { Request } from '@sveltejs/kit'

export async function get(request: Request) {
  const { forager } = request.locals
  const { media_reference_id } = request.params
  const media_file_chunks = forager.media.get_file(media_reference_id)
  return {
    headers: {'content-type': 'application/octet-stream'},
    body: media_file_chunks
  }
}
