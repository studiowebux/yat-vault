import * as readline from "node:readline";

interface IAWS {
  privateKeyPath: string;
  publicKeyPath: string;
  regions: Array<string>;
  awsRegion: string;
}

interface configurations {
  publicKeyPath: string;
  privateKeyPath: string;
  variables: Array<string | number>;
  aws: IAWS;
}

interface secret {
  name: string | undefined;
  description?: string;
  value: string | number;
  type: "String" | "SecureString" | "StringList" | undefined;
  overwrite: boolean | undefined;
  envName?: string;
}

interface RLInterface extends readline.Interface {
  _writeToOutput?: Function;
  output?: any;
}

interface IOverride {
  [key: string]: string;
}
