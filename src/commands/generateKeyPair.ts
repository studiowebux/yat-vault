import Encryption from "../libs/Encryption";
import Writer from "../libs/Writer";
import Input from "../libs/Input";
import Reader from "../libs/Reader";
import { LogSuccess, LogWarn } from "../libs/Help";
import { Color } from "../libs/Colors";

const input = new Input();

export default async function GenerateKeyPair(keyname: string) {
  // Inputs
  const _keyname =
    process.env.KEYNAME || keyname || (await input.ReadInput("Key Name: "));
  const _passphrase =
    process.env.PASSPHRASE || (await input.ReadInputHidden("Passphrase: "));

  // Verifications
  if (!_keyname) throw new Error("Missing Key Name.");
  if (!_passphrase) LogWarn("No Passphrase provided.");
  if (Reader.Exists(`${_keyname}.pub`) || Reader.Exists(`${_keyname}.key`))
    throw new Error("The key pair already exists.");

  // Processing
  const { privateKey, publicKey } = Encryption.GenerateKeyPair(_passphrase);

  // Save to disk
  Writer.Save(`${_keyname}.pub`, publicKey);
  Writer.Save(`${_keyname}.key`, privateKey);

  // Output
  LogSuccess(
    `Key Pair Generated at ${Color(
      `'${_keyname}.pub and ${_keyname}.key'`,
      "Bold"
    )} !`
  );
}
