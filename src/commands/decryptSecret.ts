import { decryptSecret } from "../libs/CommandHelper";
import Data from "../libs/Data";
import Encryption from "../libs/Encryption";
import Input from "../libs/Input";
import Override from "../libs/Override";
import { secret } from "../types/types";
import { Info, Success } from "../libs/Help";
import { printValues } from "../libs/Print";

const input = new Input();

export default async function DecryptSecret(
  filename: string,
  overrides: string
) {
  // Variables
  let overrideValues = {};

  // Inputs
  const _filename =
    process.env.FILENAME || filename || (await input.ReadInput("File Name: "));

  // Verifications
  if (!_filename) throw new Error("Missing File Name.");

  // Overrides
  if (overrides) {
    Info("Overrides is defined. Will load the values and apply the changes.");
    const override = new Override(overrides);
    overrideValues = override.Load();
  }

  // Processing
  const data = new Data(_filename);
  let encryption: Encryption | undefined;
  if (data.HasSecrets()) {
    const privateKey = (await data.GetPrivateKey()) as string;
    const publicKey = (await data.GetPublicKey()) as string;
    if (Encryption.HasKeyPair(privateKey, publicKey)) {
      encryption = new Encryption(privateKey, publicKey);
    } else {
      throw new Error("Unable to decrypt the file, missing keys.");
    }
  }

  // Decrypt values
  let values: secret[] = [];
  values = await decryptSecret(data, encryption, overrideValues);

  // Print on console
  if (!values || values.length === 0) return;
  printValues(values);

  // Output
  Success("Values Decrypted !");
}
