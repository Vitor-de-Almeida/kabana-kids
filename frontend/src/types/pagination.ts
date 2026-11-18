export type Paginated<T> = {
  data: T[]
  meta: {
    page: number
    perPage: number
    total: number
  }
}
