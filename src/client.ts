import { create_rpc_client } from 'ts-rpc/client'
import type { ForagerSpec } from './spec'
const client = create_rpc_client<ForagerSpec>(`/api/rpc`)

export { client }
