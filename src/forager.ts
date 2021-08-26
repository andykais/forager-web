import type { Forager } from 'forager'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { Forager } = require('forager')

const database_path = 'sqlite.db'
const forager: Forager = new Forager({ database_path, log_level: 'info' })
forager.init()

export { forager }
