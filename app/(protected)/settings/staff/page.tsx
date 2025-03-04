"use client"

import { useState } from "react"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { UserPlus } from "lucide-react"
import { StaffList } from "./_components/staff-list"
import { StaffModal } from "./_components/staff-modal"
import { Staff } from "@/types/staff"

export default function StaffPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [modalType, setModalType] = useState<'create' | 'edit'>('create')

  const handleOpenModal = (type: 'create' | 'edit', staff?: Staff) => {
    setModalType(type)
    setSelectedStaff(staff || null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedStaff(null)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Staff Management"
          description="Add, edit or remove staff members."
          icon={UserPlus}
          iconColor="text-sky-500"
          bgColor="bg-sky-500/10"
        />
        <button
          onClick={() => handleOpenModal('create')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-sky-500 rounded-lg hover:bg-sky-600"
        >
          <UserPlus className="h-4 w-4" />
          Add Staff
        </button>
      </div>
      <Separator />
      <StaffList onEdit={(staff: Staff) => handleOpenModal('edit', staff)} />
      <StaffModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        staff={selectedStaff}
      />
    </div>
  )
} 