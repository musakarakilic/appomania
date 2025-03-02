"use client"

import { useState, useEffect } from "react"
import AppointmentList from "./_components/appointment-list"
import { Suspense, lazy } from "react"
import { useWorkingHoursQuery } from "@/hooks/use-working-hours-query"

const AppointmentModal = lazy(() => import("./_components/appointment-modal"))

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'create' | 'edit' | 'quick';
  }>({
    isOpen: false,
    type: 'create'
  })

  const { workingHours, isLoading, createDefaultWorkingHours } = useWorkingHoursQuery()

  useEffect(() => {
    if (!isLoading && (!workingHours || workingHours.length === 0)) {
      createDefaultWorkingHours()
    }
  }, [workingHours, isLoading, createDefaultWorkingHours])

  // Set date to today when page first loads
  useEffect(() => {
    // Set today's date exactly (with hours, minutes, seconds reset to zero)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    // Set today's date
    setSelectedDate(today);
  }, []);

  const openModal = (type: 'create' | 'edit' | 'quick') => {
    setModalState({ isOpen: true, type });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: 'create' });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
      </div>
      <AppointmentList 
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onOpenModal={() => openModal('create')}
      />
      
      <Suspense fallback={null}>
        {modalState.isOpen && (
          <AppointmentModal
            isOpen={modalState.isOpen}
            type={modalState.type}
            onClose={closeModal}
          />
        )}
      </Suspense>
    </div>
  )
} 