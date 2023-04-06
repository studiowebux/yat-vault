import { readFileSync, writeFileSync } from "fs";
import { load, dump } from "js-yaml";
import Encryption from "./Encryption";

interface configurations {
  publicKeyPath: string;
  privateKeyPath: string;
  aws: { privateKeyPath: string; publicKeyPath: string; awsRegion: string };
}

interface secret {
  name: string;
  description: string;
  value: string | number;
  type: "String" | "SecureString" | "StringList";
}

export default class Data {
  private secretFilename: string;
  private configurations: configurations | null;
  private values: Array<secret> | null;

  constructor(secretFilename: string) {
    this.secretFilename = secretFilename;
    const data = this.Load();

    this.configurations = data.configurations;
    this.values = data.values;
  }

  public Save() {
    writeFileSync(
      this.secretFilename,
      dump({ _values: this.values, _configurations: this.configurations })
    );
  }

  public Load(): { configurations: configurations; values: Array<secret> } {
    const data = load(
      readFileSync(this.secretFilename, { encoding: "utf-8" })
    ) as { _configurations: configurations; _values: Array<secret> };

    return {
      configurations: data._configurations,
      values: data._values,
    };
  }

  public GetPrivateKey(): string {
    let filename = null;

    if (this.configurations?.aws.privateKeyPath)
      filename = this.configurations?.aws.privateKeyPath;
    if (this.configurations?.privateKeyPath)
      filename = this.configurations?.privateKeyPath;
    if (process.env.PRIVATE_KEY) return process.env.PRIVATE_KEY;

    if (filename) {
      return readFileSync(filename, { encoding: "utf-8" }).toString();
    }

    throw new Error("No private key defined.");
  }

  public GetPublicKey(): string {
    let filename = null;

    if (this.configurations?.aws.publicKeyPath)
      filename = this.configurations?.aws.publicKeyPath;
    if (this.configurations?.publicKeyPath)
      filename = this.configurations?.publicKeyPath;
    if (process.env.PUBLIC_KEY) return process.env.PUBLIC_KEY;

    if (filename) {
      return readFileSync(filename, { encoding: "utf-8" }).toString();
    }

    throw new Error("No public key defined.");
  }

  public GetValues(): Array<secret> | null {
    return this.values;
  }

  public GetKeyValue(): any {
    if (this.values && this.values?.length > 0)
      return Object.fromEntries(
        this.values.map((value) => [value.name, value.value])
      );
  }

  public static CreateSecretFile(): string {
    return dump({
      _values: [
        {
          name: "",
          value: "",
          description: "",
          type: "String|SecureString|StringList",
        },
      ],
      _configurations: {
        publicKeyPath: "",
        privateKeyPath: "",
        aws: {
          publicKeyPath: "",
          privateKeyPath: "",
          awsRegion: "",
        },
      },
    });
  }

  public EncryptValues(encryption: Encryption): void {
    this.setValues(
      this.values?.map((value) => {
        if (
          value.type === "SecureString" &&
          !value.value.toString().startsWith("$enc:")
        )
          value.value = `$enc:${encryption
            .EncryptData(Buffer.from(value.value.toString()))
            .toString("base64")}`;
        return value;
      }) || []
    );
  }

  private setValues(data: Array<secret>) {
    this.values = data;
  }

  public async DecryptValues(encryption: Encryption): Promise<Array<secret>> {
    const values = await Promise.all(
      this.values?.map(async (value) => {
        if (value.type === "SecureString")
          value.value = (
            await encryption.DecryptData(
              Buffer.from(value.value.toString().split("$enc:")[1], "base64")
            )
          ).toString();
        return value;
      }) || []
    );

    return Promise.resolve(values);
  }
}
