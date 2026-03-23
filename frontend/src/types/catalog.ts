export interface CatalogCategory {
  id: number
  name: string
  description: string | null
  iconName: string
}

export interface Book {
  id: number
  title: string
  author: string
  isbn: string
  edition: string
  description: string | null
  stockQuantity: number
  price: number
  originalPrice: number | null
  returnPolicy: string | null
  publisher: string
  pageCount: number | null
  language: string | null
  publicationYear: number | null
  coverImageUrl: string | null
  coverColor: string
  category: CatalogCategory
  createdAt: string
  updatedAt: string
  version: number
}

export interface PageMetadata {
  size: number
  number: number
  totalElements: number
  totalPages: number
}

export interface BookPageResponse {
  content: Book[]
  page: PageMetadata
}

export interface RawBookPageResponse {
  content: Book[]
  page?: Partial<PageMetadata>
  size?: number
  number?: number
  totalElements?: number
  totalPages?: number
}
