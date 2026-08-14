import {
  Account,
  Memo,
  TransactionBuilder,
  xdr,
} from "@stellar/stellar-sdk";
import type { UnsignedTransaction } from "../core/transactions";

export interface TransactionDraft {
  readonly sourceAccount: Account;
  readonly fee: string | number;
  readonly networkPassphrase: string;
  readonly operations: readonly xdr.Operation[];
  readonly memo?: Memo;
  readonly timeoutSeconds?: number;
}

/** Builds unsigned classic Stellar transactions and never signs or submits. */
export class StellarTransactionBuilder {
  build(draft: TransactionDraft): UnsignedTransaction {
    let builder = new TransactionBuilder(draft.sourceAccount, {
      fee: String(draft.fee),
      networkPassphrase: draft.networkPassphrase,
      memo: draft.memo,
    });

    for (const operation of draft.operations) {
      builder = builder.addOperation(operation);
    }

    return {
      transaction: builder.setTimeout(draft.timeoutSeconds ?? 40).build(),
      networkPassphrase: draft.networkPassphrase,
    };
  }
}
