import Data from "../libs/Data";
import Encryption from "../libs/Encryption";
import Input from "../libs/Input";
import { secret } from "../types/types";

const input = new Input();

export default async function DecryptSecret(filename: string) {
  // Inputs
  const _filename =
    process.env.FILENAME || filename || (await input.ReadInput("File Name: "));

  // Verifications
  if (!_filename) throw new Error("Missing File Name.");

  // Processing
  const data = new Data(_filename);
  let encryption: Encryption | undefined;
  if (data.HasSecrets()) {
    const privateKey = (await data.GetPrivateKey()) as string;
    const publicKey = (await data.GetPublicKey()) as string;
    if (Encryption.HasKeyPair(privateKey, publicKey)) {
      encryption = new Encryption(privateKey, publicKey);
    }
  }

  let values: secret[] = [];
  try {
    values = await data.DecryptValues(encryption);
  } catch (e: any) {
    // Try to ask for a passphrase
    if (process.env.NO_TTY === "true") {
      // NO TTY, throw error
      throw e;
    }
    if (e.message.includes("ERR_DECRYPTION")) {
      const passphrase = await input.ReadInputHidden("Passphrase: ");
      values = await data.DecryptValues(encryption, passphrase);
    }
  }

  // Print on console
  if (!values || values.length === 0) return;
  console.table(values);

  // Output
  console.log("SUCCESS: Values Decrypted !");
}
