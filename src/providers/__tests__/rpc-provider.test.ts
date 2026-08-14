import { RpcProvider } from "../rpc-provider";
import { StellarProviderRouter } from "../routing-provider";

describe("RpcProvider finality", () => {
  const submission = {
    hash: "transaction-hash",
    status: "accepted" as const,
    provider: "rpc" as const,
    raw: {},
  };

  it("maps a polled RPC success to confirmed", async () => {
    const provider = new RpcProvider("https://rpc.example.test");
    (provider as any).server = {
      pollTransaction: jest.fn().mockResolvedValue({ status: "SUCCESS", ledger: 42 }),
    };

    await expect(provider.awaitFinality(submission)).resolves.toMatchObject({
      hash: submission.hash,
      status: "confirmed",
      provider: "rpc",
    });
  });

  it("maps a polled RPC failure to failed without invoking another provider", async () => {
    const provider = new RpcProvider("https://rpc.example.test");
    const pollTransaction = jest.fn().mockResolvedValue({ status: "FAILED" });
    (provider as any).server = { pollTransaction };

    await expect(provider.awaitFinality(submission)).resolves.toMatchObject({
      status: "failed",
    });
    expect(pollTransaction).toHaveBeenCalledWith(submission.hash, { attempts: 30 });
  });
});

describe("StellarProviderRouter", () => {
  const network = {
    passphrase: "Test SDF Network ; September 2015",
    rpcUrl: "https://rpc.example.test",
    horizonUrl: "https://horizon.example.test",
  };

  it("uses RPC for account/submission and Horizon for classic fees", () => {
    const router = new StellarProviderRouter(network);

    expect((router.accountProvider() as any).kind).toBe("rpc");
    expect((router.submissionProvider() as any).kind).toBe("rpc");
    expect((router.feeProvider() as any).kind).toBe("horizon");
  });

  it("honors an explicit Horizon submission preference", () => {
    const router = new StellarProviderRouter(network, { preference: "horizon" });

    expect((router.submissionProvider() as any).kind).toBe("horizon");
  });
});
