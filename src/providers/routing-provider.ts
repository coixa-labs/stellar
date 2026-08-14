import {
  normalizeStellarNetwork,
  type ProviderPreference,
  type StellarNetworkContext,
  type StellarNetworkInput,
} from "../core/network";
import type {
  AccountProvider,
  FeeProvider,
  SimulationProvider,
  TransactionFinalityProvider,
} from "./contracts";
import { HorizonProvider } from "./horizon-provider";
import { RpcProvider } from "./rpc-provider";

export interface StellarProviderRouterOptions {
  readonly preference?: ProviderPreference;
}

/**
 * Resolves providers by capability. Submission and account lookup prefer RPC;
 * fee lookup remains Horizon-backed because the current RPC API has no base-fee
 * endpoint. Submission is selected once and never retried through another
 * transport, avoiding accidental duplicate transactions.
 */
export class StellarProviderRouter {
  readonly network: StellarNetworkContext;
  readonly rpc?: RpcProvider;
  readonly horizon?: HorizonProvider;
  readonly preference: ProviderPreference;

  constructor(
    network: StellarNetworkContext,
    options: StellarProviderRouterOptions = {}
  ) {
    this.network = network;
    this.preference = options.preference ?? "auto";
    this.rpc = network.rpcUrl ? new RpcProvider(network.rpcUrl) : undefined;
    this.horizon = network.horizonUrl
      ? new HorizonProvider(network.horizonUrl)
      : undefined;
  }

  accountProvider(): AccountProvider {
    return this.select<AccountProvider>(this.rpc, this.horizon, "account lookup");
  }

  feeProvider(): FeeProvider {
    if (!this.horizon) {
      throw new Error("Horizon is required to resolve the current Stellar base fee");
    }
    return this.horizon;
  }

  submissionProvider(): TransactionFinalityProvider {
    return this.select<TransactionFinalityProvider>(
      this.rpc,
      this.horizon,
      "transaction submission"
    );
  }

  simulationProvider(): SimulationProvider {
    if (!this.rpc) {
      throw new Error("Stellar RPC is required for transaction simulation");
    }
    return this.rpc;
  }

  private select<T>(
    rpc: T | undefined,
    horizon: T | undefined,
    capability: string
  ): T {
    const preferred = this.preference === "horizon" ? horizon : rpc;
    const fallback = this.preference === "horizon" ? rpc : horizon;
    if (preferred) return preferred;
    if (fallback) return fallback;
    throw new Error(`No Stellar provider is configured for ${capability}`);
  }
}

/**
 * Create a provider router from a network context or an environment-like object
 * (`{ config: { networks }, network }`).
 */
export function createStellarProviderRouter(
  input: StellarNetworkInput,
  options?: StellarProviderRouterOptions
): StellarProviderRouter {
  return new StellarProviderRouter(normalizeStellarNetwork(input), options);
}
