type Tag = { group?: string; name: string }
export function encode_tag(tag: Tag): string {
  if (tag.group) return `${tag.group}:${tag.name}`
  else return tag.name
}

export function decode_tag(tag_str: string): {group: string; name: string} {
  const split = tag_str.split(':')
  let group = undefined
  let name = ''
  let not = false
  if (split.length === 2) {
    group = split[0]
    name = split[1]
  }
  else {
    name = split[0]
  }
  if (name.startsWith('-')) {
    not = true
    name = name.substr(1)
  }
  return { name, group, not }
}
