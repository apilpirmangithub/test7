import { useEffect, useState, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { formatEther } from "viem";
import { createPublicClient, http } from "viem";
import {
  validateTokenBalance,
  getInsufficientBalanceWarning,
  extractMintingFee,
  calculateTotalCost,
  type TokenValidationResult,
} from "@/lib/utils/token-validation";
import { getNetworkConfig } from "@/lib/network-config";

interface UseTokenValidationReturn {
  balance: string;
  isLoading: boolean;
  error: string | null;
  validateForRegistration: (license: any) => TokenValidationResult;
  getWarningMessage: (license: any) => string;
  getMintingFee: (license: any) => string;
  getTotalCost: (license: any) => string;
  refetch: () => Promise<void>;
}

export function useTokenValidation(
  walletAddress?: string,
  network: "mainnet" | "testnet" = "mainnet",
): UseTokenValidationReturn {
  const [balance, setBalance] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authenticated } = usePrivy();

  const fetchBalance = useCallback(async () => {
    if (!walletAddress || !authenticated) {
      setBalance("0");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const networkConfig = getNetworkConfig(network);
      const publicClient = createPublicClient({
        transport: http(networkConfig.rpc),
      });

      const balanceInWei = await publicClient.getBalance({
        address: walletAddress as `0x${string}`,
      });

      const formattedBalance = formatEther(balanceInWei);
      setBalance(formattedBalance);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch balance";
      console.error("Token validation error:", err);
      setError(errorMsg);
      setBalance("0");
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, authenticated, network]);

  useEffect(() => {
    if (walletAddress && authenticated) {
      fetchBalance();
      // Refresh balance every 30 seconds
      const interval = setInterval(fetchBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [walletAddress, authenticated, fetchBalance]);

  const validateForRegistration = useCallback(
    (license: any): TokenValidationResult => {
      return validateTokenBalance(balance, license, true);
    },
    [balance],
  );

  const getWarningMessage = useCallback(
    (license: any): string => {
      return getInsufficientBalanceWarning(balance, license);
    },
    [balance],
  );

  const getMintingFee = useCallback(
    (license: any): string => {
      return extractMintingFee(license);
    },
    [],
  );

  const getTotalCost = useCallback(
    (license: any): string => {
      return calculateTotalCost(license, true);
    },
    [],
  );

  return {
    balance,
    isLoading,
    error,
    validateForRegistration,
    getWarningMessage,
    getMintingFee,
    getTotalCost,
    refetch: fetchBalance,
  };
}
