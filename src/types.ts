import { AssetType, Horizon } from "@stellar/stellar-sdk";

export type StellarTx =
  | Horizon.ServerApi.CreateAccountOperationRecord
  | Horizon.ServerApi.PaymentOperationRecord
  | Horizon.ServerApi.PathPaymentOperationRecord
  | Horizon.ServerApi.AccountMergeOperationRecord
  | Horizon.ServerApi.PathPaymentStrictSendOperationRecord
  | Horizon.ServerApi.InvokeHostFunctionOperationRecord;

export type StellarAsset = {
  asset_type: AssetType | "native" | string;
  asset_code?: string;
  asset_issuer?: string;
};

export interface AccountDetails {
  account_id: string;
  sequence: string;
  balance: string;
  signers: AccountSigner[];
}

export interface AccountSigner {
  weight: number;
  key: string;
  type: "ed25519_public_key";
}

export interface AccountResponse {
  id: string;
  account_id: string;
  sequence: string;
  balances: AccountBalance[];
  signers: AccountSigner[];
  flags: AccountFlags;
}

export interface AccountBalance {
  balance: string;
  asset_type: "native" | string;
  asset_code?: string;
  asset_issuer?: string;
}

export interface AccountFlags {
  auth_required: boolean;
  auth_revocable: boolean;
  auth_immutable: boolean;
  auth_clawback_enabled: boolean;
}

export type AccountInfo = Pick<
  AccountResponse,
  "account_id" | "sequence" | "balances" | "signers"
> & {
  balance: string;
};

export interface SendPaymentAssetOptions {
  assetCode: string;
  assetIssuer: string;
}

export interface SendPaymentOptions {
  asset?: SendPaymentAssetOptions;
  memo?: string;
  autoActivate?: boolean;
}

export type SendTransactionOptions = {
  memo?: string;
  autoActivate?: boolean;
};

/**
 * Optional host-app chain config shape for Stellar-compatible chains.
 * Not required to use the library — prefer `StellarNetworkContext` / presets.
 */
export interface StellarChainConfig {
  chainId: string;
  name: string;
  symbol: string;
  decimals: number;
  derivationPath: string;
  horizonUrl: string;
  networkPassphrase: string;
}
