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

export type WaitlistEntry = {
  id: string
  status: "pending" | "contacted" | "enrolled" | "discarded"
  createdAt: string
}
