import type { Request } from '@sveltejs/kit'

export async function get(request: Request) {
  console.log(request)
  const { forager } = request.locals
  const { media_reference_id } = request.params
  const { media_type, content_type, file_size_bytes } = forager.media.get_file_info(media_reference_id)
  const headers = { 'Content-Type': content_type }
  return { headers, body: forager.media.get_file(media_reference_id) }
  let body = null
  if (media_type === 'VIDEO' && request.headers.range) {
    const size = file_size_bytes
    let [start, end] = request.headers.range.replace(/bytes=/, '').split('-')
    start = parseInt(start, 10)
    end = end ? parseInt(end, 10) : size - 1
    if (!Number.isNaN(start) && Number.isNaN(end)) end = size - 1
    if (Number.isNaN(start) && !Number.isNaN(end)) {
      start = size - end
      end = size - 1
    }
    // handle unavailable range request
    if (start >= size || end >= size) {
      return { status: 416, 'content-range': `bytes: */${size}` }
    }
    headers['Content-Range'] = `bytes ${start}-${end}/${size}`
    headers['Accept-Ranges'] = `bytes`
    headers['Content-Length'] = end - start + 1
    console.log(headers)
    if (start === 0 && end === size - 1) body = forager.media.get_file(media_reference_id)
      else console.log('nope')
    // TODO
  } else {
    const media_file_chunks = forager.media.get_file(media_reference_id)
    body = media_file_chunks
  }
  return {
    headers,
    body,
  }
}
