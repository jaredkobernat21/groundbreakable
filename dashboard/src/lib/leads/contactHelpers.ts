import type { Confidence, GblContact } from "./types";

const CONFIDENCE_RANK: Record<Confidence, number> = { verified: 3, likely: 2, needs_confirmation: 1, unknown: 0 };

export function primaryContact(contacts: GblContact[], leadId: string, type: GblContact["type"]): GblContact | null {
  const candidates = contacts.filter((c) => c.lead_id === leadId && c.type === type);
  if (candidates.length === 0) return null;
  return candidates.sort((a, b) => CONFIDENCE_RANK[b.confidence] - CONFIDENCE_RANK[a.confidence])[0];
}

export function groupContactsByLead(contacts: GblContact[]): Map<string, GblContact[]> {
  const map = new Map<string, GblContact[]>();
  for (const c of contacts) {
    const list = map.get(c.lead_id) ?? [];
    list.push(c);
    map.set(c.lead_id, list);
  }
  return map;
}
