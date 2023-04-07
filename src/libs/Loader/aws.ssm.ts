import {
  GetParameterCommand,
  PutParameterCommand,
  SSMClient,
} from "@aws-sdk/client-ssm";
import Loader from "../Loader";

export default class AwsLoader extends Loader {
  private client: SSMClient | undefined;

  constructor(region: string) {
    super();
    this.client = new SSMClient({ region: region });
  }

  public async LoadPrivateKey(privateKeyPath: string): Promise<string> {
    const response = await this.client?.send(
      new GetParameterCommand({
        Name: privateKeyPath,
        WithDecryption: true,
      })
    );

    this.privateKey = Buffer.from(
      response?.Parameter?.Value as string,
      "base64"
    ).toString("utf-8");

    return Promise.resolve(this.privateKey);
  }

  public async LoadPublicKey(publicKeyPath: string): Promise<string> {
    const response = await this.client?.send(
      new GetParameterCommand({
        Name: publicKeyPath,
        WithDecryption: true,
      })
    );

    this.publicKey = Buffer.from(
      response?.Parameter?.Value as string,
      "base64"
    ).toString("utf-8");

    return Promise.resolve(this.publicKey);
  }

  public GetKeys(): {
    privateKey: string | undefined;
    publicKey: string | undefined;
  } {
    return {
      privateKey: this.privateKey,
      publicKey: this.publicKey,
    };
  }

  public async UploadKey(path: string, value: string): Promise<void> {
    await this.client?.send(
      new PutParameterCommand({
        Name: path,
        Value: value,
        Type: "SecureString",
        Tier: "Intelligent-Tiering",
        Overwrite: true,
      })
    );
  }

  public async UploadKeys(
    privateKeyPath: string,
    publicKeyPath: string,
    privateKey: string,
    publicKey: string
  ): Promise<void> {
    await this.UploadKey(
      privateKeyPath,
      Buffer.from(privateKey).toString("base64")
    );
    await this.UploadKey(
      publicKeyPath,
      Buffer.from(publicKey).toString("base64")
    );
  }
}
