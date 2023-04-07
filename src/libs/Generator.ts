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
        },
      ],
      _configurations: {
        publicKeyPath: "",
        privateKeyPath: "",
        variables: [],
        aws: {
          privateKeyPath: "/yat-vault/private-key",
          publicKeyPath: "/yat-vault/public-key",
          awsRegion: "",
          regions: ["NOT_IMPLEMENTED"],
          roleToAssume: "NOT_IMPLEMENTED",
        },
      },
    });
  }
}
