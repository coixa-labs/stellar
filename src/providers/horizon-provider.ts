import { Horizon } from "@stellar/stellar-sdk";
import type { SignedTransaction } from "../core/transactions";
import type {
  AccountProvider,
  FeeProvider,
  SubmissionResult,
  TransactionFinalityProvider,
} from "./contracts";

/** Horizon implementation for classic account, fee, and submission endpoints. */
export class HorizonProvider
  implements AccountProvider, FeeProvider, TransactionFinalityProvider
{
  readonly kind = "horizon" as const;
  readonly server: Horizon.Server;

  constructor(url: string) {
    this.server = new Horizon.Server(url);
  }

  loadAccount(accountId: string) {
    return this.server.loadAccount(accountId);
  }

  getBaseFee() {
    return this.server.fetchBaseFee();
  }

  async submit(transaction: SignedTransaction): Promise<SubmissionResult> {
    try {
      const response = await this.server.submitTransaction(transaction.transaction);
      return {
        hash: response.hash,
        status: "confirmed",
        provider: this.kind,
        raw: response,
      };
    } catch (error: any) {
      const rawData = error.response?.data || error;
      return {
        hash: rawData?.hash || "",
        status: "failed",
        provider: this.kind,
        raw: rawData,
      };
    }
  }

  async awaitFinality(submission: SubmissionResult): Promise<SubmissionResult> {
    return submission;
  }
}
