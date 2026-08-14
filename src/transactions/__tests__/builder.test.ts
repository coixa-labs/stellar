import { Account, Asset, Keypair, Operation } from "@stellar/stellar-sdk";
import { StellarTransactionBuilder } from "../builder";
import { signTransaction } from "../../core/transactions";

describe("StellarTransactionBuilder", () => {
  it("builds an unsigned payment and signs a copy", () => {
    const signer = Keypair.random();
    const destination = Keypair.random().publicKey();
    const draft = {
      sourceAccount: new Account(signer.publicKey(), "1"),
      fee: "100",
      networkPassphrase: "Pi Testnet",
      operations: [
        Operation.payment({
          destination,
          asset: Asset.native(),
          amount: "1",
        }),
      ],
    };

    const unsigned = new StellarTransactionBuilder().build(draft);
    const signed = signTransaction(unsigned, [signer]);

    expect(unsigned.transaction.signatures).toHaveLength(0);
    expect(signed.signerPublicKeys).toEqual([signer.publicKey()]);
    expect(signed.xdr.length).toBeGreaterThan(0);
    expect(signed.networkPassphrase).toBe("Pi Testnet");
  });
});
