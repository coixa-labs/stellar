import { Asset, LiquidityPoolAsset, Operation, type xdr } from "@stellar/stellar-sdk";
import type { SendPaymentOptions } from "../types";

export function paymentOperation(
  destination: string,
  amount: string,
  options: SendPaymentOptions = {}
): xdr.Operation {
  const asset = options.asset
    ? new Asset(options.asset.assetCode, options.asset.assetIssuer)
    : Asset.native();
  return Operation.payment({ destination, amount, asset });
}

export function createAccountOperation(
  destination: string,
  startingBalance: string
): xdr.Operation {
  return Operation.createAccount({ destination, startingBalance });
}

export function changeTrustOperation(
  assetCode: string,
  assetIssuer: string,
  limit?: string
): xdr.Operation {
  return Operation.changeTrust({
    asset: new Asset(assetCode, assetIssuer),
    ...(limit ? { limit } : {}),
  });
}

export function changeLiquidityPoolTrustOperation(
  assetA: Asset,
  assetB: Asset,
  fee: number,
  limit?: string
): xdr.Operation {
  const lpAsset = new LiquidityPoolAsset(assetA, assetB, fee);
  return Operation.changeTrust({
    asset: lpAsset,
    ...(limit ? { limit } : {}),
  });
}

export function pathPaymentStrictSendOperation(
  sendAsset: Asset,
  sendAmount: string,
  destAsset: Asset,
  destMin: string,
  destination: string,
  path: Asset[] = []
): xdr.Operation {
  return Operation.pathPaymentStrictSend({
    sendAsset,
    sendAmount,
    destAsset,
    destMin,
    destination,
    path,
  });
}

export function liquidityPoolDepositOperation(
  liquidityPoolId: string,
  maxAmountA: string,
  maxAmountB: string,
  minPrice: string,
  maxPrice: string
): xdr.Operation {
  return Operation.liquidityPoolDeposit({
    liquidityPoolId,
    maxAmountA,
    maxAmountB,
    minPrice,
    maxPrice,
  });
}

export function liquidityPoolWithdrawOperation(
  liquidityPoolId: string,
  amount: string,
  minAmountA: string,
  minAmountB: string
): xdr.Operation {
  return Operation.liquidityPoolWithdraw({
    liquidityPoolId,
    amount,
    minAmountA,
    minAmountB,
  });
}

export function manageSellOfferOperation(
  selling: Asset,
  buying: Asset,
  amount: string,
  price: { n: number; d: number },
  offerId: number = 0
): xdr.Operation {
  return Operation.manageSellOffer({
    selling,
    buying,
    amount,
    price,
    offerId,
  });
}

export function manageBuyOfferOperation(
  buying: Asset,
  selling: Asset,
  buyAmount: string,
  price: { n: number; d: number },
  offerId: number = 0
): xdr.Operation {
  return Operation.manageBuyOffer({
    buying,
    selling,
    buyAmount,
    price,
    offerId,
  });
}

export function createPassiveSellOfferOperation(
  selling: Asset,
  buying: Asset,
  amount: string,
  price: { n: number; d: number }
): xdr.Operation {
  return Operation.createPassiveSellOffer({
    selling,
    buying,
    amount,
    price,
  });
}

