/**
 * Stellar Chain Library - Error Classes
 * 
 * Custom error types for Stellar-based chain operations
 */

export class InvalidMnemonicError extends Error {
  constructor(message = "The provided mnemonic is invalid.") {
    super(message);
    this.name = "InvalidMnemonicError";
  }
}

export class WalletDerivationError extends Error {
  constructor(message = "Failed to derive wallet from seed.") {
    super(message);
    this.name = "WalletDerivationError";
  }
}

export class StellarChainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StellarChainError";
  }
}
