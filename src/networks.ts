/**
 * Well-known Stellar-compatible network presets.
 * Values are public network identifiers / endpoints — not secrets.
 */
import type { StellarNetworkContext } from "./core/network";

export const PI_MAINNET: StellarNetworkContext = {
  passphrase: "Pi Network",
  horizonUrl: "https://api.mainnet.minepi.com",
};

export const PI_TESTNET: StellarNetworkContext = {
  passphrase: "Pi Testnet",
  horizonUrl: "https://api.testnet.minepi.com",
  rpcUrl: "https://rpc.testnet.minepi.com",
};

export const STELLAR_PUBLIC: StellarNetworkContext = {
  passphrase: "Public Global Stellar Network ; September 2015",
  horizonUrl: "https://horizon.stellar.org",
};

export const STELLAR_TESTNET: StellarNetworkContext = {
  passphrase: "Test SDF Network ; September 2015",
  horizonUrl: "https://horizon-testnet.stellar.org",
  rpcUrl: "https://soroban-testnet.stellar.org",
};

export const NETWORKS = {
  piMainnet: PI_MAINNET,
  piTestnet: PI_TESTNET,
  stellarPublic: STELLAR_PUBLIC,
  stellarTestnet: STELLAR_TESTNET,
} as const;

export type NetworkPresetName = keyof typeof NETWORKS;
