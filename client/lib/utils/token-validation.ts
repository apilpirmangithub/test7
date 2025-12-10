import { parseEther, formatEther } from "viem";

export interface TokenValidationResult {
  isValid: boolean;
  requiredAmount: string; // in IP tokens
  currentBalance: string; // in IP tokens
  shortfall: string; // in IP tokens, 0 if valid
  message: string;
}

/**
 * Extract minting fee from license object
 * Tries multiple field names to handle API inconsistency
 */
export function extractMintingFee(license: any): string {
  if (!license) return "0";

  let mintingFee = 0;

  // Try multiple field names for minting fee
  if (license.licensingConfig?.mintingFee) {
    mintingFee = Number(license.licensingConfig.mintingFee);
  } else if (license.terms?.defaultMintingFee) {
    mintingFee = Number(license.terms.defaultMintingFee);
  } else if (license.terms?.mintingFee) {
    mintingFee = Number(license.terms.mintingFee);
  }

  // Convert from wei to ether (assuming fee is in wei with 18 decimals)
  if (mintingFee > 0) {
    return formatEther(BigInt(mintingFee));
  }

  return "0";
}

/**
 * Calculate total cost for registration including:
 * - Minting fee (from license)
 * - Gas estimation (rough estimate)
 */
export function calculateTotalCost(license: any, includeGasEstimate = true): string {
  const mintingFee = parseEther(extractMintingFee(license));

  // Rough gas estimation: ~0.5 IP tokens for gas (can be adjusted based on empirical data)
  const gasEstimate = includeGasEstimate ? parseEther("0.5") : BigInt(0);

  const totalInWei = mintingFee + gasEstimate;
  return formatEther(totalInWei);
}

/**
 * Validate if user has sufficient tokens for registration
 */
export function validateTokenBalance(
  balance: string,
  license: any,
  includeGasEstimate = true,
): TokenValidationResult {
  const requiredAmount = calculateTotalCost(license, includeGasEstimate);
  const balanceNum = parseFloat(balance);
  const requiredNum = parseFloat(requiredAmount);

  const isValid = balanceNum >= requiredNum;
  const shortfall = isValid ? "0" : (requiredNum - balanceNum).toFixed(6);

  let message = "";
  if (isValid) {
    message = `✅ Sufficient balance: ${balance} IP tokens (Required: ${requiredAmount} IP tokens)`;
  } else {
    message = `⚠️ Insufficient tokens. You have ${balance} IP tokens, but need ${requiredAmount} IP tokens. Shortfall: ${shortfall} IP tokens`;
  }

  return {
    isValid,
    requiredAmount,
    currentBalance: balance,
    shortfall,
    message,
  };
}

/**
 * Get human-readable warning message for insufficient balance
 */
export function getInsufficientBalanceWarning(
  balance: string,
  license: any,
): string {
  const validation = validateTokenBalance(balance, license);

  if (validation.isValid) {
    return "";
  }

  return `❌ Insufficient funds. You need ${validation.requiredAmount} IP tokens but only have ${balance}. Please add ${validation.shortfall} more tokens to proceed.`;
}
