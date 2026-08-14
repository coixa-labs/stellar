---
name: coixa-stellar
description: >-
  Build and submit Stellar-compatible transactions with @coixa/stellar — typed
  pipelines, Horizon/RPC routing, classic operations, and Pi/Stellar network
  presets. Use when writing Stellar or Pi Network wallet/tx code, integrating
  @coixa/stellar, or choosing between Horizon and RPC.
---

# @coixa/stellar

## When to use this skill

Apply when the user is:

- Building payments, trustlines, path payments, or LP ops on **Stellar** or **Pi**
- Wiring Horizon / Soroban RPC without duplicate submissions
- Composing a typed transaction lifecycle (account → fee → build → sign → submit → confirm)
- Asking how to use `@coixa/stellar` or the Coixa stellar package under `packages/stellar`

Do **not** invent a parallel SDK. Prefer this library on top of `@stellar/stellar-sdk`.

## Core rules

1. **Never retry submission on a different transport.** Pick RPC or Horizon once via `StellarProviderRouter.submissionProvider()`.
2. **Fees come from Horizon.** Use `feeProvider()` even when submitting over RPC.
3. **Simulation/prepare require RPC.** Classic-only flows can skip those stages.
4. **Compose only needed stages.** Do not force a fixed 10-step pipeline.
5. **Secrets stay in the host app.** This library signs with caller-provided `Keypair`s; it does not store keys.

## Quick recipe — classic payment

```ts
import { Keypair } from "@stellar/stellar-sdk";
import {
  PI_TESTNET,
  createStellarProviderRouter,
  TransactionPipeline,
  accountResolutionStage,
  draftCreationStage,
  feeResolutionStage,
  buildStage,
  signingStage,
  submissionStage,
  confirmationStage,
  paymentOperation,
} from "@coixa/stellar";

const router = createStellarProviderRouter(PI_TESTNET);
const signer = Keypair.fromSecret(secret);

await TransactionPipeline.create<{ sourceAccountId: string }>()
  .use(accountResolutionStage(router.accountProvider()))
  .use(draftCreationStage((ctx) => ({
    sourceAccount: ctx.sourceAccount,
    fee: "0",
    networkPassphrase: router.network.passphrase,
    operations: [paymentOperation(destination, amount)],
  })))
  .use(feeResolutionStage(router.feeProvider()))
  .use(buildStage())
  .use(signingStage([signer]))
  .use(submissionStage(router.submissionProvider()))
  .use(confirmationStage(router.submissionProvider()))
  .run({ sourceAccountId: signer.publicKey() });
```

## Network selection

| Need | Use |
|---|---|
| Pi Testnet | `PI_TESTNET` |
| Pi Mainnet | `PI_MAINNET` |
| Stellar Testnet | `STELLAR_TESTNET` |
| Stellar Public | `STELLAR_PUBLIC` |
| Custom endpoints | `{ passphrase, horizonUrl?, rpcUrl? }` |
| Host chain config | `{ config: { networks }, network }` (duck-typed) |

## Provider matrix

| Method | Prefers | Fallback |
|---|---|---|
| `accountProvider()` | RPC | Horizon |
| `submissionProvider()` | RPC | Horizon |
| `feeProvider()` | Horizon | throws if missing |
| `simulationProvider()` | RPC | throws if missing |

Override with `createStellarProviderRouter(network, { preference: "horizon" })`.

## Stage cheat sheet

| Stage | Input needs | Adds |
|---|---|---|
| `accountResolutionStage` | `sourceAccountId` | `sourceAccount` |
| `draftCreationStage` | `sourceAccount` | `draft` |
| `feeResolutionStage` | `draft` | updates `draft.fee` |
| `buildStage` | `draft` | `unsignedTransaction` |
| `preparationStage` | unsigned tx + RPC | prepared unsigned tx |
| `signingStage` | unsigned tx + keypairs | `signedTransaction` |
| `submissionStage` | signed tx | `submission` |
| `confirmationStage` | `submission` | updated `submission` |
| `receiptNormalizationStage` | `submission` | `receipt` |

## Operation helpers

Import from `@coixa/stellar`:

- `paymentOperation`, `createAccountOperation`
- `changeTrustOperation`, `changeLiquidityPoolTrustOperation`
- `pathPaymentStrictSendOperation`
- `liquidityPoolDepositOperation`, `liquidityPoolWithdrawOperation`
- `manageSellOfferOperation`, `manageBuyOfferOperation`, `createPassiveSellOfferOperation`

Amounts are **string decimal amounts** as expected by `stellar-sdk` (not stroops), except where you explicitly use `toStroops`.

## Slippage / rates

```ts
import { calculateMinReceive, calculateRate } from "@coixa/stellar";

const min = calculateMinReceive(expectedDestAmount, 0.5); // 0.5% slippage
const { rate, formatted } = calculateRate(src, dest, { decimals: 6 });
```

## Anti-patterns

- Calling `horizon.submitTransaction` after `rpc.sendTransaction` failed (duplicate risk)
- Hard-coding fees when Horizon is available
- Putting mnemonic/seed handling inside pipeline stages (keep in wallet layer)
- Assuming Pi Mainnet has RPC — use Horizon when `rpcUrl` is absent
- Treating this package as a full wallet — key derivation, encryption, and UX stay in the app

## Deeper docs

- Human README: [README.md](README.md)
- API reference: [docs/api.md](docs/api.md)
- Publishing checklist: [docs/publishing.md](docs/publishing.md)
- Runnable sketches: [examples/](examples/)
