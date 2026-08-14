import { Account, Horizon, Transaction } from "@stellar/stellar-sdk";
import type { SignedTransaction, SignableTransaction } from "../core/transactions";

export type StellarProviderKind = "rpc" | "horizon";
export type SubmissionStatus = "accepted" | "confirmed" | "failed";

export interface SubmissionResult {
  readonly hash: string;
  readonly status: SubmissionStatus;
  readonly provider: StellarProviderKind;
  readonly raw: unknown;
}

export interface AccountProvider {
  loadAccount(accountId: string): Promise<Account | Horizon.AccountResponse>;
}

export interface FeeProvider {
  getBaseFee(): Promise<number>;
}

export interface TransactionSubmitProvider {
  submit(transaction: SignedTransaction): Promise<SubmissionResult>;
}

/** Resolves a submitted transaction to a terminal state when the transport supports it. */
export interface TransactionFinalityProvider extends TransactionSubmitProvider {
  awaitFinality(submission: SubmissionResult): Promise<SubmissionResult>;
}

export interface SimulationProvider {
  simulate(transaction: SignableTransaction): Promise<unknown>;
  prepare(transaction: SignableTransaction): Promise<Transaction>;
}

export interface StellarProvider extends AccountProvider {
  readonly kind: StellarProviderKind;
}
