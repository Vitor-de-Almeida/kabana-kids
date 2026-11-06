import type { Request, Response } from "express"

import { anonymizeWaitlistEntry } from "../../actions/waitlist/anonymizeWaitlistEntry.ts"
import { createWaitlistEntry } from "../../actions/waitlist/createWaitlistEntry.ts"
import { WAITLIST_PAGE_SIZE, listWaitlistEntries } from "../../actions/waitlist/listWaitlistEntries.ts"
import { getCurrentUser } from "../../middleware/requireAuth.ts"
import { getRequestId } from "../../middleware/requestContext.ts"
import { waitlistEntryForSchoolResource } from "../../resources/waitlistEntryForSchoolResource.ts"
import { waitlistEntryResource } from "../../resources/waitlistEntryResource.ts"
import type { ListWaitlistEntriesQuery } from "../../schemas/waitlist/listWaitlistEntries.ts"
import type { StoreWaitlistEntryInput } from "../../schemas/waitlist/storeWaitlistEntry.ts"
import type { WaitlistEntryParams } from "../../schemas/waitlist/waitlistEntryParams.ts"

export async function storeWaitlistEntry(request: Request, response: Response): Promise<void> {
  // O body já foi validado pelo middleware validate
  const input = request.body as StoreWaitlistEntryInput
  const entry = await createWaitlistEntry(input, getRequestId(response))

  response.status(201).json({ data: waitlistEntryResource(entry) })
}

export async function indexWaitlistEntries(_request: Request, response: Response): Promise<void> {
  const query = response.locals.query as ListWaitlistEntriesQuery
  const { entries, total } = await listWaitlistEntries(query, getCurrentUser(response), getRequestId(response))

  response.json({
    data: entries.map(waitlistEntryForSchoolResource),
    meta: { page: query.page, perPage: WAITLIST_PAGE_SIZE, total },
  })
}

export async function destroyWaitlistEntry(_request: Request, response: Response): Promise<void> {
  const { id } = response.locals.params as WaitlistEntryParams
  const anonymized = await anonymizeWaitlistEntry(id, getCurrentUser(response), getRequestId(response))

  if (!anonymized) {
    response.status(404).json({ message: "Cadastro não encontrado." })
    return
  }
  response.status(204).end()
}
