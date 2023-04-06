import Data from "../libs/Data";
import Encryption from "../libs/Encryption";
import Input from "../libs/Input";
import Writer from "../libs/Writer";

const input = new Input();

export default async function EditSecret(filename: string) {
  // Inputs
  const _filename =
    process.env.FILENAME || filename || (await input.ReadInput("File Name: "));

  // Verifications
  if (!_filename) throw new Error("Missing File Name.");

  // Processing
  Writer.Write(_filename);
  const data = new Data(_filename);
  const encryption = new Encryption(data.GetPrivateKey(), data.GetPublicKey());
  data.EncryptValues(encryption);

  // Save to disk
  data.Save();
}
