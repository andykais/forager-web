import { create_rpc_client } from 'ts-rpc/client'
// import { createRequire } from 'module'
// const require = createRequire(import.meta.url)
// const { create_rpc_client } = require('ts-rpc/client')
import type { ForagerSpec } from './spec'

const client = create_rpc_client<ForagerSpec>('/api/rpc')
// const client = {}

export { client }
