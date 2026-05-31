/**
 * useHiddenTiers — client hook for pricing pages.
 *
 * Fetches /api/tiers?product=X and returns a Set of HIDDEN tier names
 * (e.g. Set{"enterprise"}). Pricing pages wrap each tier card:
 *   {!hidden.has("enterprise") && <EnterpriseCard/>}
 *
 * Fails open (empty set) so pricing never breaks if the API hiccups.
 */

import { useEffect, useState } from "react";

export function useHiddenTiers(product: string): Set<string> {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  useEffect(() => {
    let active = true;
    fetch(`/api/tiers?product=${product}`)
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        const tiers = (d.hidden ?? []).map((k: string) => k.split(":")[1]);
        setHidden(new Set(tiers));
      })
      .catch(() => { /* fail open */ });
    return () => { active = false; };
  }, [product]);
  return hidden;
}
