import type { Account, Keypair } from "@stellar/stellar-sdk";
import type { UnsignedTransaction } from "../core/transactions";
import { signTransaction, type SignedTransaction } from "../core/transactions";
import type { AccountProvider, FeeProvider, SimulationProvider, SubmissionResult, TransactionFinalityProvider, TransactionSubmitProvider } from "../providers/contracts";
import { StellarTransactionBuilder, type TransactionDraft } from "./builder";
import type { PipelineContext, TransactionPipelineStage } from "./pipeline";

export type FeeDraftContext = PipelineContext & { readonly draft: TransactionDraft };
export type AccountResolutionContext = PipelineContext & {
  readonly sourceAccountId: string;
};
export type ResolvedAccountContext = PipelineContext & {
  readonly sourceAccount: Account;
};
export type UnsignedTransactionContext = PipelineContext & {
  readonly unsignedTransaction: UnsignedTransaction;
};
export type SignedTransactionContext = PipelineContext & {
  readonly signedTransaction: SignedTransaction;
};

export type SubmissionContext = PipelineContext & {
  readonly submission: SubmissionResult;
};

export function accountResolutionStage<T extends AccountResolutionContext>(
  provider: AccountProvider
): TransactionPipelineStage<T, T & ResolvedAccountContext> {
  return {
    name: "resolve-account",
    async execute(context) {
      return {
        ...context,
        sourceAccount: await provider.loadAccount(context.sourceAccountId),
      };
    },
  };
}

export function draftCreationStage<T extends ResolvedAccountContext>(
  createDraft: (context: T) => TransactionDraft
): TransactionPipelineStage<T, T & FeeDraftContext> {
  return {
    name: "create-draft",
    async execute(context) {
      return { ...context, draft: createDraft(context) };
    },
  };
}

export function feeResolutionStage<T extends FeeDraftContext>(
  provider: FeeProvider
): TransactionPipelineStage<T, T> {
  return {
    name: "resolve-fee",
    async execute(context) {
      return { ...context, draft: { ...context.draft, fee: await provider.getBaseFee() } };
    },
  };
}

export function buildStage<T extends FeeDraftContext>(
  builder: StellarTransactionBuilder = new StellarTransactionBuilder()
): TransactionPipelineStage<T, T & UnsignedTransactionContext> {
  return {
    name: "build",
    async execute(context) {
      return { ...context, unsignedTransaction: builder.build(context.draft) };
    },
  };
}

export function simulationStage<T extends UnsignedTransactionContext>(
  provider: SimulationProvider
): TransactionPipelineStage<T, T & { readonly simulation: unknown }> {
  return {
    name: "simulate",
    async execute(context) {
      return { ...context, simulation: await provider.simulate(context.unsignedTransaction.transaction) };
    },
  };
}

/**
 * Applies RPC simulation results to a transaction before signing. This is
 * optional and is primarily useful for Soroban operations.
 */
export function preparationStage<T extends UnsignedTransactionContext>(
  provider: SimulationProvider
): TransactionPipelineStage<T, T> {
  return {
    name: "prepare",
    async execute(context) {
      const transaction = await provider.prepare(context.unsignedTransaction.transaction);
      return {
        ...context,
        unsignedTransaction: {
          transaction,
          networkPassphrase: context.unsignedTransaction.networkPassphrase,
        },
      };
    },
  };
}

export function signingStage<T extends UnsignedTransactionContext>(
  signers: readonly Keypair[]
): TransactionPipelineStage<T, T & SignedTransactionContext> {
  return {
    name: "sign",
    async execute(context) {
      return { ...context, signedTransaction: signTransaction(context.unsignedTransaction, signers) };
    },
  };
}

export function submissionStage<T extends SignedTransactionContext>(
  provider: TransactionSubmitProvider
): TransactionPipelineStage<T, T & { readonly submission: SubmissionResult }> {
  return {
    name: "submit",
    async execute(context) {
      return { ...context, submission: await provider.submit(context.signedTransaction) };
    },
  };
}

export function confirmationStage<T extends SubmissionContext>(
  provider: TransactionFinalityProvider
): TransactionPipelineStage<T, T> {
  return {
    name: "confirm",
    async execute(context) {
      return { ...context, submission: await provider.awaitFinality(context.submission) };
    },
  };
}

/** Adds application-specific receipt mapping without coupling it to a provider. */
export function receiptNormalizationStage<
  T extends SubmissionContext,
  TReceipt,
>(
  normalize: (submission: SubmissionResult, context: T) => TReceipt | Promise<TReceipt>
): TransactionPipelineStage<T, T & { readonly receipt: TReceipt }> {
  return {
    name: "normalize-receipt",
    async execute(context) {
      return { ...context, receipt: await normalize(context.submission, context) };
    },
  };
}
