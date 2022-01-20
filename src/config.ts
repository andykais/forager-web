import os from 'os'
import fs from 'fs'
import yaml from 'js-yaml'
import * as z from 'zod'

const ConfigParser = z.object({
  database_path: z.string(),
  log_level: z.enum(['info', 'warning', 'error']),
  default_one_star_on_edited_media: z.boolean().default(false),
  default_thumbnail_size: z.number().min(10).max(500).default(200)
}).strict()

export async function load_config(filepath?: string) {
  const config_filepath = filepath ?? `${os.homedir}/.config/forager.yml`
  const file_contents = await fs.promises.readFile(config_filepath)
  const raw_config_data = yaml.load(file_contents.toString())
  const config_data = ConfigParser.parse(raw_config_data)
  return config_data
}

export type Config = z.input<typeof ConfigParser>
