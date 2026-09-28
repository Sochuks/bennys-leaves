export type ConditionTag = 'LIKE_NEW' | 'GENTLY_LOVED' | 'WELL_TREASURED'
export type BookStatus = 'AVAILABLE' | 'OFFLINE_DISTRIBUTION' | 'RESERVED' | 'CLAIMED' | 'DELIVERED'

export type Book = {
  id: string
  legacy_id: string
  isbn: string | null
  title: string
  author: string
  category: string | null
  condition_tag: ConditionTag
  status: BookStatus
  cover_image_url: string | null
  description: string | null
  created_at: string
}