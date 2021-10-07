import type { Request } from '@sveltejs/kit'

const CHUNK_SIZE = 1024 * 1024 * 2
export async function get(request: Request) {
  try{

  // console.log(request)
  const { forager } = request.locals
  const { media_reference_id } = request.params
  const { media_type, content_type, file_size_bytes } = forager.media.get_file_info(media_reference_id)
  const headers = { 'Content-Type': content_type }
  headers['Cache-Control'] = 'no-cache,no-store'  //for development. Hopefully this helps
  // return { headers, body: forager.media.get_file(media_reference_id) }
  let body = null
  let status = 200
  console.log(`/media_file/${media_reference_id} (${media_type})`)
  if (media_type === 'VIDEO' && request.headers.range) {
    console.log('range header:', request.headers.range)
    const size = file_size_bytes
    let [start, end] = request.headers.range.replace(/bytes=/, '').split('-')
    console.log('unparsed', { start, end })
    start = parseInt(start, 10)
    // end = end ? parseInt(end, 10) : size - 1
    end = end ? parseInt(end, 10) : size - 1//Math.min(size - 1, start + CHUNK_SIZE)
    if (!Number.isNaN(start) && Number.isNaN(end)) end = size - 1
    if (Number.isNaN(start) && !Number.isNaN(end)) {
      start = size - end
      end = size - 1
    }
    // handle unavailable range request
    if (start >= size || end >= size) {
      console.log('invalid range', { start, end, size })
      return { status: 416, 'content-range': `bytes: */${size}` }
    }
    headers['Content-Range'] = `bytes ${start}-${end}/${size}`
    headers['Accept-Ranges'] = `bytes`
    headers['Content-Length'] = end - start + 1
    console.log('parsed', { start, end })
    if (start === 0 && end === size - 1) body = forager.media.get_file(media_reference_id)
    else {
      body = forager.media.get_file(media_reference_id, { bytes_start: start, bytes_end: end + 1 })
      if (end !== size - 1) status = 206
    }
  } else {
    console.log('sending full content')
    body = forager.media.get_file(media_reference_id)
  }
  console.log('sending body size:', body.length, 'content-length:', headers['Content-Length'], `MBs: ${(body.length / (1024*1024)).toFixed(2)}`, 'full size:', file_size_bytes)
  console.log()
  return {
    status,
    headers,
    body,
  }
  }catch(e) {
    console.log('an  error ocurred')
    console.error(e)
    throw e
  }
}
