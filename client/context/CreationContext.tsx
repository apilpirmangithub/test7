import React, {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { ResultType } from "@/types/generation";

export interface Creation {
  id: string;
  url: string;
  type: ResultType;
  timestamp: number;
  prompt: string;
  isGuest?: boolean;
  remixType?: "paid" | "free" | null;
  parentAsset?: any;
  originalUrl?: string;
  registeredByWallet?: string;
  registeredIpId?: string;
  guestSessionId?: string; // Unique session ID for guest-only access
  cleanUrl?: string; // Clean version (no watermark) for paid remix - stored in Supabase
  watermarkedUrl?: string; // Watermarked version for paid remix - stored in Supabase
}

interface CreationContextType {
  resultUrl: string | null;
  setResultUrl: (url: string | null) => void;
  resultType: ResultType;
  setResultType: (type: ResultType) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  loadingMessage: string;
  setLoadingMessage: (message: string) => void;
  error: string | null;
  setError: (error: string | null) => void;
  creations: Creation[];
  addCreation: (
    url: string,
    type: ResultType,
    prompt: string,
    isGuest?: boolean,
    remixType?: "paid" | "free" | null,
    parentAsset?: any,
    originalUrl?: string,
    cleanUrl?: string,
    watermarkedUrl?: string,
  ) => void;
  updateCreationWithOriginalUrl: (
    id: string,
    originalUrl: string,
    registeredByWallet?: string,
    registeredIpId?: string,
  ) => void;
  getRegisteredIpIdsForWallet: (walletAddress: string) => string[];
  isCreationUnlockedByWallet: (
    creationId: string,
    walletAddress: string,
  ) => boolean;
  removeCreation: (id: string) => void;
  clearCreations: () => void;
  refreshGuestCreations: () => Promise<void>;
  refreshWalletCreations: (walletAddress: string) => Promise<void>;
  originalPrompt: string;
  setOriginalPrompt: (prompt: string) => void;
  guestMode: boolean;
  setGuestMode: (guest: boolean) => void;
  setUserIdentifier: (walletAddress: string | null, isGuest: boolean) => void;
}

export const CreationContext = createContext<CreationContextType | undefined>(
  undefined,
);

const RESULT_URL_KEY = "current_result_url";
const RESULT_TYPE_KEY = "current_result_type";
const ORIGINAL_PROMPT_KEY = "original_prompt";
const GUEST_MODE_KEY = "guest_mode";

export const CreationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultType, setResultType] = useState<ResultType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [creations, setCreations] = useState<Creation[]>([]);
  const [originalPrompt, setOriginalPrompt] = useState<string>("");
  const [guestMode, setGuestMode] = useState<boolean>(false);
  const [walletAddress, setWalletAddressState] = useState<string | null>(null);
  const [isGuest, setIsGuestState] = useState<boolean>(false);

  // Load creations from localStorage
  useEffect(() => {
    const storedResultUrl = localStorage.getItem(RESULT_URL_KEY);
    const storedResultType = localStorage.getItem(RESULT_TYPE_KEY);
    const storedPrompt = localStorage.getItem(ORIGINAL_PROMPT_KEY);
    const storedGuestMode = localStorage.getItem(GUEST_MODE_KEY);
    if (storedResultUrl) {
      setResultUrl(storedResultUrl);
    }
    if (storedResultType) {
      setResultType(storedResultType as ResultType);
    }
    if (storedPrompt) {
      setOriginalPrompt(storedPrompt);
    }
    if (storedGuestMode !== null) {
      setGuestMode(JSON.parse(storedGuestMode));
    }
  }, []);

  // Fetch creations based on current mode (guest or wallet)
  useEffect(() => {
    const fetchCreations = async () => {
      try {
        if (guestMode) {
          // Guest mode: fetch guest creations
          const response = await fetch("/api/guest-creations");
          if (response.ok) {
            const data = await response.json();
            if (data.creations && Array.isArray(data.creations)) {
              setCreations(data.creations);
            }
          }
        } else if (walletAddress) {
          // Wallet mode: fetch wallet creations for this wallet
          const response = await fetch(`/api/wallet-creations/${walletAddress}`);
          if (response.ok) {
            const data = await response.json();
            if (data.creations && Array.isArray(data.creations)) {
              setCreations(data.creations);
            }
          }
        }
      } catch (error) {
        console.warn("Failed to fetch creations:", error);
      }
    };

    fetchCreations();
  }, [guestMode, walletAddress]);

  // Save current result URL to localStorage
  useEffect(() => {
    const lastResult = creations[0];
    if (lastResult?.url) {
      localStorage.setItem(RESULT_URL_KEY, lastResult.url);
    } else if (!resultUrl?.includes("data:")) {
      // Only persist non-data URLs to localStorage
      if (resultUrl) {
        localStorage.setItem(RESULT_URL_KEY, resultUrl);
      } else {
        localStorage.removeItem(RESULT_URL_KEY);
      }
    }
  }, [resultUrl, creations]);

  // Save current result type to localStorage
  useEffect(() => {
    const lastResult = creations[0];
    if (lastResult?.type) {
      localStorage.setItem(RESULT_TYPE_KEY, lastResult.type);
    } else if (resultType) {
      localStorage.setItem(RESULT_TYPE_KEY, resultType);
    } else {
      localStorage.removeItem(RESULT_TYPE_KEY);
    }
  }, [resultType, creations]);

  // Save original prompt to localStorage
  useEffect(() => {
    if (originalPrompt) {
      localStorage.setItem(ORIGINAL_PROMPT_KEY, originalPrompt);
    } else {
      localStorage.removeItem(ORIGINAL_PROMPT_KEY);
    }
  }, [originalPrompt]);

  // Save guest mode to localStorage
  useEffect(() => {
    localStorage.setItem(GUEST_MODE_KEY, JSON.stringify(guestMode));
  }, [guestMode]);

  useEffect(() => {
    return () => {
      if (resultUrl && resultUrl.startsWith("blob:")) {
        URL.revokeObjectURL(resultUrl);
      }
    };
  }, [resultUrl]);

  const addCreation = useCallback(
    (
      url: string,
      type: ResultType,
      prompt: string,
      isGuest: boolean = false,
      remixType?: "paid" | "free" | null,
      parentAsset?: any,
      originalUrl?: string,
      cleanUrl?: string,
      watermarkedUrl?: string,
    ) => {
      const now = Date.now();
      const newCreation: Creation = {
        id: `creation_${now}`,
        url,
        type,
        timestamp: now,
        prompt,
        isGuest,
        remixType,
        parentAsset,
        originalUrl,
        cleanUrl,
        watermarkedUrl,
      };
      setCreations((prev) => [newCreation, ...prev]);

      // Sync guest creations to server
      if (isGuest) {
        fetch("/api/guest-creations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCreation),
        }).catch((error) => {
          console.warn("Failed to sync guest creation to server:", error);
        });
      } else if (walletAddress) {
        // Sync wallet creations to server
        const walletCreation = {
          ...newCreation,
          walletAddress,
        };
        fetch("/api/wallet-creations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(walletCreation),
        }).catch((error) => {
          console.warn("Failed to sync wallet creation to server:", error);
        });
      }
    },
    [walletAddress],
  );

  const updateCreationWithOriginalUrl = useCallback(
    (
      id: string,
      originalUrl: string,
      registeredByWallet?: string,
      registeredIpId?: string,
    ) => {
      console.log(`[CreationContext] updateCreationWithOriginalUrl called:`, {
        id,
        originalUrl: originalUrl ? "provided" : "missing",
        registeredByWallet,
        registeredIpId,
      });
      setCreations((prev) => {
        const updated = prev.map((c) => {
          if (c.id === id) {
            // For paid remix with cleanUrl, use that as the display URL after registration
            const displayUrl = c.cleanUrl || originalUrl;
            return {
              ...c,
              originalUrl,
              registeredByWallet,
              registeredIpId,
              // Update url to cleanUrl for display if available (paid remix)
              ...(c.cleanUrl && { url: c.cleanUrl }),
            };
          }
          return c;
        });

        // Sync updated creation to server
        const updatedCreation = updated.find((c) => c.id === id);
        if (updatedCreation) {
          if (updatedCreation.isGuest) {
            fetch("/api/guest-creations", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updatedCreation),
            }).catch((error) => {
              console.warn(
                "Failed to sync updated guest creation to server:",
                error,
              );
            });
          } else if (walletAddress) {
            const walletCreation = {
              ...updatedCreation,
              walletAddress,
            };
            fetch(`/api/wallet-creations/${id}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(walletCreation),
            }).catch((error) => {
              console.warn(
                "Failed to sync updated wallet creation to server:",
                error,
              );
            });
          }
        }

        return updated;
      });
    },
    [],
  );

  const getRegisteredIpIdsForWallet = useCallback(
    (walletAddress: string): string[] => {
      return creations
        .filter(
          (c) =>
            c.registeredByWallet?.toLowerCase() ===
              walletAddress?.toLowerCase() && c.registeredIpId,
        )
        .map((c) => c.registeredIpId!)
        .filter(Boolean);
    },
    [creations],
  );

  const isCreationUnlockedByWallet = useCallback(
    (creationId: string, walletAddress: string): boolean => {
      const creation = creations.find((c) => c.id === creationId);
      if (!creation || !creation.registeredByWallet) return false;
      return (
        creation.registeredByWallet.toLowerCase() ===
          walletAddress?.toLowerCase() && !!creation.originalUrl
      );
    },
    [creations],
  );

  const removeCreation = useCallback((id: string) => {
    setCreations((prev) => {
      const creation = prev.find((c) => c.id === id);
      if (creation && creation.isGuest) {
        // Sync deletion to server
        fetch(`/api/guest-creations/${id}`, {
          method: "DELETE",
        }).catch((error) => {
          console.warn("Failed to delete guest creation from server:", error);
        });
      } else if (creation && !creation.isGuest) {
        // Sync wallet creation deletion to server
        fetch(`/api/wallet-creations/${id}`, {
          method: "DELETE",
        }).catch((error) => {
          console.warn("Failed to delete wallet creation from server:", error);
        });
      }
      return prev.filter((c) => c.id !== id);
    });
  }, []);

  const clearCreations = useCallback(() => {
    setCreations([]);
    // Clear guest creations from server
    fetch("/api/guest-creations/clear", {
      method: "POST",
    }).catch((error) => {
      console.warn("Failed to clear guest creations from server:", error);
    });
  }, []);

  const refreshGuestCreations = useCallback(async () => {
    try {
      const response = await fetch("/api/guest-creations");
      if (response.ok) {
        const data = await response.json();
        if (data.creations && Array.isArray(data.creations)) {
          setCreations(data.creations);
        }
      }
    } catch (error) {
      console.warn("Failed to refresh guest creations:", error);
    }
  }, []);

  const refreshWalletCreations = useCallback(async (walletAddr: string) => {
    try {
      const response = await fetch(`/api/wallet-creations/${walletAddr}`);
      if (response.ok) {
        const data = await response.json();
        if (data.creations && Array.isArray(data.creations)) {
          setCreations(data.creations);
        }
      }
    } catch (error) {
      console.warn("Failed to refresh wallet creations:", error);
    }
  }, []);

  const setUserIdentifier = useCallback(
    (walletAddr: string | null, guestMode: boolean) => {
      console.log(
        `[CreationContext] User identifier changed: wallet=${walletAddr}, guest=${guestMode}`,
      );
      setWalletAddressState(walletAddr);
      setIsGuestState(guestMode);
    },
    [],
  );

  const contextValue = useMemo(
    () => ({
      resultUrl,
      setResultUrl,
      resultType,
      setResultType,
      isLoading,
      setIsLoading,
      loadingMessage,
      setLoadingMessage,
      error,
      setError,
      creations,
      addCreation,
      updateCreationWithOriginalUrl,
      getRegisteredIpIdsForWallet,
      isCreationUnlockedByWallet,
      removeCreation,
      clearCreations,
      refreshGuestCreations,
      refreshWalletCreations,
      originalPrompt,
      setOriginalPrompt,
      guestMode,
      setGuestMode,
      setUserIdentifier,
    }),
    [
      resultUrl,
      resultType,
      isLoading,
      loadingMessage,
      error,
      creations,
      addCreation,
      updateCreationWithOriginalUrl,
      getRegisteredIpIdsForWallet,
      isCreationUnlockedByWallet,
      removeCreation,
      clearCreations,
      refreshGuestCreations,
      refreshWalletCreations,
      originalPrompt,
      guestMode,
      setGuestMode,
      setUserIdentifier,
    ],
  ) as CreationContextType;

  return (
    <CreationContext.Provider value={contextValue}>
      {children}
    </CreationContext.Provider>
  );
};
