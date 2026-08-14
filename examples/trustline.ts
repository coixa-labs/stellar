/**
 * Add a trustline for a credit asset on Pi Testnet.
 *
 *   SECRET=S... ASSET_CODE=USD ASSET_ISSUER=G... npx tsx examples/trustline.ts
 */
import { Keypair } from "@stellar/stellar-sdk";
import {
  PI_TESTNET,
  TransactionPipeline,
  accountResolutionStage,
  buildStage,
  changeTrustOperation,
  confirmationStage,
  createStellarProviderRouter,
  draftCreationStage,
  feeResolutionStage,
  signingStage,
  submissionStage,
} from "../src";

async function main() {
  const secret = process.env.SECRET;
  const assetCode = process.env.ASSET_CODE;
  const assetIssuer = process.env.ASSET_ISSUER;
  if (!secret || !assetCode || !assetIssuer) {
    throw new Error("Set SECRET, ASSET_CODE, and ASSET_ISSUER");
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
        operations: [changeTrustOperation(assetCode, assetIssuer)],
      }))
    )
    .use(feeResolutionStage(router.feeProvider()))
    .use(buildStage())
    .use(signingStage([signer]))
    .use(submissionStage(router.submissionProvider()))
    .use(confirmationStage(router.submissionProvider()))
    .run({ sourceAccountId: signer.publicKey() });

  console.log(result.submission);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
