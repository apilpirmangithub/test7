import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import type { SearchResult, OwnerDomainInfo, RemixTypeInfo } from "./types";

/**
 * Hook untuk fetch domain dari owner address
 */
export const useDomainFetch = (uniqueOwners: string[]) => {
  const [ownerDomains, setOwnerDomains] = useState<
    Record<string, OwnerDomainInfo>
  >({});
  const domainFetchControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (uniqueOwners.length === 0) {
      return;
    }

    // Cancel previous domain fetch if still in progress
    if (domainFetchControllerRef.current) {
      domainFetchControllerRef.current.abort();
    }
    domainFetchControllerRef.current = new AbortController();

    // Mark all owners as loading
    const loadingState: Record<string, OwnerDomainInfo> = {};
    uniqueOwners.forEach((owner) => {
      loadingState[owner] = { domain: null, loading: true };
    });
    setOwnerDomains(loadingState);

    // Fetch domains for all owners in parallel
    Promise.all(
      uniqueOwners.map((owner) => {
        return fetch("/api/resolve-owner-domain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ownerAddress: owner }),
          signal: domainFetchControllerRef.current?.signal,
        })
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          })
          .then((data) => {
            return {
              address: owner,
              domain: data.ok ? data.domain : null,
            };
          })
          .catch((err) => {
            if (err.name !== "AbortError") {
              console.error("Error fetching domain:", err);
            }
            return {
              address: owner,
              domain: null,
            };
          });
      }),
    )
      .then((results) => {
        const newDomains: Record<string, OwnerDomainInfo> = {};
        results.forEach(({ address, domain }) => {
          newDomains[address] = { domain, loading: false };
        });
        setOwnerDomains(newDomains);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Error fetching domains:", err);
        }
      });

    return () => {
      if (domainFetchControllerRef.current) {
        domainFetchControllerRef.current.abort();
      }
    };
  }, [uniqueOwners]);

  return ownerDomains;
};

/**
 * Hook untuk mendapatkan tipe remix berdasarkan licenses
 */
export const useRemixTypes = () => {
  return useCallback((asset: SearchResult): RemixTypeInfo[] => {
    if (!asset.licenses || asset.licenses.length === 0) {
      return [];
    }

    const remixTypesMap = new Map<
      "paid" | "free",
      { hasAttribution: boolean }
    >();

    for (const license of asset.licenses) {
      const terms = license.terms || license;
      const derivativesAllowed =
        terms?.derivativesAllowed === true ||
        license.derivativesAllowed === true;

      if (!derivativesAllowed) continue;

      const commercialUse = terms?.commercialUse === true;
      const remixType: "paid" | "free" = commercialUse ? "paid" : "free";

      // Check if this license has derivativesAttribution
      const derivativesAttribution =
        terms?.derivativesAttribution === true ||
        license.derivativesAttribution === true;

      // Update map - set hasAttribution to true if any license of this type requires attribution
      if (!remixTypesMap.has(remixType)) {
        remixTypesMap.set(remixType, {
          hasAttribution: derivativesAttribution,
        });
      } else {
        const existing = remixTypesMap.get(remixType)!;
        existing.hasAttribution =
          existing.hasAttribution || derivativesAttribution;
      }
    }

    return Array.from(remixTypesMap.entries()).map(([type, info]) => ({
      type,
      hasAttribution: info.hasAttribution,
    }));
  }, []);
};

/**
 * Hook untuk check apakah asset memungkinkan derivatives
 */
export const useAllowsDerivatives = () => {
  return useCallback((asset: SearchResult): boolean => {
    if (!asset.licenses || asset.licenses.length === 0) {
      return false;
    }
    return asset.licenses.some(
      (license) =>
        license.terms?.derivativesAllowed === true ||
        license.derivativesAllowed === true,
    );
  }, []);
};

/**
 * Hook untuk mendapatkan unique owner addresses dari search results
 */
export const useUniqueOwners = (searchResults: SearchResult[]) => {
  return useMemo(() => {
    const owners = new Set<string>();
    searchResults.forEach((asset) => {
      if (asset.ownerAddress) {
        owners.add(asset.ownerAddress.toLowerCase());
      }
    });
    return Array.from(owners);
  }, [searchResults]);
};

/**
 * Utility function untuk truncate address
 */
export const truncateAddress = (
  address: string,
  startChars = 6,
  endChars = 4,
) => {
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

export const truncateAddressDisplay = (address: string) => {
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
};
