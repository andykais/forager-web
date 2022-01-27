export type TagIdentifier = { not?: boolean; name: string; group?: string }

export type TagsQuery = {tags?: TagIdentifier[]}

export type StarsQuery = {stars?: number; stars_equality?: 'eq' | 'gte'}

export type SortQuery = {
  sort_by?: 'created_at' | 'updated_at' | 'source_created_at'
  order?: 'desc' | 'asc'
}

export type UnreadQuery = { unread?: boolean }

export type SearchQuery = TagsQuery & StarsQuery & SortQuery & UnreadQuery
