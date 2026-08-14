/**
 * Classic native payment on Pi Testnet using the full pipeline.
 *
 * Run against a funded account:
 *   SECRET=S... DESTINATION=G... npx tsx examples/payment.ts
 */
import { Keypair, Memo } from "@stellar/stellar-sdk";
import {
  PI_TESTNET,
  TransactionPipeline,
  accountResolutionStage,
  buildStage,
  confirmationStage,
  createStellarProviderRouter,
  draftCreationStage,
  feeResolutionStage,
  paymentOperation,
  signingStage,
  submissionStage,
} from "../src";

async function main() {
  const secret = process.env.SECRET;
  const destination = process.env.DESTINATION;
  if (!secret || !destination) {
    throw new Error("Set SECRET and DESTINATION env vars");
  }

  const router = createStellarProviderRouter(PI_TESTNET);
  const signer = Keypair.fromSecret(secret);

  const result = await TransactionPipeline.create<{ sourceAccountId: string }>()
    .use(accountResolutionStage(router.accountProvider()))
    .use(
      draftCreationStage((ctx) => ({
        sourceAccount: ctx.sourceAccount,
        fee: "0",
        networkPassphrase: router.network.passphrase,
        operations: [paymentOperation(destination, "1")],
        memo: Memo.text("coixa-stellar-example"),
      }))
    )
    .use(feeResolutionStage(router.feeProvider()))
    .use(buildStage())
    .use(signingStage([signer]))
    .use(submissionStage(router.submissionProvider()))
    .use(confirmationStage(router.submissionProvider()))
    .run({ sourceAccountId: signer.publicKey() });

  console.log({
    hash: result.submission.hash,
    status: result.submission.status,
    provider: result.submission.provider,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
