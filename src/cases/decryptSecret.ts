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
  const encryption = new Encryption(data.GetPrivateKey(), data.GetPublicKey());
  const values = await data.DecryptValues(encryption);

  // Print on console
  console.table(values);
}
