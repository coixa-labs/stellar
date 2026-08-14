/**
 * Stellar Chain Library - Wallet Utilities
 * 
 * BIP39 mnemonic and seed generation utilities
 */

import * as bip39 from "bip39";
import type { Buffer } from "buffer";

export class WalletUtils {
  static generateMnemonic(strength: 128 | 256 = 256): string {
    return bip39.generateMnemonic(strength);
  }

  static validateMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic);
  }

  static mnemonicToSeed(mnemonic: string): Buffer {
    return bip39.mnemonicToSeedSync(mnemonic);
  }
}
