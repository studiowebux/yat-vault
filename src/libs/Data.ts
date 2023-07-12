import { readFileSync, writeFileSync } from "fs";
import path from "node:path";
import { load, dump } from "js-yaml";
import Encryption from "./Encryption";
import { isBase64 } from "./Utils";
import AwsLoader from "./Loader/aws.ssm";
import { configurations, secret, IAWS, IOverride } from "../types/types";
import { LogInfo, LogSuccess, LogWarn } from "./Help";
import { Color } from "./Colors";

export default class Data {
  private secretFilename: string;
  private secretPath: string;
  private configurations: configurations | null;
  private values: Array<secret> | null;

  private awsLoader: AwsLoader | null;

  constructor(secretFilename: string) {
    this.secretFilename = path.basename(secretFilename);
    this.secretPath = path.dirname(secretFilename);
    const data = this.Load();

    this.configurations = data.configurations;
    this.values = data.values;

    if (this.configurations?.aws) {
      this.awsLoader = new AwsLoader(this.configurations?.aws?.awsRegion);
    } else {
      this.awsLoader = null;
    }
  }

  public Save() {
    writeFileSync(
      path.resolve(path.join(this.secretPath, this.secretFilename)),
      dump({ _values: this.values, _configurations: this.configurations })
    );
  }

  public Load(): { configurations: configurations; values: Array<secret> } {
    const data = load(
      readFileSync(
        path.resolve(path.join(this.secretPath, this.secretFilename)),
        { encoding: "utf-8" }
      )
    ) as { _configurations: configurations; _values: Array<secret> };

    return {
      configurations: data._configurations,
      values: data._values,
    };
  }

  private ExtractKeyValue(value: string) {
    return isBase64(value)
      ? Buffer.from(value, "base64").toString("utf-8")
      : value;
  }

  /**
   *
   * @param skipCloudConfig Allow to upload and update the keys in AWS by using the one stored locally
   * @returns
   */
  public async GetPrivateKey(
    skipCloudConfig: boolean = false
  ): Promise<string | undefined> {
    let filename = null;

    if (!skipCloudConfig && this.configurations?.aws?.privateKeyPath) {
      try {
        LogInfo(
          `Trying to get Private Key from AWS SSM: ${this.configurations?.aws.privateKeyPath}`
        );
        const key = await this.awsLoader?.LoadPrivateKey(
          this.configurations?.aws.privateKeyPath
        );
        return Promise.resolve(key);
      } catch (e: any) {
        LogWarn(
          `aws.ssm: Path defined but '${e.message}' - '${this.configurations.aws.awsRegion}' -> '${this.configurations.aws.privateKeyPath}'`
        );
      }
    }
    if (this.configurations?.privateKeyPath) {
      LogInfo(
        `Trying to get Private Key from Local Disk: ${this.configurations?.privateKeyPath}`
      );
      filename = this.configurations?.privateKeyPath;
    }
    if (process.env.PRIVATE_KEY) {
      LogInfo(`Trying to get Private Key from environment variable`);
      return Promise.resolve(this.ExtractKeyValue(process.env.PRIVATE_KEY));
    }

    if (filename) {
      return Promise.resolve(
        readFileSync(path.resolve(path.join(this.secretPath, filename)), {
          encoding: "utf-8",
        }).toString()
      );
    }

    LogWarn(
      "No private key defined. You will be unable to Encrypt or Decrypt secrets"
    );
  }

  /**
   *
   * @param skipCloudConfig Allow to upload and update the keys in AWS by using the one stored locally
   * @returns
   */
  public async GetPublicKey(
    skipCloudConfig: boolean = false
  ): Promise<string | undefined> {
    let filename = null;

    if (!skipCloudConfig && this.configurations?.aws?.publicKeyPath) {
      LogInfo(
        `Trying to get Public Key from AWS SSM: ${this.configurations?.aws.publicKeyPath}`
      );
      try {
        const key = await this.awsLoader?.LoadPublicKey(
          this.configurations?.aws.publicKeyPath
        );
        return Promise.resolve(key);
      } catch (e: any) {
        LogWarn(
          `aws.ssm: Path defined but '${e.message}' - '${this.configurations.aws.awsRegion}' -> '${this.configurations.aws.publicKeyPath}'`
        );
      }
    }
    if (this.configurations?.publicKeyPath) {
      LogInfo(
        `Trying to get Public Key from Local Disk: ${this.configurations?.publicKeyPath}`
      );
      filename = this.configurations?.publicKeyPath;
    }
    if (process.env.PUBLIC_KEY) {
      LogInfo(`Trying to get Public Key from environment variable`);
      return Promise.resolve(this.ExtractKeyValue(process.env.PUBLIC_KEY));
    }

    if (filename) {
      return Promise.resolve(
        readFileSync(path.resolve(path.join(this.secretPath, filename)), {
          encoding: "utf-8",
        }).toString()
      );
    }

    LogWarn("No public key defined. You will be unable to Encrypt secrets");
  }

