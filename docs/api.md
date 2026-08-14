# API reference

Public surface of `@coixa/stellar` (v0.1).

## Networks

### Types

```ts
type ProviderPreference = "auto" | "rpc" | "horizon";

interface StellarNetworkContext {
  readonly passphrase: string;
  readonly rpcUrl?: string;
  readonly horizonUrl?: string;
}

interface StellarEnvironmentLike {
  readonly network: string;
  readonly config: {
    readonly id?: string;
    readonly networks: readonly {
      readonly id: string;
      readonly passphrase?: string;
      readonly rpcUrl?: string;
      readonly horizonUrl?: string;
    }[];
  };
}

type StellarNetworkInput = StellarNetworkContext | StellarEnvironmentLike;
```

### Presets

| Export | Passphrase | Horizon | RPC |
|---|---|---|---|
| `PI_MAINNET` | `Pi Network` | `https://api.mainnet.minepi.com` | — |
| `PI_TESTNET` | `Pi Testnet` | `https://api.testnet.minepi.com` | `https://rpc.testnet.minepi.com` |
| `STELLAR_PUBLIC` | Public Global Stellar Network ; September 2015 | `https://horizon.stellar.org` | — |
| `STELLAR_TESTNET` | Test SDF Network ; September 2015 | `https://horizon-testnet.stellar.org` | `https://soroban-testnet.stellar.org` |

Also available as `NETWORKS.piMainnet | piTestnet | stellarPublic | stellarTestnet`.

### Functions

- `normalizeStellarNetwork(input)` → `StellarNetworkContext`
- `resolveStellarNetwork(environment)` → context from environment-like object
- `toStellarNetworkContext(network)` → context from a single network entry
- `isStellarNetworkContext(input)` → type guard

## Providers

### `createStellarProviderRouter(input, options?)`

Returns `StellarProviderRouter`.

### `StellarProviderRouter`

| Member | Description |
|---|---|
| `network` | Resolved `StellarNetworkContext` |
| `rpc` / `horizon` | Underlying providers if URLs present |
| `preference` | `auto` \| `rpc` \| `horizon` |
| `accountProvider()` | Account load |
| `feeProvider()` | Horizon base fee |
| `submissionProvider()` | Submit + await finality |
| `simulationProvider()` | Soroban simulate/prepare |

### Provider classes

- `HorizonProvider` — `loadAccount`, `getBaseFee`, `submit`, `awaitFinality` (no-op passthrough)
- `RpcProvider` — `loadAccount`, `simulate`, `prepare`, `submit`, `awaitFinality` (polls)

### Contracts

`AccountProvider`, `FeeProvider`, `TransactionSubmitProvider`, `TransactionFinalityProvider`, `SimulationProvider`, `SubmissionResult`.

`SubmissionStatus`: `"accepted" | "confirmed" | "failed"`.

## Transactions

### `StellarTransactionBuilder`

`build(draft: TransactionDraft): UnsignedTransaction`

```ts
interface TransactionDraft {
  sourceAccount: Account;
  fee: string | number;
  networkPassphrase: string;
  operations: readonly xdr.Operation[];
  memo?: Memo;
  timeoutSeconds?: number; // default 40
}
```

### Signing

`signTransaction(unsigned, signers): SignedTransaction` — signs a **copy**; original unsigned XDR remains reusable.

### Pipeline

```ts
TransactionPipeline.create<TInitial>()
  .use(stage)
  .run(initial) // => Promise<TContext>
```

Stages are pure composition; order is caller-defined.

## Classic operations

All return `xdr.Operation`:

- `paymentOperation(destination, amount, options?)`
- `createAccountOperation(destination, startingBalance)`
- `changeTrustOperation(assetCode, assetIssuer, limit?)`
- `changeLiquidityPoolTrustOperation(assetA, assetB, fee, limit?)`
- `pathPaymentStrictSendOperation(sendAsset, sendAmount, destAsset, destMin, destination, path?)`
- `liquidityPoolDepositOperation(...)`
- `liquidityPoolWithdrawOperation(...)`
- `manageSellOfferOperation(...)`
- `manageBuyOfferOperation(...)`
- `createPassiveSellOfferOperation(...)`

## Helpers

- `calculateRate(sourceAmount, destAmount, { invert?, decimals? })`
- `calculateMinReceive(expectedAmount, slippagePercent)`
- `toStroops(tokenAmount)` / `fromStroops(stroops)`

## WalletUtils

Requires peer dependency `bip39`:

- `generateMnemonic(128 | 256)`
- `validateMnemonic(mnemonic)`
- `mnemonicToSeed(mnemonic)`

## Errors

`InvalidMnemonicError`, `WalletDerivationError`, `StellarChainError`.
