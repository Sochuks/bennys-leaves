import { z } from 'zod'

export const conditionTags = ['LIKE_NEW', 'GENTLY_LOVED', 'WELL_TREASURED'] as const

export const bookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  author: z.string().min(1, 'Author is required').max(255),
  isbn: z.string().max(13).optional().or(z.literal('')),
  category: z.string().max(100).optional().or(z.literal('')),
  condition_tag: z.enum(conditionTags),
  description: z.string().max(2000).optional().or(z.literal('')),
  cover_image_url: z.string().url().optional().or(z.literal('')),
})

export type BookFormValues = z.infer<typeof bookSchema>