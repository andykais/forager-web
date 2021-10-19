import type { Request } from '@sveltejs/kit'

/* http range request chunk size */
const CHUNK_SIZE = 1024 * 1024 * 2

export function get(request: Request) {
  const { forager } = request.locals
  const [ media_reference_id ] = request.params.media_reference_id.split('.') // remove any extension attached
  const { media_type, content_type, file_size_bytes } = forager.media.get_file_info(media_reference_id)
  const headers = { 'Content-Type': content_type }
  headers['Cache-Control'] = 'no-cache,no-store'  //for development. Hopefully this helps
  if(media_type === 'VIDEO' && request.headers.range) {
    let [start, end] = request.headers.range.replace(/bytes=/, '').split('-')
    start = parseInt(start)
    end = end ? parseInt(end) : Math.min(start + CHUNK_SIZE, file_size_bytes - 1) // file_size_bytes
    if (Number.isNaN(start) || Number.isNaN(end)) throw new Error('non integer ranges specified')
    if (start >= file_size_bytes || end >= file_size_bytes) return { status: 416, headers: {'Content-Range': `bytes: */${file_size_bytes}`} }
    headers['Content-Range'] = `bytes ${start}-${end}/${file_size_bytes}`
    headers['Accept-Ranges'] = 'bytes'
    headers['Content-Length'] = end - start + 1
    const body = forager.media.get_file(media_reference_id, { bytes_start: start, bytes_end: end + 1 })
    return { status: 206, headers, body }
  } else {
    const body = forager.media.get_file(media_reference_id)
    return { status: 200, headers, body }
  }
}
