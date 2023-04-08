import Data from "../libs/Data";
import Encryption from "../libs/Encryption";
import Input from "../libs/Input";
import Writer from "../libs/Writer";

const input = new Input();

export default async function GenerateEnv(
  filename: string,
  envFilename: string
) {
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

  let content = "";
  if (process.env.WITHOUT_QUOTES) {
    content = values
      .map((value) => `${value.envName}=${value.value}`)
      .join("\n");
  } else {
    content = values
      .map((value) => `${value.envName}="${value.value}"`)
      .join("\n");
  }

  Writer.Save(_envFilename, content);

  // Output
  console.log("SUCCESS: .env file Generated !");
}
