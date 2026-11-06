export type DesiredClassroom = "nursery" | "toddler" | "preschool" | "undecided"

export type WaitlistEntryInput = {
  guardianName: string
  email: string
  phone: string
  childName: string
  /** Formato AAAA-MM-DD */
  childBirthDate: string
  desiredClassroom: DesiredClassroom
  message: string
  consent: boolean
}

export type WaitlistStatus = "pending" | "contacted" | "enrolled" | "discarded"

export type WaitlistEntry = {
  id: string
  status: WaitlistStatus
  createdAt: string
}

export type WaitlistEntryForSchool = {
  id: string
  guardianName: string | null
  email: string | null
  phone: string | null
  childName: string | null
  /** Formato AAAA-MM-DD */
  childBirthDate: string | null
  desiredClassroom: DesiredClassroom | null
  message: string | null
  status: WaitlistStatus
  createdAt: string
}
