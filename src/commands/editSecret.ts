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

  if (data.HasSecrets()) {
    const privateKey = (await data.GetPrivateKey()) as string;
    const publicKey = (await data.GetPublicKey()) as string;
    if (Encryption.HasKeyPair(privateKey, publicKey)) {
      const encryption = new Encryption(privateKey, publicKey);
      data.EncryptValues(encryption);
    } else {
      throw new Error(
        "Unable to encrypt the file, missing public and/or private keys. The file has been ALTERED and NOT encrypted."
      );
    }
  }

  // Save to disk
  data.Save();

  // Output
  console.log("SUCCESS: File Saved !");
}
