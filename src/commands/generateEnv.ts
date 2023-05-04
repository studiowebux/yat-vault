import { Color } from "../libs/Colors";
import { decryptSecret } from "../libs/CommandHelper";
import Data from "../libs/Data";
import Encryption from "../libs/Encryption";
import { LogInfo, LogSuccess } from "../libs/Help";
import Input from "../libs/Input";
import Override from "../libs/Override";
import Writer from "../libs/Writer";
import { secret } from "../types/types";

const input = new Input();

export default async function GenerateEnv(
  filename: string,
  envFilename: string,
  overrides: string
) {
  // Variables
  let overrideValues = {};

  // Inputs
  const _filename =
    process.env.FILENAME || filename || (await input.ReadInput("File Name: "));
  const _envFilename =
    process.env.ENV_FILENAME ||
    envFilename ||
    (await input.ReadInput("Env File Name: "));

  // Verifications
  if (!_filename) throw new Error("Missing File Name.");
  if (!_envFilename) throw new Error("Missing Env File Name.");

  // Overrides
  if (overrides) {
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
    }
  }

  // Decrypt values
  let values: secret[] = [];
  values = await decryptSecret(data, encryption, overrideValues);

  let content = "";
  if (process.env.WITHOUT_QUOTES) {
    LogInfo("Saving values without quotes");
    content = values
      .map((value) => `${value.envName}=${value.value}`)
      .join("\n");
  } else {
    LogInfo("Saving values with double quotes");
    content = values
      .map((value) => `${value.envName}="${value.value}"`)
      .join("\n");
  }

  Writer.Save(_envFilename, content);

  // Output
  LogSuccess(`${Color(_envFilename, "Bold")} file Generated !`);
}
