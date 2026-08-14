# @coixa/stellar

Typed **transaction pipeline** and **Horizon / RPC provider routing** for Stellar-compatible networks — including **Stellar** and **Pi Network**.

This library does **not** replace [`@stellar/stellar-sdk`](https://github.com/stellar/js-stellar-sdk). It sits on top of it and gives you:

1. A composable, typed pipeline (`resolve account → fee → build → sign → submit → confirm`)
2. Safe transport selection (RPC vs Horizon) without duplicate submissions
3. Classic operation helpers and Pi/Stellar network presets

Built and used in production by [Coixa](https://coixa.xyz).

## Why this exists

Raw `stellar-sdk` usage often mixes Horizon and RPC, retries the wrong transport, and buries signing/submission in app code. `@coixa/stellar` makes the lifecycle explicit and reusable across Stellar forks (Pi included).

## Install

```bash
npm install @coixa/stellar @stellar/stellar-sdk
# optional (only if you use WalletUtils)
npm install bip39
```

## Quick start (Pi Testnet payment)

```ts
import { Keypair, Memo } from "@stellar/stellar-sdk";
import {
  PI_TESTNET,
  TransactionPipeline,
  accountResolutionStage,
  draftCreationStage,
  feeResolutionStage,
  buildStage,
  signingStage,
  submissionStage,
  confirmationStage,
  createStellarProviderRouter,
  paymentOperation,
} from "@coixa/stellar";

const router = createStellarProviderRouter(PI_TESTNET);
const signer = Keypair.fromSecret(process.env.SECRET!);

const result = await TransactionPipeline.create<{
  sourceAccountId: string;
}>()
  .use(accountResolutionStage(router.accountProvider()))
  .use(
    draftCreationStage((ctx) => ({
      sourceAccount: ctx.sourceAccount,
      fee: "0",
      networkPassphrase: router.network.passphrase,
      operations: [
        paymentOperation(process.env.DESTINATION!, "1"),
      ],
      memo: Memo.text("coixa-stellar"),
    }))
  )
  .use(feeResolutionStage(router.feeProvider()))
  .use(buildStage())
  .use(signingStage([signer]))
  .use(submissionStage(router.submissionProvider()))
  .use(confirmationStage(router.submissionProvider()))
  .run({ sourceAccountId: signer.publicKey() });

console.log(result.submission.hash, result.submission.status);
```

## Network presets

```ts
import {
  PI_MAINNET,
  PI_TESTNET,
  STELLAR_PUBLIC,
  STELLAR_TESTNET,
  NETWORKS,
  createStellarProviderRouter,
} from "@coixa/stellar";

createStellarProviderRouter(PI_TESTNET);
createStellarProviderRouter(NETWORKS.stellarTestnet);

// Or pass endpoints directly:
createStellarProviderRouter({
  passphrase: "Pi Testnet",
  horizonUrl: "https://api.testnet.minepi.com",
  rpcUrl: "https://rpc.testnet.minepi.com",
});
```

### Environment-shaped configs

If your app already has `{ config: { networks }, network }`, pass it through — no adapter required:

```ts
createStellarProviderRouter({
  config: {
    id: "pi",
    networks: [
      {
        id: "testnet",
        passphrase: "Pi Testnet",
        horizonUrl: "https://api.testnet.minepi.com",
        rpcUrl: "https://rpc.testnet.minepi.com",
      },
    ],
  },
  network: "testnet",
});
```

## Provider routing rules

| Capability | Default (`auto`) | Notes |
|---|---|---|
| Account lookup | RPC → Horizon | |
| Submission | RPC → Horizon | Selected **once** — never retried on the other transport |
| Base fee | Horizon only | RPC has no base-fee endpoint |
| Simulation / prepare | RPC only | Required for Soroban |

Force a transport with `{ preference: "rpc" | "horizon" }`.

## Pipeline stages

Compose only what you need:

| Stage | Purpose |
|---|---|
| `accountResolutionStage` | Load source account / sequence |
| `draftCreationStage` | Build a `TransactionDraft` |
| `feeResolutionStage` | Fill fee from Horizon |
| `buildStage` | Unsigned transaction |
| `simulationStage` / `preparationStage` | Soroban simulate / prepare |
| `signingStage` | Sign with one or more `Keypair`s |
| `submissionStage` | Submit |
| `confirmationStage` | Poll finality (RPC) |
| `receiptNormalizationStage` | Map submission → app receipt |

## Classic operations

Helpers wrap common ops: `paymentOperation`, `createAccountOperation`, `changeTrustOperation`, `pathPaymentStrictSendOperation`, liquidity pool deposit/withdraw, manage buy/sell offer, passive sell offer.

## Utilities

- `calculateRate` / `calculateMinReceive` — swap UI math
- `toStroops` / `fromStroops` — 7-decimal conversion
- `WalletUtils` — BIP39 mnemonic helpers (requires `bip39`)

## Examples

See [`examples/`](./examples):

- [`payment.ts`](./examples/payment.ts) — classic payment pipeline
- [`trustline.ts`](./examples/trustline.ts) — change trust
- [`path-payment.ts`](./examples/path-payment.ts) — path payment strict send

## AI agents

Agent instructions live in [`SKILL.md`](./SKILL.md). API detail: [`docs/api.md`](./docs/api.md).

## Status

**v0.1.0** — production-extracted from Coixa. Public API may still evolve; pin a version when you depend on it.

## License

Apache-2.0 — see [`LICENSE`](./LICENSE).
