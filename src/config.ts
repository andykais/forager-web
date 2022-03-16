import os from 'os'
import fs from 'fs'
import yaml from 'js-yaml'
import * as z from 'zod'

const ConfigParser = z.object({
  database_path: z.string(),
  log_level: z.enum(['info', 'warning', 'error']),
  default_one_star_on_edited_media: z.boolean().default(false),
  default_thumbnail_size: z.number().min(10).max(500).default(200),
  default_search_params: z.object({
    sort_by: z.enum(['source_created_at', 'created_at', 'updated_at']).default('source_created_at'),
    order: z.enum(['desc', 'asc']).default('desc'),
    stars: z.number().min(0).max(5).default(0),
    stars_equality: z.enum(['eq', 'gte']).default('gte'),
    unread: z.boolean().default(false),
  }).default({}),
  keyboard_shortcuts: z.array(z.object({
    action: z.string(),
    shortcut: z.string().refine(val => {
      let modifier: string | null = null
      let key = ''
      const split = val.split('-')
      if (split.length === 2) {
        modifier = split[0]
        key = split[1]
      } else if (split.length === 1) {
        key = split[0]
      } else {
        return false
      }
      if (modifier !== null && modifier !== 'Ctrl') return false
      return /Digit[0-9]/.test(key)
        || /Key[A-Z]/.test(key)
    }),
  })).default([])
}).strict()

export async function load_config(filepath?: string) {
  const config_filepath = filepath ?? `${os.homedir}/.config/forager.yml`
  const file_contents = await fs.promises.readFile(config_filepath)
  const raw_config_data = yaml.load(file_contents.toString())
  const config_data = ConfigParser.parse(raw_config_data)
  return config_data
}

export type Config = z.input<typeof ConfigParser>
