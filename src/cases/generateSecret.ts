import Data from "../libs/Data";
import Input from "../libs/Input";
import Writer from "../libs/Writer";

const input = new Input();

export default async function GenerateSecret(filename: string) {
  // Inputs
  const _filename =
    process.env.FILENAME || filename || (await input.ReadInput("File Name: "));

  // Verifications
  if (!_filename) throw new Error("Missing File Name.");

  // Processing
  const content = Data.CreateSecretFile();

  // Save to disk
  Writer.Save(`${_filename}.yml`, content);
}
