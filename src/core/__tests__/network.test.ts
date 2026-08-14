import {
  NETWORKS,
  normalizeStellarNetwork,
  resolveStellarNetwork,
} from "../../index";

describe("network resolution", () => {
  it("accepts a concrete network context", () => {
    const network = normalizeStellarNetwork(NETWORKS.piTestnet);
    expect(network.passphrase).toBe("Pi Testnet");
    expect(network.horizonUrl).toContain("testnet.minepi.com");
    expect(network.rpcUrl).toContain("rpc.testnet.minepi.com");
  });

  it("resolves an environment-like config without Coixa types", () => {
    const network = resolveStellarNetwork({
      network: "testnet",
      config: {
        id: "pi",
        networks: [
          {
            id: "testnet",
            passphrase: "Pi Testnet",
            horizonUrl: "https://api.testnet.minepi.com",
          },
        ],
      },
    });

    expect(network).toEqual({
      passphrase: "Pi Testnet",
      horizonUrl: "https://api.testnet.minepi.com",
      rpcUrl: undefined,
    });
  });

  it("throws when the selected network has no passphrase", () => {
    expect(() =>
      resolveStellarNetwork({
        network: "mainnet",
        config: { id: "pi", networks: [{ id: "mainnet" }] },
      })
    ).toThrow(/Missing Stellar network passphrase/);
  });
});
