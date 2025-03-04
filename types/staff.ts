export interface Staff {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  title: string
  specialties: string[]
  isActive: boolean
  imageUrl?: string | null
  bio?: string | null
  createdAt: Date
  updatedAt: Date
  userId: string
}

export interface CreateStaffInput {
  name: string
  email?: string | null
  phone?: string | null
  title: string
  specialties: string[]
  isActive: boolean
  imageUrl?: string | null
  bio?: string | null
}

export interface UpdateStaffInput extends CreateStaffInput {
  id: string
} 