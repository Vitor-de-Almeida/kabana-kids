import type { Request, Response } from "express"

import { createWaitlistEntry } from "../../actions/waitlist/createWaitlistEntry.ts"
import { getRequestId } from "../../middleware/requestContext.ts"
import { waitlistEntryResource } from "../../resources/waitlistEntryResource.ts"
import type { StoreWaitlistEntryInput } from "../../schemas/waitlist/storeWaitlistEntry.ts"

export async function storeWaitlistEntry(request: Request, response: Response): Promise<void> {
  // O body já foi validado pelo middleware validate
  const input = request.body as StoreWaitlistEntryInput
  const entry = await createWaitlistEntry(input, getRequestId(response))

  response.status(201).json({ data: waitlistEntryResource(entry) })
}
