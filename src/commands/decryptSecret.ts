import Data from "../libs/Data";
import Encryption from "../libs/Encryption";
import Input from "../libs/Input";

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

  const values = await data.DecryptValues(encryption);

  // Print on console
  console.table(values);

  // Output
  console.log("SUCCESS: Values Decrypted !");
}
