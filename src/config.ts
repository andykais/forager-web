import os from 'os'
import fs from 'fs'
import yaml from 'js-yaml'
import * as z from 'zod'

const ConfigData = z.object({
  database_path: z.string(),
  log_level: z.enum(['info', 'warning', 'error']),
  set_one_star_on_edited_media: z.boolean().default(false)
}).strict()

class Config {
  static async load(filepath?: string) {
    const config_filepath = filepath ?? `${os.homedir}/.config/forager.yml`
    const file_contents = await fs.promises.readFile(config_filepath)
    const raw_config_data = yaml.load(file_contents.toString())
    const config_data = ConfigData.parse(raw_config_data)
    return config_data
  }
}

export { Config }
