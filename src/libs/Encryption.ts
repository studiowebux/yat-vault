import {
  generateKeyPairSync,
  privateDecrypt,
  publicEncrypt,
} from "node:crypto";

export default class Encryption {
  private privateKey;
  private publicKey;

  constructor(privateKey: string, publicKey: string) {
    if (!privateKey) throw new Error("Missing Private Key");
    if (!publicKey) throw new Error("Missing Public Key");

    this.privateKey = privateKey;
    this.publicKey = publicKey;
  }

  public static HasKeyPair(
    privateKey: string | undefined,
    publicKey: string | undefined
  ): boolean {
    if (!privateKey || !publicKey) return false;
    return true;
  }

  public static GenerateKeyPair(
    passphrase: string = "",
    cipher: string = "aes-256-cbc",
    modulusLength: number = 4096
  ): { publicKey: string; privateKey: string } {
    return generateKeyPairSync("rsa", {
      modulusLength,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
        cipher,
        passphrase,
      },
    });
  }

  public EncryptData(data: Buffer): Buffer {
    return publicEncrypt(this.publicKey, data);
  }

  public async DecryptData(
    data: Buffer,
    passphrase: string = ""
  ): Promise<Buffer> {
    try {
      return privateDecrypt(
        { key: this.privateKey, passphrase: passphrase },
        data
      );
    } catch (e) {
      if (
        e.message.includes("error:1E08010C:DECODER routines::unsupported") ||
        e.message.includes("error:1C800064:Provider routines::bad decrypt")
      ) {
        // TODO: Need to handle this case properly and ask the passphrase if required and TTY available.
        throw new Error("Probably missing Passphrase");
      }

      throw e;
    }

  }
}