  public GetValues(): Array<secret> | null {
    return this.values;
  }

  public GetKeyValue(): any {
    if (this.values && this.values?.length > 0)
      return Object.fromEntries(
        this.values.map((value) => [value.name || value.envName, value.value])
      );
  }

  public HasSecrets(): boolean {
    if (!this.values) return false;

    const hasSecrets =
      this.values?.filter((value) => value.type === "SecureString").length > 0;

    if (hasSecrets) {
      LogInfo("Configuration contains secret(s), will load keys");
    }
    return hasSecrets;
  }

  public EncryptValues(encryption: Encryption): void {
    this.setValues(
      this.values?.map((value) => {
        if (
          value.type === "SecureString" &&
          !value.value.toString().startsWith("$enc:")
        ) {
          LogInfo(
            `Encrypting ${Color(value.name || "No Name Defined", "FgGray")}...`
          );
          value.value = `$enc:${encryption
            .EncryptData(Buffer.from(value.value.toString()))
            .toString("base64")}`;
          LogSuccess(
            `${Color(value.name || "No Name Defined", "FgGray")} encrypted.`
          );
        }

        return value;
      }) || []
    );
  }

  private setValues(data: Array<secret>) {
    this.values = data;
  }

  private async handleDefaultsAndOverrides(
    overrides: IOverride
  ): Promise<Array<secret>> {
    return Promise.all(
      this.values?.map(async (value) => {
        this.applyOverrides(value, overrides);
        this.applyDefaults(value);

        return value;
      }) || []
    );
  }

  private applyOverrides(value: secret, overrides: IOverride) {
    // Apply overrides if any
    if (overrides && Object.keys(overrides).length > 0) {
      Object.keys(overrides).forEach((key) => {
        value.value = value.value.toString().replaceAll(
          new RegExp(`\\$\\{(${key})\\}|\\$\\{(${key}:-(.*?))\\}`, "g"), // `\\$\\{${key}.*?\\}`
          overrides[key]
        );
      });
      LogSuccess(
        `Applied overrides for ${Color(
          value.name || "No Name Defined",
          "FgGray"
        )}`
      );
    }
  }

  private applyDefaults(value: secret) {
    // Apply defaults if any
    // Extract default value if any
    const regex = new RegExp(`\\$\\{.*?:-(.*?)\\}`);
    const val = value?.value?.toString().match(regex);
    if (val && val.length > 0) {
      // Replace the variable with the default value
      value.value = value.value
        .toString()
        .replaceAll(
          new RegExp(
            `\\$\\{[\\w\\d\\s]+:-[\\w\\d\\s\\!\\@\\#\\$\\%\\^\\&\\*\\)\\(\\+\\=\\.\\_\\-\\/\\:\\?]+\\}`,
            "g"
          ),
          val[1].toString()
        );
      LogSuccess(
        `Applied defaults for ${Color(
          value.name || "No Name Defined",
          "FgGray"
        )}`
      );
    }
  }

  public async DecryptValues(
    encryption: Encryption | undefined,
    passphrase: string = "",
    overrides: IOverride = {}
  ): Promise<Array<secret>> {
    try {
      let values = this.values || [];
      if (encryption) {
        values = await Promise.all(
          this.values?.map(async (value) => {
            // Decrypt secrets.
            if (value.type === "SecureString") {
              LogInfo(
                `Decrypting ${Color(value.name || "No Name Defined", "FgGray")}`
              );
              value.value = (
                await encryption.DecryptData(
                  Buffer.from(
                    value.value.toString().split("$enc:")[1],
                    "base64"
                  ),
                  passphrase || process.env.PASSPHRASE
                )
              ).toString();

              LogSuccess(
                `${Color(value.name || "No Name Defined", "FgGray")} decrypted.`
              );
            }
            return value;
          }) || []
        );
      }

      // Handle defaults and overrides
      values = await this.handleDefaultsAndOverrides(overrides);

      return Promise.resolve(values);
    } catch (e) {
      throw e;
    }
  }

  public GetConfig(provider: string): IAWS | null {
    // @ts-ignore
    if (!this.configurations || !this.configurations[provider])
      throw new Error("Provider configuration not found.");

    // @ts-ignore
    return this.configurations ? this.configurations[provider] : null;
  }

  public GetVariables(): Array<string | number> | undefined {
    return this.configurations?.variables;
  }
}
