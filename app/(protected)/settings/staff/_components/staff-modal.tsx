"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { X, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Staff } from "@/types/staff"
import { useStaffQuery } from "@/hooks/use-staff-query"

interface StaffModalProps {
  isOpen: boolean
  onClose: () => void
  staff?: Staff | null
}

export function StaffModal({ isOpen, onClose, staff }: StaffModalProps) {
  const { data: session } = useSession()
  const { createStaff, updateStaff } = useStaffQuery()
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState("")
  const [title, setTitle] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [bio, setBio] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [specialties, setSpecialties] = useState<string[]>([])
  const [newSpecialty, setNewSpecialty] = useState("")

  const isEditing = !!staff

  useEffect(() => {
    if (staff) {
      setName(staff.name)
      setTitle(staff.title)
      setEmail(staff.email || "")
      setPhone(staff.phone || "")
      setBio(staff.bio || "")
      setImageUrl(staff.imageUrl || "")
      setIsActive(staff.isActive)
      setSpecialties(staff.specialties || [])
    } else {
      resetForm()
    }
  }, [staff, isOpen])

  const resetForm = () => {
    setName("")
    setTitle("")
    setEmail("")
    setPhone("")
    setBio("")
    setImageUrl("")
    setIsActive(true)
    setSpecialties([])
    setNewSpecialty("")
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const addSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()])
      setNewSpecialty("")
    }
  }

  const removeSpecialty = (specialty: string) => {
    setSpecialties(specialties.filter(s => s !== specialty))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !title) {
      toast.error("Name and title are required")
      return
    }

    setIsLoading(true)

    try {
      const staffData = {
        name,
        title,
        email: email || null,
        phone: phone || null,
        bio: bio || null,
        imageUrl: imageUrl || null,
        isActive,
        specialties,
      }

      if (isEditing && staff) {
        await updateStaff(staff.id, staffData)
        toast.success("Staff updated successfully")
      } else {
        await createStaff(staffData)
        toast.success("Staff added successfully")
      }
      
      handleClose()
    } catch (error) {
      toast.error("An error occurred while saving staff")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Staff" : "Add New Staff"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Job title"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief description"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Profile Image URL</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Specialties</Label>
            <div className="flex gap-2">
              <Input
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                placeholder="Add specialty"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialty())}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                onClick={addSpecialty}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {specialties.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {specialties.map((specialty, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {specialty}
                    <button 
                      type="button" 
                      onClick={() => removeSpecialty(specialty)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="isActive" 
              checked={isActive} 
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : isEditing ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 