import { dump } from "js-yaml";

export default class Generator {
  constructor() {}

  public static CreateSecretFile(): string {
    return dump({
      _values: [
        {
          name: "",
          value: "",
          description: "",
          type: "String|SecureString|StringList",
          overwrite: false,
          envName: "",
        },
      ],
      _configurations: {
        publicKeyPath: "",
        privateKeyPath: "",
        variables: [],
        aws: {
          privateKeyPath: "/yat-vault/private-key",
          publicKeyPath: "/yat-vault/public-key",
          awsRegion: "us-east-1",
          regions: ["us-east-1"],
        },
      },
    });
  }
}
