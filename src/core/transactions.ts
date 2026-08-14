import {
  FeeBumpTransaction,
  Keypair,
  Transaction,
  TransactionBuilder,
} from "@stellar/stellar-sdk";

export type SignableTransaction = Transaction | FeeBumpTransaction;

/** A transaction produced by a builder and intentionally not yet signed. */
export interface UnsignedTransaction {
  readonly transaction: SignableTransaction;
  readonly networkPassphrase: string;
}

/** A self-contained signed transaction suitable for submission or transport. */
export interface SignedTransaction {
  readonly transaction: SignableTransaction;
  readonly networkPassphrase: string;
  readonly xdr: string;
  readonly signerPublicKeys: readonly string[];
}

/**
 * Sign a copy of the unsigned transaction so callers can retain and reuse the
 * original for another signing workflow.
 */
export function signTransaction(
  unsigned: UnsignedTransaction,
  signers: readonly Keypair[]
): SignedTransaction {
  if (signers.length === 0) {
    throw new Error("At least one Stellar signer is required");
  }

  const transaction = TransactionBuilder.fromXDR(
    unsigned.transaction.toXDR(),
    unsigned.networkPassphrase
  ) as SignableTransaction;

  for (const signer of signers) {
    transaction.sign(signer);
  }

  return {
    transaction,
    networkPassphrase: unsigned.networkPassphrase,
    xdr: transaction.toXDR(),
    signerPublicKeys: signers.map((signer) => signer.publicKey()),
  };
}
