// Modular contact-enrichment provider architecture.
//
// Workflow: property owner (name + mailing address, both already on the
// lead/property record) -> a provider -> candidate phone/email + a
// confidence rating -> saved as a gbl_contacts row for manual review.
//
// Nothing here calls a real enrichment API yet. ManualProvider is the only
// registered provider today, so the UI always has a working fallback: type
// in a number/email you found yourself. When you get an API key for a real
// provider (BatchSkipTracing is the best fit for this volume -- real-
// estate-focused, per-record pricing, has a REST API), implement its own
// class below and register it in `providers`. Never fabricate a result: if
// a provider has no key configured, it must return not_connected, not a
// fake or sample record.

import type { ContactType, Confidence } from "../types";

export interface EnrichmentCandidate {
  type: ContactType;
  value: string;
  confidence: Confidence;
  source: string;
}

export interface EnrichmentInput {
  ownerName: string;
  mailingAddress: string | null;
  propertyAddress: string;
}

export type EnrichmentResult =
  | { status: "ok"; candidates: EnrichmentCandidate[] }
  | { status: "not_connected"; providerName: string }
  | { status: "error"; message: string };

export interface ContactEnrichmentProvider {
  name: string;
  isConfigured(): boolean;
  lookup(input: EnrichmentInput): Promise<EnrichmentResult>;
}

// Always available: a no-op provider that makes the "not connected" state
// explicit instead of the UI silently having no option at all.
class ManualProvider implements ContactEnrichmentProvider {
  name = "Manual entry";
  isConfigured() {
    return true;
  }
  async lookup(): Promise<EnrichmentResult> {
    return { status: "not_connected", providerName: this.name };
  }
}

// Example shape for a future real provider -- intentionally unregistered
// and unimplemented until GBL_SKIP_TRACE_API_KEY exists and this class
// actually calls the provider's API:
//
// class BatchSkipTracingProvider implements ContactEnrichmentProvider {
//   name = "BatchSkipTracing";
//   isConfigured() {
//     return Boolean(process.env.GBL_SKIP_TRACE_API_KEY);
//   }
//   async lookup(input: EnrichmentInput): Promise<EnrichmentResult> {
//     if (!this.isConfigured()) return { status: "not_connected", providerName: this.name };
//     // POST to the provider's API, map its response into EnrichmentCandidate[].
//   }
// }

export const providers: ContactEnrichmentProvider[] = [new ManualProvider()];

export function activeProvider(): ContactEnrichmentProvider {
  return providers.find((p) => p.isConfigured()) ?? providers[0];
}
