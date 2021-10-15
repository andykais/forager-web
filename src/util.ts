type Tag = { group?: string; name: string }
export function encode_tag(tag: Tag): string {
  if (tag.group) return `${tag.group}:${tag.name}`
  else return tag.name
}

export function decode_tag(tag_str: string): {group: string; name: string} {
  const split = tag_str.split(':')
  if (split.length === 2) return { group: split[0], name: split[1] }
  else return { name: split[0] }
}
