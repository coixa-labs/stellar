/**
 * Path payment strict-send with slippage floor via calculateMinReceive.
 *
 * This example builds and signs locally; set BROADCAST=1 to submit.
 *
 *   SECRET=S... DEST=G... DEST_CODE=USD DEST_ISSUER=G... SEND_AMOUNT=10 EXPECTED=9.5 \
 *     npx tsx examples/path-payment.ts
 */
import { Asset, Keypair } from "@stellar/stellar-sdk";
import {
  PI_TESTNET,
  TransactionPipeline,
  accountResolutionStage,
  buildStage,
  calculateMinReceive,
  confirmationStage,
  createStellarProviderRouter,
  draftCreationStage,
  feeResolutionStage,
  pathPaymentStrictSendOperation,
  signingStage,
  submissionStage,
} from "../src";

async function main() {
  const secret = process.env.SECRET;
  const destination = process.env.DEST;
  const destCode = process.env.DEST_CODE;
  const destIssuer = process.env.DEST_ISSUER;
  const sendAmount = process.env.SEND_AMOUNT ?? "1";
  const expectedDest = process.env.EXPECTED ?? "0.9";
  const slippage = Number(process.env.SLIPPAGE ?? "0.5");

  if (!secret || !destination || !destCode || !destIssuer) {
    throw new Error("Set SECRET, DEST, DEST_CODE, DEST_ISSUER");
  }

  const router = createStellarProviderRouter(PI_TESTNET);
  const signer = Keypair.fromSecret(secret);
  const destMin = String(calculateMinReceive(expectedDest, slippage));

  const pipeline = TransactionPipeline.create<{ sourceAccountId: string }>()
    .use(accountResolutionStage(router.accountProvider()))
    .use(
      draftCreationStage((ctx) => ({
        sourceAccount: ctx.sourceAccount,
        fee: "0",
        networkPassphrase: router.network.passphrase,
        operations: [
          pathPaymentStrictSendOperation(
            Asset.native(),
            sendAmount,
            new Asset(destCode, destIssuer),
            destMin,
            destination
          ),
        ],
      }))
    )
    .use(feeResolutionStage(router.feeProvider()))
    .use(buildStage())
    .use(signingStage([signer]));

  if (process.env.BROADCAST === "1") {
    const result = await pipeline
      .use(submissionStage(router.submissionProvider()))
      .use(confirmationStage(router.submissionProvider()))
      .run({ sourceAccountId: signer.publicKey() });
    console.log(result.submission);
    return;
  }

  const built = await pipeline.run({ sourceAccountId: signer.publicKey() });
  console.log({
    xdr: built.signedTransaction.xdr,
    destMin,
    signers: built.signedTransaction.signerPublicKeys,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
