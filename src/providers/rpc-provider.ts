import { rpc } from "@stellar/stellar-sdk";
import type { SignedTransaction, SignableTransaction } from "../core/transactions";
import type {
  AccountProvider,
  SimulationProvider,
  SubmissionResult,
  TransactionFinalityProvider,
} from "./contracts";

/** RPC implementation for account lookup, Soroban preparation, and submission. */
export class RpcProvider
  implements AccountProvider, SimulationProvider, TransactionFinalityProvider
{
  readonly kind = "rpc" as const;
  readonly server: rpc.Server;

  constructor(url: string) {
    this.server = new rpc.Server(url);
  }

  loadAccount(accountId: string) {
    return this.server.getAccount(accountId);
  }

  simulate(transaction: SignableTransaction) {
    return this.server.simulateTransaction(transaction);
  }

  prepare(transaction: SignableTransaction) {
    return this.server.prepareTransaction(transaction);
  }

  async submit(transaction: SignedTransaction): Promise<SubmissionResult> {
    const response = await this.server.sendTransaction(transaction.transaction);
    return {
      hash: response.hash,
      status: response.status === "ERROR" ? "failed" : "accepted",
      provider: this.kind,
      raw: response,
    };
  }

  async awaitFinality(submission: SubmissionResult): Promise<SubmissionResult> {
    if (submission.status === "failed") return submission;

    const response = await this.server.pollTransaction(submission.hash, {
      attempts: 30,
    });
    return {
      hash: submission.hash,
      status:
        response.status === "SUCCESS"
          ? "confirmed"
          : response.status === "FAILED"
            ? "failed"
            : "accepted",
      provider: this.kind,
      raw: response,
    };
  }
}
