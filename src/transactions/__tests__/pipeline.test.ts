import { Account, Asset, Keypair, Operation } from "@stellar/stellar-sdk";
import {
  confirmationStage,
  feeResolutionStage,
  signingStage,
} from "../stages";
import { StellarTransactionBuilder } from "../builder";
import { TransactionPipeline } from "../pipeline";
import type { TransactionFinalityProvider } from "../../providers/contracts";

describe("TransactionPipeline", () => {
  it("composes optional fee, build, signing, and confirmation stages", async () => {
    const signer = Keypair.random();
    const feeProvider = { getBaseFee: jest.fn().mockResolvedValue(100) };
    const finalityProvider: TransactionFinalityProvider = {
      submit: jest.fn(),
      awaitFinality: jest.fn().mockResolvedValue({
        hash: "abc123",
        status: "confirmed",
        provider: "rpc",
        raw: { ledger: 42 },
      }),
    };

    const pipeline = TransactionPipeline.create<{
      metadata?: Readonly<Record<string, unknown>>;
      draft: {
        sourceAccount: Account;
        fee: string | number;
        networkPassphrase: string;
        operations: readonly ReturnType<typeof Operation.payment>[];
      };
    }>()
      .use(feeResolutionStage(feeProvider))
      .use(({
        name: "build",
        async execute(context) {
          return {
            ...context,
            unsignedTransaction: new StellarTransactionBuilder().build(context.draft),
          };
        },
      }))
      .use(signingStage([signer]))
      .use(({
        name: "submitted",
        async execute(context) {
          return {
            ...context,
            submission: {
              hash: "abc123",
              status: "accepted" as const,
              provider: "rpc" as const,
              raw: {},
            },
          };
        },
      }))
      .use(confirmationStage(finalityProvider));

    const result = await pipeline.run({
      draft: {
        sourceAccount: new Account(signer.publicKey(), "1"),
        fee: "0",
        networkPassphrase: "Test SDF Network ; September 2015",
        operations: [
          Operation.payment({
            destination: Keypair.random().publicKey(),
            asset: Asset.native(),
            amount: "1",
          }),
        ],
      },
    });

    expect(feeProvider.getBaseFee).toHaveBeenCalledTimes(1);
    expect(result.draft.fee).toBe(100);
    expect(result.signedTransaction.signerPublicKeys).toEqual([signer.publicKey()]);
    expect(result.submission).toMatchObject({ status: "confirmed", hash: "abc123" });
  });
});
