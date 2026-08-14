/**
 * Network resolution for Stellar-compatible chains (Stellar, Pi Network, etc.).
 *
 * Accepts either a concrete network context or a duck-typed environment object
 * so host apps can pass their own chain configs without depending on Coixa types.
 */

export type ProviderPreference = "auto" | "rpc" | "horizon";

/** The network details needed by the provider and transaction layers. */
export interface StellarNetworkContext {
  readonly passphrase: string;
  readonly rpcUrl?: string;
  readonly horizonUrl?: string;
}

/** Minimal network entry shape — compatible with typical wallet chain configs. */
export interface StellarNetworkLike {
  readonly id: string;
  readonly passphrase?: string;
  readonly rpcUrl?: string;
  readonly horizonUrl?: string;
}

/**
 * Duck-typed environment. Any object with `config.networks` + `network` works,
 * including Coixa's `IChainEnvironment`.
 */
export interface StellarEnvironmentLike {
  readonly network: string;
  readonly config: {
    readonly id?: string;
    readonly networks: readonly StellarNetworkLike[];
  };
}

export type StellarNetworkInput = StellarNetworkContext | StellarEnvironmentLike;

export function isStellarNetworkContext(
  input: StellarNetworkInput
): input is StellarNetworkContext {
  return (
    typeof input === "object" &&
    input !== null &&
    "passphrase" in input &&
    typeof (input as StellarNetworkContext).passphrase === "string" &&
    !("config" in input)
  );
}

export function toStellarNetworkContext(
  network: StellarNetworkLike
): StellarNetworkContext {
  if (!network.passphrase) {
    throw new Error(`Missing Stellar network passphrase for network id "${network.id}"`);
  }

  return {
    passphrase: network.passphrase,
    rpcUrl: network.rpcUrl,
    horizonUrl: network.horizonUrl,
  };
}

export function resolveStellarNetwork(
  environment: StellarEnvironmentLike
): StellarNetworkContext {
  const network = environment.config.networks.find(
    (item) => item.id === environment.network
  );

  if (!network?.passphrase) {
    const chainId = environment.config.id ?? "unknown";
    throw new Error(
      `Missing Stellar network passphrase for ${chainId}/${environment.network}`
    );
  }

  return toStellarNetworkContext(network);
}

/** Normalize either a direct context or an environment-like object. */
export function normalizeStellarNetwork(
  input: StellarNetworkInput
): StellarNetworkContext {
  if (isStellarNetworkContext(input)) {
    return input;
  }
  return resolveStellarNetwork(input);
}
