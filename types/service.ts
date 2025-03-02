export interface Service {
  id: string
  name: string
  description?: string | null
  duration: number
  price: number
  color?: string | null
  isActive: boolean
  category?: string | null
  userId: string
  createdAt: string
  updatedAt: string
} 