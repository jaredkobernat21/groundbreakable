import type { CatalystWithSource } from "@/lib/types";
import { haversineDistanceMeters } from "@/lib/geo";

export type CatalystCluster = { catalysts: CatalystWithSource[] };

const CLUSTER_RADIUS_METERS = 3218; // ~2 miles
const MIN_CLUSTER_SIZE = 3;

// "Compound Catalysts" (Jared's spec) -- groups catalysts in the same
// market that sit within CLUSTER_RADIUS_METERS of another catalyst already
// in the group (transitively), and keeps only groups of 3+. Plain
// client-side distance math via the existing haversineDistanceMeters
// (lib/geo.ts) rather than a PostGIS RPC -- catalyst counts per market are
// small (dozens, not parcels-at-scale), the same "small, already-loaded
// case" this function's own doc comment says client-side JS already
// serves well (see lib/catalystRules.ts, the existing precedent for
// catalyst-proximity checks). The new `geog` column on catalysts stays
// available for a future PostGIS-based version once catalyst volume or
// cross-category (Catalyst<->Opportunity, etc.) queries need it.
export function findCompoundCatalystClusters(catalysts: CatalystWithSource[]): CatalystCluster[] {
  const groups: CatalystWithSource[][] = [];

  for (const catalyst of catalysts) {
    const joinable = groups.find((group) =>
      group.some(
        (c) => haversineDistanceMeters(c.latitude, c.longitude, catalyst.latitude, catalyst.longitude) <= CLUSTER_RADIUS_METERS
      )
    );
    if (joinable) {
      joinable.push(catalyst);
    } else {
      groups.push([catalyst]);
    }
  }

  // Repeat-until-stable merge for transitive links (A close to C, B close
  // to C, but A and B not directly compared in the same first pass) --
  // fine at this scale.
  let merged = true;
  while (merged) {
    merged = false;
    outer: for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        const linked = groups[i].some((a) =>
          groups[j].some((b) => haversineDistanceMeters(a.latitude, a.longitude, b.latitude, b.longitude) <= CLUSTER_RADIUS_METERS)
        );
        if (linked) {
          groups[i] = groups[i].concat(groups[j]);
          groups.splice(j, 1);
          merged = true;
          break outer;
        }
      }
    }
  }

  return groups.filter((g) => g.length >= MIN_CLUSTER_SIZE).map((catalysts) => ({ catalysts }));
}
