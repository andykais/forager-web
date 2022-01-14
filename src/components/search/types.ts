export type TagIdentifier = { not?: boolean; name: string; group?: string }

export type TagQuery = {tags?: TagIdentifier[]}

export type StarsQuery = {stars?: number; comparison?: 'eq' | 'gte'}

export type SortQuery = {
  sort_by?: 'created_at' | 'updated_at' | 'source_created_at'
  order?: 'desc' | 'asc'
}

export type UnreadQuery = { unread?: boolean }

export type SearchQuery = TagQuery & StarsQuery & SortQuery & UnreadQuery
