export default abstract class Loader {
  protected privateKey: string;
  protected publicKey: string;

  constructor() {
    this.privateKey = "";
    this.publicKey = "";
  }

  abstract LoadPrivateKey(privateKeyPath: string): Promise<string>;
  abstract LoadPublicKey(publicKeyPath: string): Promise<string>;

  abstract GetKeys(): {
    privateKey: string | undefined;
    publicKey: string | undefined;
  };
}
